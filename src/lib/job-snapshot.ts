/** A complete catalogue snapshot shared by lists and individual job lookups. */
export function createJobSnapshotLoader<T>(options: {
  readPage: (from: number, to: number) => Promise<T[]>;
  fallback: () => T[];
  pageSize: number;
  ttlMs: number;
  now?: () => number;
}): () => Promise<T[]> {
  const now = options.now ?? Date.now;
  let snapshot: T[] | null = null;
  let loadedAt = 0;
  let pending: Promise<T[]> | null = null;

  return async () => {
    if (snapshot !== null && now() - loadedAt < options.ttlMs) return snapshot;
    if (pending) return pending;

    pending = (async () => {
      let jobs: T[];
      try {
        jobs = [];
        for (let from = 0; ; from += options.pageSize) {
          const page = await options.readPage(from, from + options.pageSize - 1);
          jobs.push(...page);
          if (page.length < options.pageSize) break;
        }
      } catch {
        // A failed later page must never publish a truncated live catalogue.
        jobs = options.fallback();
      }
      // An empty successful response is authoritative: removed jobs stay removed.
      snapshot = jobs;
      loadedAt = now();
      return jobs;
    })();

    try {
      return await pending;
    } finally {
      pending = null;
    }
  };
}
