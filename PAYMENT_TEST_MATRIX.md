# Payment Test Matrix

This matrix covers the Razorpay payment lifecycle implemented by the backend payment service and storefront checkout.

## Automated coverage

| Case | Evidence | Status |
| --- | --- | --- |
| Normal successful payment | `backend/test/payments.test.js`: valid verification | PASS |
| Payment cancellation and retry | Cancelled attempt can be retried | PASS |
| Closing Razorpay | Cancel endpoint and frontend `ondismiss` path | PASS in backend flow; live UI manual test required |
| Session expiry | Expired attempts are rejected and stale sessions are invalidated | PASS |
| Browser refresh during payment | Status reconciliation test captures a gateway payment after refresh | PASS |
| Back/forward navigation | Router history behavior is implemented; payment UI navigation requires browser test | Manual |
| Four payment attempts | Four cancelled attempts are accepted | PASS |
| Fifth attempt blocked | Exact ten-minute conflict message is asserted | PASS |
| Ten-minute expiry and unlock | Expired attempt window accepts a new attempt | PASS |
| Double-click Pay Now | Concurrent create requests allow one active attempt | PASS |
| Multiple browser tabs | Same cart fingerprint allows one active attempt | PASS; Playwright E2E PASS |
| Payment success after refresh | Gateway status reconciliation finalizes the order idempotently | PASS |
| Webhook arriving multiple times | Signature and event ID deduplication | PASS |
| Payment crossing midnight | Server UTC `paidAt` and `orderDate`, business timezone display fields | Automated timestamp field coverage pending live timezone scenario |
| Failed payment followed by retry | Gateway failure and cancelled retry paths | PASS in backend flow |
| Network/API failure | Safe error handling retains uncertain session for reconciliation | Manual/network fault test required |

## Manual Razorpay test procedure

Use Razorpay Test Mode and a test customer/cart.

1. Start the backend and storefront with valid runtime Razorpay test credentials.
2. Open checkout and click Pay Now once. Confirm Razorpay opens with the server order ID and amount.
3. Close Razorpay without paying. Confirm the attempt is cancelled and Pay Now can be retried.
4. Reload checkout while Razorpay is open or after a network interruption. Confirm the status endpoint is checked before another session is allowed.
5. Complete a payment, reload immediately, and confirm exactly one paid order appears.
6. Open the same cart in two tabs and click Pay Now in both. Confirm only one Razorpay session is created.
7. Cancel and retry four times. Confirm the fifth attempt displays exactly:

   A payment attempt for this cart is already in progress. Please wait up to 10 minutes until the current payment attempt expires before starting a new one.

8. After the ten-minute expiry window, confirm a new attempt can start.
9. Test browser Back and Forward during checkout. Confirm no second order or payment record is created.
10. Start before midnight in the configured business timezone and complete after midnight. Confirm the order uses the server `paidAt`/`orderDate`, not the browser clock.
11. Send the same valid webhook event twice. Confirm one event is processed and the duplicate is ignored.
12. Simulate a failed payment and retry. Confirm the failed attempt does not become paid and the retry uses a new Razorpay order.
13. Block the payment API or disconnect the network after Razorpay opens. Confirm the next reload reconciles status before retrying.

## Known non-payment test output

The backend payment tests may log Gmail SMTP authentication failures while sending confirmation email. Those logs do not fail payment assertions, but production email credentials must be corrected separately.
