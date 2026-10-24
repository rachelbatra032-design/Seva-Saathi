import { test } from "node:test";
import assert from "node:assert/strict";
import { centralServices } from "../src/data/services-central";
import { stateServices } from "../src/data/services-states";
import { journeys } from "../src/data/journeys";
import { categoryBySlug } from "../src/data/categories";
import { stateByCode } from "../src/data/states";
import { isOfficialUrl } from "../src/lib/official-hosts";
import { allServices, getLinkCheck } from "../src/lib/services";

test("slugs are unique", () => {
  const slugs = allServices.map((s) => s.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("at least 40 central services and a handful of states", () => {
  assert.ok(centralServices.length >= 40, `central: ${centralServices.length}`);
  const states = new Set(stateServices.map((s) => s.state));
  assert.ok(states.size >= 8, `states: ${states.size}`);
});

test("every service has a valid category, official https URL and required fields", () => {
  for (const s of allServices) {
    assert.ok(categoryBySlug[s.category], `${s.slug}: unknown category ${s.category}`);
    assert.ok(isOfficialUrl(s.url), `${s.slug}: not an official URL: ${s.url}`);
    assert.ok(s.title && s.summary.length > 30 && s.ministry && s.languages.length, `${s.slug}: missing fields`);
    if (s.level === "State") assert.ok(s.state && stateByCode[s.state], `${s.slug}: bad state ${s.state}`);
    if (s.level === "Central") assert.equal(s.state, undefined);
  }
});

test("every URL used anywhere has a recorded link check", () => {
  const urls = new Set<string>(allServices.map((s) => s.url));
  for (const j of journeys) for (const st of j.steps) for (const l of st.links) urls.add(l.url);
  for (const u of urls) {
    assert.ok(isOfficialUrl(u), `not official: ${u}`);
    assert.notEqual(getLinkCheck(u).status, "unchecked", `run npm run data:refresh: ${u}`);
  }
});

test("journeys: step ids unique, dependencies exist and come earlier, services exist", () => {
  const slugs = new Set(allServices.map((s) => s.slug));
  for (const j of journeys) {
    const seen = new Set<string>();
    for (const st of j.steps) {
      assert.ok(!seen.has(st.id), `${j.slug}: duplicate step ${st.id}`);
      for (const d of st.dependsOn) assert.ok(seen.has(d), `${j.slug}/${st.id}: dependency ${d} must be an earlier step`);
      for (const sl of st.serviceSlugs ?? []) assert.ok(slugs.has(sl), `${j.slug}/${st.id}: unknown service ${sl}`);
      assert.ok(st.links.length > 0, `${j.slug}/${st.id}: no official link`);
      for (const l of st.links) assert.ok(isOfficialUrl(l.url), `${j.slug}/${st.id}: ${l.url}`);
      for (const f of st.prefill) assert.ok(j.profileFields.includes(f), `${j.slug}/${st.id}: prefill ${f} not in profileFields`);
      for (const v of [st.time, st.fee]) if (v && !v.verified) assert.ok(v.source, `${j.slug}/${st.id}: unverified value needs a note`);
      seen.add(st.id);
    }
  }
});

test("non-official hosts are rejected", () => {
  assert.equal(isOfficialUrl("http://uidai.gov.in/"), false);
  assert.equal(isOfficialUrl("https://uidai.gov.in.evil.com/"), false);
  assert.equal(isOfficialUrl("https://passport-fast-track.com/"), false);
  assert.equal(isOfficialUrl("https://www.passportindia.gov.in/"), true);
});
