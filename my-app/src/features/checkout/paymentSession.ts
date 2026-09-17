export type PaymentAttemptSession = {
  attemptId: string;
  accessToken: string;
};

export const PAYMENT_SESSION_KEY = "sheinar_payment_attempt";

export function savePaymentAttempt(session: PaymentAttemptSession): void {
  sessionStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify(session));
}

export function readPaymentAttempt(): PaymentAttemptSession | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(PAYMENT_SESSION_KEY) || "null") as Partial<PaymentAttemptSession> | null;
    if (!value?.attemptId || !value.accessToken) return null;
    return { attemptId: value.attemptId, accessToken: value.accessToken };
  } catch {
    sessionStorage.removeItem(PAYMENT_SESSION_KEY);
    return null;
  }
}

export function clearPaymentAttempt(): void {
  sessionStorage.removeItem(PAYMENT_SESSION_KEY);
}
