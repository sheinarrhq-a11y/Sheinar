const serverlessExpress = require("@vendia/serverless-express");
const { app, connectToDatabase } = require("./server");

let proxy;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  proxy ||= serverlessExpress({ app });
  return proxy(event, context);
};