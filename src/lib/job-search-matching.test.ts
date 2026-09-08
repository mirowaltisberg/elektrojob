import assert from "node:assert/strict";
import test from "node:test";
import { matchesJobLocation, matchesJobQuery } from "./job-search-matching";
import { getCantonSearchCode } from "./canton-search";

const projectManager = { title: "Elektro-Projektleiter/in", description: "Fachkraft für Elektro-Projekte in Zürich gesucht." };
const installer = { title: "Elektroinstallateur/in", description: "Offene Stelle in Winterthur." };
const electronics = { title: "Elektroniker/in", description: "Offene Stelle in Bern." };

test("profession search does not match unrelated titles through the shared Elektro prefix", () => {
  assert.equal(matchesJobQuery(projectManager, "Elektroinstallateur"), false);
  assert.equal(matchesJobQuery(projectManager, "Elektroniker"), false);
  assert.equal(matchesJobQuery(installer, "Elektroinstallateur EFZ Jobs"), true);
  assert.equal(matchesJobQuery(electronics, "Elektroniker"), true);
  assert.equal(matchesJobQuery(projectManager, "Projektleiter Elektro"), true);
});

test("common word endings remain searchable and generic job queries do not hide all jobs", () => {
  assert.equal(matchesJobQuery(installer, "Elektroinstallateure"), true);
  assert.equal(matchesJobQuery(installer, "Elektroinstallateurin"), true);
  for (const query of ["", "jobs", "EFZ", "Stellen", "Elektriker Jobs"]) {
    assert.equal(matchesJobQuery(installer, query), true, query);
  }
  assert.equal(matchesJobQuery(installer, "unbekannterberuf"), false);
});

test("canton codes and dropdown cities match full source locations without widening a city to the canton", () => {
  assert.equal(matchesJobLocation({ location: "Winterthur, Zürich" }, "ZH"), true);
  assert.equal(matchesJobLocation({ location: "Bern, Bern" }, "ZH"), false);
  assert.equal(matchesJobLocation({ location: "Zürich, Zürich" }, "Zürich, ZH"), true);
  assert.equal(matchesJobLocation({ location: "Winterthur, Zürich" }, "Zürich, ZH"), false);
  assert.equal(matchesJobLocation({ location: "Zürich, Zürich" }, "Zurich, ZH"), true);
  assert.equal(matchesJobLocation({ location: "Winterthur, Zürich" }, "Zürich"), true);
  assert.equal(matchesJobLocation({ location: "Dübendorf, Zürich" }, "Kanton Zürich"), true);
  assert.equal(getCantonSearchCode("ZH"), "ZH");
  assert.equal(getCantonSearchCode("Zürich"), "ZH");
  assert.equal(getCantonSearchCode("Zürich, ZH"), null);
  assert.equal(getCantonSearchCode("8400 Winterthur"), null);
});
