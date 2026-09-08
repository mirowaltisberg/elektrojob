import assert from "node:assert/strict";
import test from "node:test";
import { findLandingPageBySlug, getLandingPath, toCantonSlug, toRoleSlug } from "./landing-pages";
import { ELEKTRIKER_CITIES } from "./elektriker-cities";

test("footer canton names resolve to existing canton routes", () => {
  for (const canton of ["Zürich", "Bern", "Basel", "Aargau", "St. Gallen", "Luzern", "Solothurn", "Zug", "Thurgau", "Graubünden", "Schaffhausen", "Fribourg"]) {
    assert.ok(findLandingPageBySlug(toRoleSlug("Elektroinstallateur EFZ"), toCantonSlug(canton)), canton);
  }
  assert.equal(toCantonSlug("Fribourg"), "fr");
  assert.equal(toCantonSlug("ZH"), "zh");
});

test("city cross-links use existing canonical canton routes, not duplicate name aliases", () => {
  for (const city of ELEKTRIKER_CITIES) {
    const role = toRoleSlug("Elektroinstallateur EFZ");
    const config = findLandingPageBySlug(role, city.cantonSlug);
    assert.ok(config, city.name);
    assert.equal(getLandingPath(config), `/elektrojobs/${role}/${city.cantonAbbr.toLowerCase()}`);
    assert.equal(city.cantonSlug, city.cantonAbbr.toLowerCase());
  }
});

test("legacy canton-name URLs resolve to the same canonical configuration", () => {
  const role = "elektroinstallateur-efz";
  for (const [alias, canonical] of [["zuerich", "zh"], ["bern", "be"], ["basel", "bs"], ["luzern", "lu"], ["st-gallen", "sg"]]) {
    const config = findLandingPageBySlug(role, alias);
    assert.ok(config, alias);
    assert.equal(config, findLandingPageBySlug(role, canonical));
    assert.equal(getLandingPath(config), `/elektrojobs/${role}/${canonical}`);
  }
  assert.equal(findLandingPageBySlug(role, "unbekannter-kanton"), null);
});
