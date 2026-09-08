import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../../next.config";

// Tatsächliche Ressourcentypen aus Googles CSP-Vorgaben prüfen. Ein erlaubtes
// Bild allein genügt nicht: Ads verwendet auch Scripts, Verbindungen und Frames.
const requiredResources: Array<[string, string]> = [
  ["script-src", "https://www.googletagmanager.com/gtag/js"],
  ["script-src", "https://www.googleadservices.com/pagead/conversion_async.js"],
  ["script-src", "https://www.google.com/pagead/1p-conversion/18434284216/"],
  ["script-src", "https://pagead2.googlesyndication.com/pagead/viewthroughconversion/18434284216/"],
  ["script-src", "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/18434284216/"],
  ["connect-src", "https://www.googletagmanager.com/"],
  ["connect-src", "https://www.googleadservices.com/pagead/conversion/18434284216/"],
  ["connect-src", "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/18434284216/"],
  ["connect-src", "https://ad.doubleclick.net/"],
  ["connect-src", "https://pagead2.googlesyndication.com/"],
  ["connect-src", "https://www.google.com/pagead/1p-conversion/18434284216/"],
  ["connect-src", "https://google.com/"],
  ["connect-src", "https://www.google.ch/pagead/1p-conversion/18434284216/"],
  ["frame-src", "https://www.googletagmanager.com/static/service_worker/"],
];

function sources(policy: string, directive: string): string[] {
  const directives = new Map(policy.split(";").map(value => {
    const [name, ...values] = value.trim().split(/\s+/);
    return [name, values] as const;
  }));
  return directives.get(directive) ?? directives.get("default-src") ?? [];
}

test("CSP erlaubt Ads-Transporte auf allen Seiten ohne allgemeine Freigabe", async () => {
  const rules = await nextConfig.headers!();
  const globalRule = rules.find(rule => rule.source === "/(.*)");
  assert.ok(globalRule, "Die CSP muss auch Start-, Stellen- und Bewerbungsseiten schützen.");
  for (const rule of rules.filter(item => item.headers.some(header => header.key === "Content-Security-Policy"))) {
    const policy = rule.headers.find(header => header.key === "Content-Security-Policy")!.value;
    for (const [directive, resource] of requiredResources) {
      assert.ok(sources(policy, directive).includes(new URL(resource).origin), `${rule.source}: ${directive} blockiert ${resource}`);
    }
    for (const directive of ["script-src", "connect-src", "frame-src"]) {
      const allowed = sources(policy, directive);
      assert.ok(!allowed.includes("*") && !allowed.includes("https:"), `${directive} darf nicht beliebige Anbieter freigeben.`);
      assert.ok(!allowed.includes("https://attacker.example"));
    }
    assert.deepEqual(sources(policy, "frame-src"), ["https://www.googletagmanager.com"]);
    assert.deepEqual(sources(policy, "object-src"), ["'none'"]);
    assert.deepEqual(sources(policy, "base-uri"), ["'self'"]);
  }
});
