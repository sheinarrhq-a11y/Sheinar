// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { clearPaymentAttempt, readPaymentAttempt, savePaymentAttempt } from "./paymentSession";

describe("payment session recovery", () => {
  beforeEach(() => sessionStorage.clear());

  it("persists a retryable attempt across component remounts", () => {
    const attempt = { attemptId: "attempt_1", accessToken: "token_1" };
    savePaymentAttempt(attempt);
    expect(readPaymentAttempt()).toEqual(attempt);
  });

  it("rejects malformed or stale session data", () => {
    sessionStorage.setItem("sheinar_payment_attempt", "{broken");
    expect(readPaymentAttempt()).toBeNull();
    expect(sessionStorage.getItem("sheinar_payment_attempt")).toBeNull();
  });

  it("clears the session only after a confirmed terminal result", () => {
    savePaymentAttempt({ attemptId: "attempt_2", accessToken: "token_2" });
    clearPaymentAttempt();
    expect(readPaymentAttempt()).toBeNull();
  });
});
