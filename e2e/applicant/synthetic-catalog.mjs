import { createServer } from "node:http";

// Only this invented listing reaches the server render. No live catalogue,
// application endpoint or file storage is needed by this pre-submission suite.
const job = {
  id: "scraped-elektro-abcdef123456",
  title: "Elektroinstallateur EFZ – Teststelle",
  company: "Erfundene Testfirma",
  location: "Zürich, ZH",
  type: "Festanstellung",
  workload: "100%",
  description: "Erfundene Stelle für lokale Oberflächenprüfungen. Elektroinstallation und Wartung.",
  full_description: "Elektroinstallateur EFZ für Elektroinstallation und Wartung in Zürich.",
  responsibilities: ["Elektroinstallation und Wartung"],
  requirements: ["Elektroinstallateur EFZ"],
  date_posted: new Date().toISOString(),
  is_new: false,
  is_urgent: false,
  salary: "",
  is_remote: false,
};

createServer((request, response) => {
  if (request.method !== "GET") {
    response.writeHead(405).end();
    return;
  }
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(request.url?.startsWith("/rest/v1/scrape_metadata")
    ? { scraped_at: new Date().toISOString(), total_jobs: 1 }
    : [job]));
}).listen(3113, "127.0.0.1");
