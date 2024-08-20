const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure each community has a unique name
  },
  safety: {
    exposure: {
      type: String,
      enum: ['minimal', 'limited', 'tangible'],
      required: true,
    },
    code: {
      type: Number,
      enum: [0, 1, 2], // 0: minimal, 1: limited, 2: tangible
      required: true,
      validate: {
        validator: function (value) {
          return this.safety.exposure === 'minimal' && value === 0 ||
                 this.safety.exposure === 'limited' && value === 1 ||
                 this.safety.exposure === 'tangible' && value === 2;
        },
        message: 'Code must match exposure level'
      }
    }
  },
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'], // We're using Polygon to define the shape of the community
      required: true,
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of coordinate pairs ([[[lng, lat], [lng, lat], ...]])
      required: true,
      validate: { // Custom validator to ensure valid Polygon
        validator: function (coords)  {
            // Check if it's a valid GeoJSON Polygon
            // 1. Must be an array of LinearRings
            if (!Array.isArray(coords)) return false;
    
            // 2. Must have at least one LinearRing
            if (coords.length === 0) return false;
    
            // 3. Each LinearRing must be an array of positions
            for (const ring of coords) {
              if (!Array.isArray(ring)) return false;
              if (ring.length < 4) return false; // At least 4 points to close the ring
            }
    
            // 4. First and last positions of each LinearRing must be the same
            for (const ring of coords) {
              if (
                ring[0][0] !== ring[ring.length - 1][0] ||
                ring[0][1] !== ring[ring.length - 1][1]
              ) {
                return false;
              }
            }
    
            // 5. Each position must be an array of two numbers
            for (const ring of coords) {
              for (const position of ring) {
                if (!Array.isArray(position) || position.length !== 2) return false;
                if (typeof position[0] !== 'number' || typeof position[1] !== 'number') return false;
              }
            }
    
            return true; // All checks passed
          },
        message: 'Invalid Polygon coordinates'
      }
    },
  },
}, { timestamps: true }); // Add createdAt and updatedAt timestamps

communitySchema.index({ boundaries: '2dsphere' }); // Index for geospatial queries

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;
