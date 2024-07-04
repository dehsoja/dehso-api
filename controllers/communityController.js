const Community = require('../models/community'); 

const createCommunity = async (req, res) => {
  try {
    const communityData = req.body;

    // Data Validation
    if (!communityData.name || !communityData.boundaries || !communityData.boundaries.coordinates) {
      return res.status(400).json({ error: 'Name and boundaries (with coordinates) are required' });
    }

    // Validate GeoJSON Polygon Structure (Optional but recommended for better data integrity)
    if (communityData.boundaries.type !== 'Polygon' || !Array.isArray(communityData.boundaries.coordinates)) {
      return res.status(400).json({ error: 'Invalid GeoJSON Polygon format' });
    }

    const newCommunity = new Community(communityData);
    const savedCommunity = await newCommunity.save();

    res.status(201).json(savedCommunity);
  } catch (error) {
    // Error Handling
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: 'Validation Error', details: error.errors });
    } else if (error.code === 11000) { // MongoDB duplicate key error (unique constraint)
      return res.status(409).json({ error: 'Community name already exists' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  }
};

const findCommunityForPoint = async (req, res) => {
    try {
        const lat = parseFloat(req.params.lat);
        const lng = parseFloat(req.params.lng);

        // Check if both lat and lng are provided
        if (!isNaN(lat) && !isNaN(lng)) {

            const community = await findCommunityByPoint(lng,lat);

            if (community) {
                res.status(200).json(community);
              } else {
                res.status(404).json({ error: 'No community found for this location' });
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

async function findCommunityByPoint(longitude, latitude) {
    try {
      const community = await Community.findOne({
        boundaries: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
        },
      }).select('name safety -_id');
  
      if (community) {
        console.log(`Point (${longitude}, ${latitude}) is within ${community.name}`);
        return community;
      } else {
        console.log(`Point (${longitude}, ${latitude}) is not within any community`);
        return null;
      }
    } catch (error) {
      console.error("Error finding community:", error);
      throw error; // Rethrow the error for handling in the controller
    }
}


module.exports = {
    createCommunity,
    findCommunityForPoint,
    findCommunityByPoint,
    
};
