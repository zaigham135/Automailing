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
    // allow passing `to` in opts or use MAIL_TO env; support comma-separated string or array
    to: undefined,
    subject: opts.subject,
    text: opts.text,
    attachments: filePath ? [{ filename: "report.xlsx", path: filePath }] : undefined,
  };
  // Resolve recipients
  let recipients = opts.to || process.env.MAIL_TO || "";
  if (Array.isArray(recipients)) {
    mailOptions.to = recipients;
  } else if (typeof recipients === "string") {
    // split comma-separated values and trim
    const list = recipients.split(",").map((s) => s.trim()).filter(Boolean);
    mailOptions.to = list.length === 1 ? list[0] : list;
  } else {
    mailOptions.to = recipients;
  }

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
