const express = require('express');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const poiRoutes = require('./routes/poiRoutes');
const communityRoutes = require('./routes/communityRoutes');
const policeDivisionRoutes= require('./routes/policeDivisionRoutes');

// dotenv.config();

const app = express();
// Log all requests to console
app.use(morgan('combined')); // 'combined' is a predefined format

// Whitelist your frontend domain
const whitelist = process.env.WHITE_LIST.split(','); // Add your app's URL

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) { // Allow requests with no origin (e.g., Postman)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

app.use(express.json());

// Homepage route
app.get('/', (req, res) => {
    res.send('Welcome to the My Awesome Google Maps API!');
});

app.use('/pois', poiRoutes);
app.use('/community', communityRoutes); 
app.use('/policedivision', policeDivisionRoutes); 

const PORT = process.env.PORT || 3000; 

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});