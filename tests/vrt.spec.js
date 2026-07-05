// Visual regression / smoke walkthrough of the main sections, in both
// locales, across mobile and desktop viewports (see playwright.config.js
// projects). Screenshots land in test-results/vrt/ for manual review.
//
// Drives the real login -> book -> library -> profile -> sign out -> HCP
// login flow through the actual UI (session state, not initial data, is
// unseeded — Visits/Profile/Admin start from the app's built-in seed
// bookings, see localStorageProvider.js SEED_BOOKINGS), so it doubles as an
// end-to-end check of Phases 0-4.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "test-results", "vrt");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function shot(page, testInfo, locale, name) {
  const file = path.join(OUT_DIR, `${testInfo.project.name}-${locale}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
}

for (const locale of ["ar", "en"]) {
  test(`main sections (${locale})`, async ({ page, context }, testInfo) => {
    await context.grantPermissions(["camera"]);

    // 1. Login screen
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await shot(page, testInfo, locale, "01-login");

    // Language switcher round-trip
    const otherLocale = locale === "ar" ? "en" : "ar";
    await page
      .getByRole("button", { name: locale === "ar" ? "Switch to English" : /العربية/ })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${otherLocale}$`));
    await expect(page.locator("html")).toHaveAttribute("dir", otherLocale === "ar" ? "rtl" : "ltr");
    await shot(page, testInfo, locale, "02-login-switched-locale");
    await page.goto(`/${locale}`); // back to the locale under test

    // 2. Log in as the Rep persona (first persona card) -- Visits is
    // pre-seeded (see localStorageProvider.js SEED_BOOKINGS), not empty
    const personaButtons = page.locator("main ul > li > button");
    await personaButtons.first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/visits$`));
    await shot(page, testInfo, locale, "03-visits-rep-seeded");

    // 3. New visit (rep discovery) -- the center tab is a <button>, not a <Link>
    await page.getByRole("button", { name: /new visit|زيارة جديدة/i }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/new-visit$`));
    await shot(page, testInfo, locale, "04-new-visit-discovery");

    // Open the first HCP result card -> booking sheet
    const resultCard = page.locator("div.flex-1.overflow-y-auto.px-4.pb-3 > button").first();
    await resultCard.click();
    const overlay = page.locator(".fixed.inset-0.z-40");
    await expect(overlay).toBeVisible();
    await shot(page, testInfo, locale, "05-booking-sheet");

    // Pick the first available day, then the first open slot
    let booked = false;
    const dayRow = overlay
      .locator("p", { hasText: /available days|الأيام المتاحة/i })
      .locator("xpath=following-sibling::div[1]");
    if (await dayRow.locator("button").count()) {
      await dayRow.locator("button").first().click();
      const slotRow = overlay
        .locator("p", { hasText: /available slots|الأوقات المتاحة/i })
        .locator("xpath=following-sibling::div[1]");
      const openSlot = slotRow.locator("button:not([disabled])").first();
      if (await openSlot.count()) {
        await openSlot.click();
        await shot(page, testInfo, locale, "06-booking-sheet-slot-selected");
        const bookBtn = overlay.locator("button", { hasText: /^Book |^حجز /i });
        if (await bookBtn.isEnabled().catch(() => false)) {
          await bookBtn.click();
          booked = true;
        }
      }
    }

    if (booked) {
      await expect(page).toHaveURL(new RegExp(`/${locale}/visits$`));
      await shot(page, testInfo, locale, "07-visits-rep-booked");
    } else {
      await page.keyboard.press("Escape").catch(() => {});
    }

    // 4. Library -- all three tabs
    await page.getByRole("link", { name: /^library$|^المكتبة$/i }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/library$`));
    await shot(page, testInfo, locale, "08-library-updates");
    await page.getByRole("button", { name: /^treatment$|^العلاج$/i }).click();
    await shot(page, testInfo, locale, "09-library-treatment");
    await page.getByRole("button", { name: /^companion$|^المساعد$/i }).click();
    await shot(page, testInfo, locale, "10-library-companion");

    // 5. Profile
    await page.getByRole("link", { name: /^profile$|^الملف الشخصي$/i }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/profile$`));
    await shot(page, testInfo, locale, "11-profile-rep");

    // 6. Sign out, log in as the HCP persona (second persona card)
    await page.getByRole("button", { name: /sign out|تسجيل الخروج/i }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    await personaButtons.nth(1).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/visits$`));
    await shot(page, testInfo, locale, "12-visits-hcp");

    // 7. New visit -> availability editor for the HCP role
    await page.getByRole("button", { name: /new visit|زيارة جديدة/i }).click();
    await shot(page, testInfo, locale, "13-availability-editor");

    // 8. Call screen (HCP side) -- only reachable if the earlier booking succeeded
    if (booked) {
      await page.getByRole("link", { name: /^Visits$|^الزيارات$/i }).click();
      // seeded data gives this rep multiple upcoming visits, so several
      // "Start call" buttons exist -- start whichever is newest (the one we
      // just booked, appended last in the list)
      await page.getByRole("button", { name: /start call|بدء المكالمة/i }).last().click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/call/`));
      await page.waitForTimeout(500); // let the countdown render at least one tick
      await shot(page, testInfo, locale, "14-call-live");
    }

    // 9. Sign out, log in as the Admin persona (5th persona card) -> dashboard
    // (the call screen from step 8 hides the tab bar entirely, so navigate back to it first)
    await page.goto(`/${locale}/visits`);
    await page.getByRole("link", { name: /^profile$|^الملف الشخصي$/i }).click();
    await page.getByRole("button", { name: /sign out|تسجيل الخروج/i }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    await personaButtons.nth(4).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/admin$`));
    await shot(page, testInfo, locale, "15-admin-dashboard");

    // Admin's profile tab (no fields/ratings/feedback cards for this role)
    await page.getByRole("link", { name: /^profile$|^الملف الشخصي$/i }).click();
    await shot(page, testInfo, locale, "16-profile-admin");

    // 10. Not-found boundary
    await page.goto(`/${locale}/this-route-does-not-exist`);
    await shot(page, testInfo, locale, "17-not-found");
  });
}
