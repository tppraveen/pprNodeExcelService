// Import dependencies
const http = require('http');
const express = require('express');

// Create Express app 
const homePageService =require('./controller/homePageService');
const categoryService =require('./controller/categoryService');

// const app = express();
// app.use(express.json())
const cors = require('cors');

const app = express();
app.use(cors()); 

  
// Get Applicarion Home Page                         --------- Get menu tiles for home
app.get('/getAppHomeMenuTiles',homePageService.getAppHomeMenuTiles);

// Get Applicarion Home Page                         --------- Get CategoryLists - get all
app.get('/getCategoryLists',categoryService.getCategoryLists);
app.post('/insertCategoryLists',categoryService.insertCategoryLists);
app.post('/updateCategoryStatusById',categoryService.updateCategoryStatusById);
app.post('/deleteCategoryById',categoryService.deleteCategoryById);

const server = http.createServer(app);
const PORT =  process.env.PORT || 4000 
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
