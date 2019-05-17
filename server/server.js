const express = require("express");
const morgan = require("morgan");
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
var models = require('./models');


//setup express app
const app = express();


//using dotenv for database info
const dotenv = require("dotenv");
dotenv.config()



// Log requests to the console
app.use(morgan('dev'));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(cors());

//bring in routes
const reviewRoutes = require("./routes/review");
app.use("/", reviewRoutes);





if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const port = process.env.PORT || 8000;
app.listen(port, ()=>{
  console.log(`The API is listening on port ${port}`)
});

module.exports = app;
