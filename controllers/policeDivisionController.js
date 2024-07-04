const PoliceDivision = require('../models/policeDivision'); 

const createPoliceDivision = async (req, res) => {
  try {
    const divisionData = req.body;

    // Data Validation
    if (!divisionData.name || !divisionData.boundaries || !divisionData.boundaries.coordinates) {
      return res.status(400).json({ error: 'Name and boundaries (with coordinates) are required' });
    }

    // Validate GeoJSON Polygon Structure (Optional but recommended for better data integrity)
    if (divisionData.boundaries.type !== 'Polygon' || !Array.isArray(divisionData.boundaries.coordinates)) {
      return res.status(400).json({ error: 'Invalid GeoJSON Polygon format' });
    }

    const newPoliceDivision = new PoliceDivision(divisionData);
    const savedPoliceDivision = await newPoliceDivision.save();

    res.status(201).json(savedPoliceDivision);
  } catch (error) {
    // Error Handling
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: 'Validation Error', details: error.errors });
    } else if (error.code === 11000) { // MongoDB duplicate key error (unique constraint)
      return res.status(409).json({ error: 'Police Division name already exists' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  }
};

const findPoliceDivisionForPoint = async (req, res) => {
    try {
        const lat = parseFloat(req.params.lat);
        const lng = parseFloat(req.params.lng);

        // Check if both lat and lng are provided
        if (!isNaN(lat) && !isNaN(lng)) {

            const policeDivision = await findPoliceDivisionByPoint(lng,lat);

            if (policeDivision) {
                res.status(200).json(policeDivision);
              } else {
                res.status(404).json({ error: 'No police division found for this location' });
            }

        } else {
            // Handle case where lat and/or lng are missing or invalid
            res.status(400).json({ error: 'Invalid coordinates' });
        }
    
    } catch (error) {

        // console.error(error);
        res.status(500).json({ error: 'Server Error' });
        
    }
    
}

async function findPoliceDivisionByPoint(longitude, latitude) {
    try {
      const policeDivision = await PoliceDivision.findOne({
        boundaries: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
        },
      }).select('name crime weightedRank -_id');
  
      if (policeDivision) {
        console.log(`Point (${longitude}, ${latitude}) is within ${policeDivision.name}`);
        const updatedPoliceDivision = policeDivision.toObject()
        updatedPoliceDivision.weight= policeDivisionRankWeight(updatedPoliceDivision.weightedRank)
        return updatedPoliceDivision;
      } else {
        console.log(`Point (${longitude}, ${latitude}) is not within any community`);
        return null;
      }
    } catch (error) {
      console.error("Error finding police division:", error);
      throw error; // Rethrow the error for handling in the controller
    }
}


function policeDivisionRankWeight(rank){

    const weight = [
        1,
        0.986842105,
        0.973684211,
        0.960526316,
        0.947368421,
        0.934210526,
        0.921052632,
        0.907894737,
        0.894736842,
        0.881578947,
        0.868421053,
        0.855263158,
        0.842105263,
        0.828947368,
        0.821052632,
        0.813157895,
        0.805263158,
        0.797368421,
        0.789473684,

    ]

    return weight[rank-1] || 0;

}

module.exports = {
    createPoliceDivision,
    findPoliceDivisionForPoint,
    findPoliceDivisionByPoint,
    
};
