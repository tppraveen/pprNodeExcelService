const ExcelJS = require('exceljs');
const path = require('path');


 
////////////////////////////////////////////////////      Get Home menu tiles          /////////////////////////////////////////////////////////////////

exports.getAppHomeMenuTiles= async (req, res) => {
  const keyParam = req.query.Key || req.query.key;
  const pairParam = req.query.Pair || req.query.pair;

  if (!keyParam || !pairParam) {
    return res.status(400).json({ error: 'Both Key and Pair are required' });
  }

  const key = keyParam.toLowerCase();
  const pair = pairParam.toLowerCase();

//  console.log('Received parameters:', { key, pair });

  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve(__dirname, '../db/postDb.xlsx');
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('applicationHeaderDb');;//workbook.getWorksheet(1); // First sheet

    // Map headers
    const headers = {};
    sheet.getRow(1).eachCell((cell, colNumber) => {
      headers[cell.text.toLowerCase()] = colNumber;
    });
 

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
          path: row.getCell(headers.path).text,
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
 