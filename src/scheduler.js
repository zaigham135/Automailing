const cron = require("node-cron");
const { sequelize } = require("./db");
const { generateExcel } = require("./report");
const { sendMail } = require("./mailer");
const path = require("path");

require("dotenv").config();

const REPORT_TABLE = process.env.REPORT_TABLE || "[REPORTS].[dbo].[VIMBar_NEW]";
const DATE_COLUMN = process.env.DATE_COLUMN || "[DATE]";
const { QueryTypes } = require("sequelize");

async function sendReportForDate(dateStr) {
  try {
    console.log(`Fetching rows from ${REPORT_TABLE} for date ${dateStr} filtered by ${DATE_COLUMN}...`);
    const sql = `SELECT * FROM ${REPORT_TABLE} WHERE CAST(${DATE_COLUMN} AS DATE) = :date`;
    const results = await sequelize.query(sql, { replacements: { date: dateStr }, type: QueryTypes.SELECT });

    if (!results || results.length === 0) {
      console.log(`⚠️ No data found for ${dateStr}. No email will be sent.`);
      return { sent: false, reason: "no_data", rows: 0 };
    }

    const fileName = `report_${dateStr}.xlsx`;
    const filePath = path.join(__dirname, "..", fileName);
    await generateExcel(results, filePath);

    console.log(`Generated report: ${filePath}. Sending email...`);
    await sendMail(filePath, { subject: `Report - ${dateStr}`, text: `Please find attached the report for ${dateStr}.` });

    console.log("✅ Report emailed successfully");
    return { sent: true, file: filePath, rows: results.length };
  } catch (err) {
    console.error("❌ sendReportForDate failed:", err && err.message ? err.message : err);
    return { sent: false, reason: err };
  }
}

async function sendYesterdayReport() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);
  return sendReportForDate(dateStr);
}

function scheduleJob() {
  cron.schedule(process.env.CRON_TIME, async () => {
    await sendYesterdayReport();
  });
}

module.exports = { scheduleJob, sendYesterdayReport, sendReportForDate };
