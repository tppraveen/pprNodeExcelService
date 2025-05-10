const ExcelJS = require('exceljs');
const path = require('path');


 
exports.getCategoryLists= async (req, res) => {
  
  
  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve(__dirname, '../db/postDb.xlsx');
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('CategoryDB'); // First sheet

    

 
    const rows = [];
    let headers = [];
  
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const rowValues = row.values.slice(1); // Skip the null at index 0
  
      if (rowNumber === 1) {
        // Normalize headers
        headers = rowValues.map(header => {
          return header
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')   // Remove spaces
            .replace(/[^a-z]/gi, ''); // Remove non-alphabetic characters
        });
      } else {
        const rowObject = {};
        headers.forEach((key, i) => {
          rowObject[key] = rowValues[i] ?? null;
        });
        rows.push(rowObject);
      }
    });
  
   // console.log(rows);
     

    res.json(rows);
  } catch (err) {
    console.error('Error reading Excel:', err);
    res.status(500).json({ error: 'Internal server error'+err });
  }
};




exports.insertCategoryLists= async (req, res) => {
  const subcategory = req.query.subcategory || req.query.subCategory;
  const category = req.query.category || req.query.Category;
  const status = req.query.status || req.query.Status;

  if (!category || !subcategory || !status) { 
    return res.status(400).json({ error: 'Required Parameters are missing!' });
  }
 

  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve(__dirname, '../db/postDb.xlsx');
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('CategoryDB');

    if (!sheet) {
      return res.status(500).json({ error: 'CategoryDB not found.' });
    }

    // Normalize headers
    const headers = sheet.getRow(1).values.slice(1).map(h =>
      h.toString().trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/gi, '')
    );

    const idIndex = headers.indexOf('id');
    const catCodeIndex = headers.indexOf('categorycode');

    let maxId = 0;
    const existingCatCodes = new Set();

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const values = row.values.slice(1);
      const currentId = parseInt(values[idIndex]);
      const currentCatCode = values[catCodeIndex];

      if (!isNaN(currentId)) maxId = Math.max(maxId, currentId);
      if (currentCatCode) existingCatCodes.add(currentCatCode.toString().trim());
    });

    const categoryCode = `${category}_${subcategory}`;

    if (existingCatCodes.has(categoryCode)) {
      return res.status(400).json({ error: 'categoryCode already exists.Please edit Exist Category!' });
    }

    const now = new Date().toISOString();

    const newRow = {
      id: maxId + 1,
      categorycode: categoryCode,
      category: category,
      subcategory: subcategory,
      status: status,
      created: now
    };

    const rowValues = headers.map(key => newRow[key] ?? '');

    sheet.addRow(rowValues);
    await workbook.xlsx.writeFile(filePath);

    res.status(201).json({ message: 'Category Created successfully', data: newRow });


     
  } catch (err) {
    res.status(500).json({ error: 'Category not Create failed!' });
  }
};


exports.updateCategoryStatusById = async (req, res) => {
  const id = parseInt(req.query.id);
  const status = req.query.status || req.query.Status;

  if (!id || !status) {
    return res.status(400).json({ error: 'id and status are required.' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve(__dirname, '../db/postDb.xlsx');
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('CategoryDB');

    if (!sheet) {
      return res.status(500).json({ error: 'CategoryDB sheet not found.' });
    }

    const headers = sheet.getRow(1).values.slice(1).map(h =>
      h.toString().trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/gi, '')
    );

    const idIndex = headers.indexOf('id');
    const statusIndex = headers.indexOf('status');
    const lastChangedIndex = headers.indexOf('lastchangedon');

    let updated = false;

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowId = parseInt(row.getCell(idIndex + 1).value);
      if (rowId === id) {
        row.getCell(statusIndex + 1).value = status;
        row.getCell(lastChangedIndex + 1).value = new Date().toISOString();
        updated = true;
      }
    });

    if (!updated) {
      return res.status(404).json({ error: 'Row not found for given ID.' });
    }

    await workbook.xlsx.writeFile(filePath);
    res.status(200).json({ message: 'Status updated successfully.' });

  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.deleteCategoryById = async (req, res) => {
  const id = parseInt(req.query.id);

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve(__dirname, '../db/postDb.xlsx');
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('CategoryDB');

    if (!sheet) {
      return res.status(500).json({ error: 'CategoryDB sheet not found.' });
    }

    const headers = sheet.getRow(1).values.slice(1).map(h =>
      h.toString().trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/gi, '')
    );
    const idIndex = headers.indexOf('id');

    let rowToDelete = null;

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowId = parseInt(row.getCell(idIndex + 1).value);
      if (rowId === id) {
        rowToDelete = row;
      }
    });

    if (!rowToDelete) {
      return res.status(404).json({ error: 'Row not found for Selected Category.' });
    }

    sheet.spliceRows(rowToDelete.number, 1);
    await workbook.xlsx.writeFile(filePath);

    res.status(200).json({ message: `Category - ${id} deleted successfully.` });

  } catch (err) {
    console.error('Delete failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
