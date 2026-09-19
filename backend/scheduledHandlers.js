const { connectToDatabase } = require("./server");
const { runAbandonedCheckoutCron } = require("./cron/abandonedCheckoutCron");
const { runTrackingCron } = require("./cron/trackingCron");

async function runScheduledJob(job) {
  await connectToDatabase();
  const result = await job();
  return { statusCode: 200, body: JSON.stringify(result) };
}

exports.abandonedCheckout = async () => runScheduledJob(runAbandonedCheckoutCron);
exports.tracking = async () => runScheduledJob(runTrackingCron);