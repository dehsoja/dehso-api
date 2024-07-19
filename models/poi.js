const mongoose = require('mongoose');

const pointOfInterestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true 
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ["healthFacility", "supermarket", "emergencyservices","education", "financialServices"], // Customize categories
    default: 'other'
  },
  type: {
    type: String,
    enum: ["Hospital", "Health Centre", "Supermarket", "Police Station", "Fire Station", "Ambulance Service", "High School", "ATM", "Commercial Bank"], // Customize categories
    default: 'other'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  address: {
    type: String,
  },
  rating:{
    type: Number,
  },
  locStatus:{
    type: Number,
  },
//   contactInformation: {
//     website: String,
//     phone: String,
//   },
//   images: [String], // Array to store image URLs
  // Add more fields as needed (e.g., ratings, reviews, hours, etc.)
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

pointOfInterestSchema.index({ location: '2dsphere' }); // Index for geospatial queries

const PointOfInterest = mongoose.model('PointOfInterest', pointOfInterestSchema);

module.exports = PointOfInterest;
