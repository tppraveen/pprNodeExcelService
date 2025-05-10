const express = require('express');
const router = express.Router();

// Dummy data or connect to DB
const budgets = [
  { id: 1, month: 'May', year: 2025, limit: 1000 },
  { id: 2, month: 'June', year: 2025, limit: 1200 }
];

// GET /budgets/
router.get('/', (req, res) => {
  res.status(200).json({ budgets });
});

module.exports = router;
