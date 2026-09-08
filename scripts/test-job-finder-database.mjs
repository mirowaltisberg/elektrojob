// Expliziter Integrationstest: nur eigene Testdatensätze, abschliessende Löschung.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const run = randomUUID();
const ids = [];
const jobs = Array.from({ length: 20 }, (_, n) => ({ id: `test-${run}-${n}`, title: 'TEST Elektromonteur', location: 'Zürich', workload: '80–100%' }));
const fixture = (overrides = {}) => {
  const id = randomUUID(); ids.push(id);
  return { id, name: `TEST Jobfinder ${run}`, cv_path: `job-finder/${id}.pdf`, cv_filename: 'TEST.pdf', cv_sha256: 'a'.repeat(64), jobs, synthetic: true, ip_hash: run, ...overrides };
};
async function rpc(name, params) { const r = await db.rpc(name, params); assert.equal(r.error, null, `${name}: ${r.error?.message}`); return r.data; }
try {
  const seed = fixture();
  await rpc('create_job_finder_session', { p_session: seed });
  const repeat = await Promise.all(Array.from({ length: 10 }, () => rpc('create_job_finder_session', { p_session: seed })));
  assert(repeat.every((row) => row.id === seed.id));
  let pending = await db.from('job_finder_deliveries').select('kind').eq('session_id', seed.id);
  assert.equal(pending.data.length, 0, 'No email queued before confirmed PDF');
  const beforeUpload = await db.rpc('record_job_finder_swipe', { p_id: seed.id, p_job_id: jobs[0].id, p_choice: 'like' });
  assert(beforeUpload.error?.message.includes('finder_expired'));
  await rpc('confirm_job_finder_cv', { p_id: seed.id });
  await rpc('confirm_job_finder_cv', { p_id: seed.id });
  pending = await db.from('job_finder_deliveries').select('kind').eq('session_id', seed.id);
  assert.deepEqual(pending.data.map((r) => r.kind), ['cv']);
  const claims = await Promise.all(Array.from({ length: 10 }, () => rpc('claim_job_finder_delivery', { p_id: seed.id, p_kind: 'cv' })));
  assert.equal(claims.filter(Boolean).length, 1, 'Exactly one sender owns a concurrent delivery');
  await Promise.all(jobs.map((job) => rpc('record_job_finder_swipe', { p_id: seed.id, p_job_id: job.id, p_choice: 'like' })));
  await Promise.all(Array.from({ length: 10 }, () => rpc('record_job_finder_swipe', { p_id: seed.id, p_job_id: jobs[0].id, p_choice: 'like' })));
  const record = await db.from('job_finder_sessions').select('*').eq('id', seed.id).single();
  assert.equal(record.data.swipes.length, 20, 'No lost updates or duplicated choices');
  const foreign = await db.rpc('record_job_finder_swipe', { p_id: seed.id, p_job_id: 'outside-the-deck', p_choice: 'like' });
  assert(foreign.error?.message.includes('finder_invalid_choice'));
  const changed = await db.rpc('record_job_finder_swipe', { p_id: seed.id, p_job_id: jobs[0].id, p_choice: 'pass' });
  assert(changed.error?.message.includes('finder_choice_conflict'));
  const stale = await db.rpc('finish_job_finder_session', { p_id: seed.id, p_swipes: [], p_summary: 'Veraltet' });
  assert(stale.error?.message.includes('finder_changed'));
  const completed = await rpc('finish_job_finder_session', { p_id: seed.id, p_swipes: record.data.swipes, p_summary: 'TEST: 20 interessante Stellen' });
  const again = await rpc('finish_job_finder_session', { p_id: seed.id, p_swipes: record.data.swipes, p_summary: 'Nicht überschreiben' });
  assert.equal(again.summary, completed.summary);
  const deliveries = await db.from('job_finder_deliveries').select('kind').eq('session_id', seed.id);
  assert.equal(deliveries.data.length, 2);
  const application = await db.from('applications').select('id,job_id,application_kind,source,cv_path,message').eq('id',seed.id).single();
  assert.equal(application.data.job_id,null);
  assert.equal(application.data.application_kind,'profile');
  assert.equal(application.data.source,'synthetic');
  assert.equal(application.data.cv_path,seed.cv_path);
  assert.equal(application.data.message,completed.summary);
  await db.from('job_finder_deliveries').update({ status:'review',lease_until:null }).eq('session_id',seed.id).eq('kind','cv');
  assert.equal(await rpc('claim_job_finder_delivery',{p_id:seed.id,p_kind:'cv'}),null);
  const empty = fixture({ jobs: [] });
  await rpc('create_job_finder_session', { p_session: empty });
  const noChoice = await db.rpc('finish_job_finder_session', { p_id: empty.id, p_swipes: [], p_summary: 'Keine Auswahl' });
  assert(noChoice.error?.message.includes('finder_no_choices'));
  const quota = await Promise.all(Array.from({ length: 6 }, () => db.rpc('create_job_finder_session', { p_session: fixture({ synthetic: false, ip_hash: `quota-${run}` }) })));
  assert.equal(quota.filter((r) => !r.error).length, 3, 'Concurrent quota remains exactly three');
  assert(quota.filter((r) => r.error).every((r) => r.error.message.includes('finder_rate_limit')));
  console.log(JSON.stringify({ success: true, run, checks: ['private_upload_reservation', 'duplicate_start', 'duplicate_confirm', 'parallel_claim', 'parallel_swipes', 'conflicting_choice', 'out_of_deck', 'stale_summary', 'duplicate_finish', 'manual_review_stops_retries', 'same_application_review_flow', 'empty_deck', 'concurrent_quota'] }));
} finally {
  const appCleanup = await db.from('applications').delete().in('id',ids).eq('application_kind','profile');
  assert.equal(appCleanup.error,null);
  const cleanup = await db.from('job_finder_sessions').delete().in('id', ids);
  assert.equal(cleanup.error, null, 'Own test records must be removed');
  const remaining = await db.from('job_finder_sessions').select('id', { head: true, count: 'exact' }).in('id', ids);
  assert.equal(remaining.count, 0);
  console.log('Eigene Testdatensätze entfernt. Es wurden keine E-Mails versandt.');
}
