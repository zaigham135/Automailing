const { sendReportForDate } = require("../src/scheduler");
require("dotenv").config();

const dateArg = process.argv[2];
if (!dateArg) {
  console.error("Usage: node send_for_date.js YYYY-MM-DD");
  process.exit(1);
}

(async () => {
  console.log(`Sending report for date ${dateArg}...`);
  const res = await sendReportForDate(dateArg);
  console.log("Result:", res);
  process.exit(res.sent ? 0 : 1);
})();
