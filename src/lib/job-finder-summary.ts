import type { JobListing } from "./job-types";
export type FinderSwipe = { jobId: string; choice: "like" | "pass" };

function oneLine(value: string, limit = 200): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/gu, " ")
    .replace(/\s+/gu, " ").trim().slice(0, limit);
}

/** Only explicit selections are evidence of interest; the latest choice wins. */
export function buildInterestSummary(jobs: JobListing[], swipes: FinderSwipe[]): string {
  const catalogue = new Map<string, JobListing>();
  for (const job of jobs) if (!catalogue.has(job.id)) catalogue.set(job.id, job);
  const decisions = new Map<string, FinderSwipe["choice"]>();
  for (const swipe of swipes) {
    if (swipe.jobId && (swipe.choice === "like" || swipe.choice === "pass")) {
      decisions.set(swipe.jobId, swipe.choice);
    }
  }
  const likedIds = [...decisions].filter(([, choice]) => choice === "like").map(([id]) => id);
  const passed = decisions.size - likedIds.length;
  const likedJobs = likedIds.flatMap((id) => {
    const job = catalogue.get(id);
    return job ? [job] : [];
  });
  const missing = likedIds.length - likedJobs.length;
  const lines = [
    "Interessen aus dem Job-Finder",
    `Beurteilte Stellen: ${decisions.size}`,
    `Interessant: ${likedIds.length}`,
    `Übersprungen: ${passed}`,
    "",
  ];
  if (likedIds.length === 0) {
    lines.push(decisions.size === 0
      ? "Es wurden noch keine Stellen beurteilt. Es liegen noch keine konkreten Jobinteressen vor."
      : "Keine Stelle wurde als interessant markiert. Daraus lassen sich keine konkreten Jobinteressen ableiten.");
  } else if (likedJobs.length > 0) {
    const values = (field: "title" | "location" | "workload") => [...new Set(
      likedJobs.map((job) => oneLine(job[field])).filter(Boolean),
    )].join("; ") || "Keine Angabe in den ausgewählten Stellen";
    lines.push(
      "Angaben aus den als interessant markierten Stellen:",
      `Tätigkeiten: ${values("title")}`,
      `Arbeitsorte: ${values("location")}`,
      `Pensen: ${values("workload")}`,
      "",
      "Ausgewählte Stellen:",
    );
    for (const job of likedJobs) {
      lines.push(
        `- ${oneLine(job.title) || "Stellentitel nicht angegeben"} · ${oneLine(job.location) || "Ort nicht angegeben"} · ${oneLine(job.workload) || "Pensum nicht angegeben"}`,
        `  https://www.elektrojob.ch/jobs/${encodeURIComponent(job.id)}`,
      );
    }
  }
  if (missing > 0) {
    lines.push("", `Für ${missing} als interessant markierte Stelle(n) liegen keine Stellendetails mehr vor. Dazu werden keine Tätigkeiten, Orte oder Pensen angenommen.`);
  }
  lines.push("", "Diese Auswahl zeigt Interesse und ist keine Bewerbung auf die einzelnen Stellen.");
  return lines.join("\n");
}
