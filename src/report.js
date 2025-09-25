const ExcelJS = require("exceljs");

async function generateExcel(data, filePath) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  if (data.length > 0) {
    sheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));

    data.forEach((row) => sheet.addRow(row));
  }

  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

module.exports = { generateExcel };
