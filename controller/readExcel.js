const ExcelJS = require('exceljs');
const path = require('path');

// Get entire Excel data
exports.getExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve(__dirname, '../db/postDb.xlsx');
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1); // Sheet index starts at 1

    const data = [];
    sheet.eachRow((row) => {
      data.push(row.values);
    });

    res.json({ rows: data });
  } catch (err) {
    console.error('Error reading Excel file:', err);
    res.status(500).json({ error: 'Failed to read Excel file' });
  }
};

// Fetch row based on Key, Pair, and id === 1

exports.fetchByKeyAndPair = async (req, res) => {
  const keyParam = req.query.Key || req.query.key;
  const pairParam = req.query.Pair || req.query.pair;

  if (!keyParam || !pairParam) {
    return res.status(400).json({ error: 'Both Key and Pair are required' });
  }

  const key = keyParam.toLowerCase();
  const pair = pairParam.toLowerCase();

  console.log('Received parameters:', { key, pair });

  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve(__dirname, '../db/postDb.xlsx');
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1); // First sheet

    // Map headers
    const headers = {};
    sheet.getRow(1).eachCell((cell, colNumber) => {
      headers[cell.text.toLowerCase()] = colNumber;
    });

    // // Check if all required headers exist
    // const requiredColumns = ['id', 'key', 'pair', 'label', 'text'];
    // for (const col of requiredColumns) {
    //   if (!headers[col]) {
    //     return res.status(500).json({ error: `Missing required column: ${col}` });
    //   }
    // }

    // Search for the row
    let result = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const rowKey = (row.getCell(headers.key).text || '').toLowerCase();
      const rowPair = (row.getCell(headers.pair).text || '').toLowerCase();
      const rowId = row.getCell(headers.id).value;

      if (rowKey === key && rowPair === pair) {
        result.push({
          label: row.getCell(headers.label).text,
          text: row.getCell(headers.text).text,
        });
      }
    });

    if (result.length===0) {
      return res.status(404).json({ error: 'No matching record found' });
    }

    res.json(result);
  } catch (err) {
    console.error('Error reading Excel:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

