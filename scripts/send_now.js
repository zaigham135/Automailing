const { sendYesterdayReport } = require("../src/scheduler");
require("dotenv").config();

(async () => {
  console.log("Starting immediate send of yesterday's report...");
  const result = await sendYesterdayReport();
  console.log("Result:", result);
  if (result.sent) process.exit(0);
  process.exit(1);
})();
