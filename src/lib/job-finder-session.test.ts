import test from "node:test";
import assert from "node:assert/strict";
import { FINDER_COOKIE, finderCookieValue, readFinderCookie } from "./job-finder-session";
const id = "51dd10e9-02f1-47cc-bfa9-7e3081f3228d";
const secret = "a-server-secret-with-more-than-thirty-two-characters";

test("resume cookie is bound to both session ID and server secret", () => {
  const value = finderCookieValue(id, secret);
  assert.equal(readFinderCookie(`other=x; ${FINDER_COOKIE}=${value}`, secret), id);
  assert.equal(readFinderCookie(`${FINDER_COOKIE}=${value}`, "different-secret"), null);
  assert.equal(readFinderCookie(`${FINDER_COOKIE}=${value.replace('51dd', '61dd')}`, secret), null);
  assert.equal(readFinderCookie(`${FINDER_COOKIE}=${id}`, secret), null);
});
test("rejects ambiguous, malformed and appended capability cookies", () => {
  const value = finderCookieValue(id, secret);
  for (const header of [null, "", `${FINDER_COOKIE}=`, `${FINDER_COOKIE}=${value}.extra`, `${FINDER_COOKIE}=${value}; ${FINDER_COOKIE}=${value}`, `${FINDER_COOKIE}=${value.slice(0, -1)}`]) {
    assert.equal(readFinderCookie(header, secret), null);
  }
});
