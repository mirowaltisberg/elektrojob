import { createServer } from "node:http";

// The server render sees an authoritative empty catalogue, never the live
// database or bundled real listings. Each browser test supplies its own jobs.
const server = createServer((request, response) => {
  if (request.method !== "GET") {
    response.writeHead(405).end();
    return;
  }
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(request.url?.startsWith("/rest/v1/scrape_metadata")
    ? { scraped_at: new Date().toISOString(), total_jobs: 0 }
    : []));
});
server.listen(3111, "127.0.0.1");
