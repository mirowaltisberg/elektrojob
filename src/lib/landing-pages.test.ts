import assert from "node:assert/strict";
import test from "node:test";
import { findLandingPageBySlug, toCantonSlug, toRoleSlug } from "./landing-pages";

test("footer canton names resolve to existing canton routes", () => {
  for (const canton of ["Zürich", "Bern", "Basel", "Aargau", "St. Gallen", "Luzern", "Solothurn", "Zug", "Thurgau", "Graubünden", "Schaffhausen", "Fribourg"]) {
    assert.ok(findLandingPageBySlug(toRoleSlug("Elektroinstallateur EFZ"), toCantonSlug(canton)), canton);
  }
  assert.equal(toCantonSlug("Fribourg"), "fr");
  assert.equal(toCantonSlug("ZH"), "zh");
});
