const { testConnection } = require("../src/db");
const { generateExcel } = require("../src/report");
const { sendMail } = require("../src/mailer");
const path = require("path");
require("dotenv").config();

(async () => {
  await testConnection();
  const sample = [
    { id: 1, name: "Alice", amount: 10 },
    { id: 2, name: "Bob", amount: 20 },
  ];
  const filePath = path.join(__dirname, "../report.xlsx");
  await generateExcel(sample, filePath);
  console.log("Generated sample report:", filePath);

  if ((process.env.SEND_TEST_EMAIL || "false").toLowerCase() === "true") {
    try {
      await sendMail(filePath, { subject: "Smoke Test Report", text: "This is a test email from AutoMailer smoke test." });
      console.log("Test email sent");
    } catch (err) {
      console.error("Test email failed:", err && err.message ? err.message : err);
    }
  } else {
    console.log("SEND_TEST_EMAIL is false; skipping sending test email.");
  }
})();
