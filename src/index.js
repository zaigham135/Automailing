const { testConnection } = require("./db");
const { scheduleJob } = require("./scheduler");

(async () => {
  await testConnection();
  scheduleJob();
  console.log("🚀 Auto-mailer service started");
})();
