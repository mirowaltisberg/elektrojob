import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';

const connection = process.env.JOB_LIFECYCLE_TEST_DB;
if (!connection) throw new Error('JOB_LIFECYCLE_TEST_DB fehlt');
const url = new URL(connection);
if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/job_lifecycle_test' || url.search)
  throw new Error('Nur die lokale Wegwerf-Datenbank job_lifecycle_test ist erlaubt');
const args = [connection, '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-At'];
const sql = value => execFileSync('psql', [...args, '-c', value], { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }).trim();
sql(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;
  DO $$BEGIN CREATE ROLE anon; EXCEPTION WHEN duplicate_object THEN NULL; END$$;
  DO $$BEGIN CREATE ROLE authenticated; EXCEPTION WHEN duplicate_object THEN NULL; END$$;
  DO $$BEGIN CREATE ROLE service_role BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END$$;
  ALTER ROLE service_role BYPASSRLS;
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;`);
sql(readFileSync(new URL('../supabase/migrations/20260921142130_job_ad_lifecycle.sql', import.meta.url), 'utf8'));
const a = 'a'.repeat(64), b = 'b'.repeat(64);
const stamp = hours => new Date(Date.now() - hours * 3600000).toISOString();
const run = (at, keys, trade = 'elektro') => `SELECT record_job_ad_snapshot('${trade}', '${at}', ARRAY[${keys.map(k => `'${k}'`).join(',')}]::text[])`;
for (const role of ['anon', 'authenticated']) {
  assert.throws(() => sql(`SET ROLE ${role}; SELECT * FROM job_ad_lifecycle`), /permission denied/);
  assert.throws(() => sql(`SET ROLE ${role}; ${run(stamp(23), [a])}`), /permission denied/);
}
assert.equal(sql(`SET ROLE service_role; ${run(stamp(23), [a,b])}`), 't');
const firstMiss = stamp(22);
assert.equal(sql(run(firstMiss, [b])), 't');
assert.equal(sql(run(firstMiss, [b])), 'f');
assert.equal(sql(run(stamp(22.5), [b])), 'f');
assert.equal(sql(`SELECT missing_runs FROM job_ad_lifecycle WHERE source_key='${a}'`), '1');
assert.equal(sql(run(stamp(1), [b])), 't');
assert.equal(sql(`SELECT missing_runs FROM job_ad_lifecycle WHERE source_key='${a}'`), '2');
assert.equal(sql(`SELECT count(*) FROM job_ad_lifecycle WHERE source_key='${a}' AND missing_since='${firstMiss}'`), '1');
for (const bad of [run(stamp(-1),[a]), run(stamp(48),[a]), run(stamp(.5),[]), run(stamp(.5),['bad']), run(stamp(.5),[a],'holz')])
  assert.throws(() => sql(bad), /Invalid completed scrape/);
assert.equal(sql(`SELECT missing_runs FROM job_ad_lifecycle WHERE source_key='${a}'`), '2');
// A fixed observation timestamp is essential for an exact duplicate retry.
const retry = stamp(.05);
const concurrent = await Promise.all([1,2].map(() => promisify(execFile)('psql', [...args,'-c',run(retry,[a,b])])));
assert.deepEqual(concurrent.map(r => r.stdout.trim()).sort(), ['f','t']);
assert.equal(sql(`SELECT missing_runs || ':' || (missing_since IS NULL)::text FROM job_ad_lifecycle WHERE source_key='${a}'`), '0:true');
sql(`INSERT INTO job_ad_lifecycle VALUES ('elektro', '${'c'.repeat(64)}', now()-interval '100 days', now()-interval '99 days', now()-interval '99 days', 1)`);
sql(run(stamp(.01), [a,b]));
assert.equal(sql('SELECT count(*) FROM job_ad_lifecycle'), '2');
console.log('Sichtungsnachweise: Rechte, Fehlversuche, Wiederholungen, Reihenfolge, parallele Läufe und Wiederauftauchen bestanden.');
