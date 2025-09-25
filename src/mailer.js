const nodemailer = require("nodemailer");
require("dotenv").config();

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail(filePath, opts = { subject: "Daily Report", text: "Please find attached the daily report." }) {
  const transporter = createTransporter();

  // verify transporter before sending
  try {
    await transporter.verify();
  } catch (err) {
    console.error("❌ SMTP verify failed:", err && err.message ? err.message : err);
    throw err;
  }

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.MAIL_TO,
    subject: opts.subject,
    text: opts.text,
    attachments: filePath ? [{ filename: "report.xlsx", path: filePath }] : undefined,
  };

  // retry logic
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("📧 Email sent successfully", info.messageId || info.response || "");
      return info;
    } catch (err) {
      console.error(`❌ sendMail attempt ${attempt} failed:`, err && err.message ? err.message : err);
      if (attempt === maxAttempts) throw err;
      // small backoff
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

module.exports = { sendMail };
