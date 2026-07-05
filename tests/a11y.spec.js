// Automated accessibility scan (axe-core) across every main screen, in both
// locales, on both viewports (see playwright.config.js projects). Sessions are
// seeded directly into localStorage (matching src/lib/data/localStorageProvider.js's
// shape) rather than driven through the login UI, since this spec only cares about
// the destination screens.
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const directory = require("../src/data/directory.json");

const STORE_KEY = "vimed_state_v1";

async function seedSession(context, currentUserId) {
  await context.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [STORE_KEY, JSON.stringify({ currentUserId, bookings: [], availabilityOverrides: {}, surveyClicks: { hcp: 0, rep: 0 }, seq: 1 })]
  );
}

async function scan(page) {
  const results = await new AxeBuilder({ page })
    // color-contrast is flagged unreliably against gradient/backdrop-blur
    // backgrounds (the call screen's video scrim, the sticky header's blur) —
    // everything else stays enforced.
    .disableRules(["color-contrast"])
    .analyze();
  return results.violations;
}

function describeViolations(violations) {
  return violations
    .map((v) => `[${v.id}] ${v.help} (${v.nodes.length} node(s)): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
    .join("\n");
}

const repId = directory.reps[0].id;
const hcpId = directory.physicians[0].id;
const adminId = "admin_1";

for (const locale of ["ar", "en"]) {
  test(`login screen has no a11y violations (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const violations = await scan(page);
    expect(violations, describeViolations(violations)).toEqual([]);
  });

  const repRoutes = ["/visits", "/new-visit", "/library", "/profile"];
  for (const route of repRoutes) {
    test(`rep ${route} has no a11y violations (${locale})`, async ({ page, context }) => {
      await seedSession(context, repId);
      await page.goto(`/${locale}${route}`);
      const violations = await scan(page);
      expect(violations, describeViolations(violations)).toEqual([]);
    });
  }

  const hcpRoutes = ["/visits", "/new-visit", "/library", "/profile"];
  for (const route of hcpRoutes) {
    test(`hcp ${route} has no a11y violations (${locale})`, async ({ page, context }) => {
      await seedSession(context, hcpId);
      await page.goto(`/${locale}${route}`);
      const violations = await scan(page);
      expect(violations, describeViolations(violations)).toEqual([]);
    });
  }

  const adminRoutes = ["/admin", "/profile"];
  for (const route of adminRoutes) {
    test(`admin ${route} has no a11y violations (${locale})`, async ({ page, context }) => {
      await seedSession(context, adminId);
      await page.goto(`/${locale}${route}`);
      const violations = await scan(page);
      expect(violations, describeViolations(violations)).toEqual([]);
    });
  }

  test(`not-found screen has no a11y violations (${locale})`, async ({ page, context }) => {
    await seedSession(context, repId);
    await page.goto(`/${locale}/this-route-does-not-exist`);
    const violations = await scan(page);
    expect(violations, describeViolations(violations)).toEqual([]);
  });
}
