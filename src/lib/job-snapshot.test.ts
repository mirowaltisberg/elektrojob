import assert from "node:assert/strict";
import test from "node:test";
import { createJobSnapshotLoader } from "./job-snapshot";

test("an empty live catalogue stays empty even when bundled jobs exist", async () => {
  let fallbackCalls = 0;
  let reads = 0;
  const load = createJobSnapshotLoader({
    readPage: async () => { reads++; return []; },
    fallback: () => { fallbackCalls++; return ["removed-job"]; },
    pageSize: 2,
    ttlMs: 100,
    now: () => 0,
  });
  assert.deepEqual(await load(), []);
  assert.deepEqual(await load(), []);
  assert.equal(reads, 1);
  assert.equal(fallbackCalls, 0);
});

test("pagination publishes every page as one snapshot shared by concurrent readers", async () => {
  const ranges: number[][] = [];
  const load = createJobSnapshotLoader({
    readPage: async (from, to) => {
      ranges.push([from, to]);
      return ["first", "second", "third"].slice(from, to + 1);
    },
    fallback: () => [],
    pageSize: 2,
    ttlMs: 100,
  });
  const [list, detail] = await Promise.all([load(), load()]);
  assert.deepEqual(list, ["first", "second", "third"]);
  assert.equal(detail, list);
  assert.deepEqual(ranges, [[0, 1], [2, 3]]);
});

test("a failed later page never publishes a truncated live catalogue", async () => {
  const load = createJobSnapshotLoader({
    readPage: async (from) => {
      if (from === 0) return ["first", "second"];
      throw new Error("database unavailable");
    },
    fallback: () => ["complete-local-snapshot"],
    pageSize: 2,
    ttlMs: 100,
  });
  assert.deepEqual(await load(), ["complete-local-snapshot"]);
});

test("a refreshed source removes disappeared jobs for list and detail consumers", async () => {
  let now = 0;
  let jobs = ["removed-job", "current-job"];
  const load = createJobSnapshotLoader({
    readPage: async (from, to) => jobs.slice(from, to + 1),
    fallback: () => ["removed-job"],
    pageSize: 10,
    ttlMs: 100,
    now: () => now,
  });
  const before = await load();
  assert.equal(before.includes("removed-job"), true);
  jobs = ["current-job"];
  now = 100;
  const after = await load();
  assert.notEqual(after, before);
  assert.equal(after.find((id) => id === "removed-job"), undefined);
  assert.deepEqual(after, ["current-job"]);
});
