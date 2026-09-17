import { test, expect } from "@playwright/test";

test("two tabs share a payment session without approving stale success", async ({ browser }) => {
  const context = await browser.newContext();
  const tabA = await context.newPage();
  const tabB = await context.newPage();
  let paid = false;

  for (const page of [tabA, tabB]) {
    await page.route("**/api/payments/status/**", async (route) => {
      await route.fulfill({ json: { order: { paymentStatus: paid ? "paid" : "pending", orderNumber: "SH-E2E" } } });
    });
  }

  await tabA.goto("/checkout");
  await tabB.goto("/checkout");
  await tabA.evaluate(() => sessionStorage.setItem("sheinar_payment_attempt", JSON.stringify({ attemptId: "attempt-e2e", accessToken: "token-e2e" })));
  await tabB.evaluate(() => sessionStorage.setItem("sheinar_payment_attempt", JSON.stringify({ attemptId: "attempt-e2e", accessToken: "token-e2e" })));
  paid = true;
  await tabB.reload();
  await expect(tabB.getByText("Order Confirmed")).toBeVisible();
  await tabA.reload();
  await expect(tabA.getByText("Order Confirmed")).toBeVisible();
  await context.close();
});
