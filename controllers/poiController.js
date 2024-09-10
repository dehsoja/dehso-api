const POI = require('../models/poi');
const communityController = require("./communityController");
const policeDivisionController= require("./policeDivisionController");
const mapUtilities = require('../utilities/mapUtilities');
const e = require('cors');

const poi = [
    {
        name: "Spanish Town Hospital",
        cluster: "healthFacility",
        type: "Hospital",
        location: "Burke Road, Spanish Town",
        lat: 17.992668657865284, 
        lng: -76.94821501917997,
        locStatus: 1
    },
    {
        name: "Cumberland Road Health Centre",
        cluster: "healthFacility",
        type: "Health Centre",
        location: "43 Cumberland Road, Spanish Town",
        lat: 18.010571520396205, 
        lng: -76.97103096657997,
        locStatus: 2
    },
    {
        name: "Sydenham Health Centre",
        cluster: "healthFacility",
        type: "Health Centre",
        location: "36 Federal Road, Spanish Town",
        lat: 17.989396604836585, 
        lng: -76.98062656151025,
        locStatus: 1
    },
    {
        name: "St. Jago Park Health Centre",
        cluster: "healthFacility",
        type: "Health Centre",
        location: "Burke Road, Spanish Town",
        lat: 17.993026174070913, 
        lng: -76.94652471917993,
        locStatus: 1
    },
    {
        name: "Shoppers Fair Burke Road",
        cluster: "supermarket",
        type: "Supermarket",
        location: "Cnr Burke Rd, White Church St, Spanish Town",
        lat: 17.9920157287055, 
        lng: -76.95116737141721,
        locStatus: 1
    },
    {
        name: "Shopper's Fair Supermarket",
        cluster: "supermarket",
        type: "Supermarket",
        location: "92 Brunswick Ave, Spanish Town",
        lat: 18.014212643401557, 
        lng: -76.97163281988192,
        locStatus: 1
    },
    {
        name: "Hi-Lo Food Stores",
        cluster: "supermarket",
        type: "Supermarket",
        location: "Burke Rd, Spanish Town",
        lat: 17.991115681337437, 
        lng: -76.9537772407382,
        locStatus: 1
    },
    {
        name: "St. Jago Shop N Save",
        cluster: "supermarket",
        type: "Supermarket",
        location: "St. Jago Shopping Centre Burke Road Spanish Town",
        lat: 17.991970599242382, 
        lng: -76.94988691072912,
        locStatus: 1
    },
    {
        name: "Spanish Town Police Station",
        cluster: "police",
        type: "Police Station",
        location: "3-5 Burke Rd, Spanish Town",
        lat: 17.991560219439684,  
        lng: -76.95052209541716,
        locStatus: 1
    },
    {
        name: "Spanish Town Fire Station",
        cluster: "fireStation",
        type: "Fire Station",
        location: "White Church St, Spanish Town",
        lat: 17.992283395967373,   
        lng: -76.95226211364752,
        locStatus: 1
    }
];


const createPointOfInterest = async (req, res) => {
  try {
    const poiData = req.body;

    // Data Validation (Optional but Recommended)
    // You can add more specific validation rules based on your requirements.
    if (!poiData.name || !poiData.location || !poiData.location.coordinates) {
      return res.status(400).json({ error: 'Name, location, and coordinates are required' });
    }

    const newPOI = new POI(poiData);
    const savedPOI = await newPOI.save();
    
    res.status(201).json(savedPOI); // Return the created POI with a 201 Created status
  } catch (error) {
    // Error Handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    } else {
      console.error(error); 
      res.status(500).json({ error: 'Server Error' });
    }
  }
};

const getAllPointsOfInterest = async (req, res) => {
    
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);

    // Check if both lat and lng are provided
    if (!isNaN(lat) && !isNaN(lng)) {

        try {
            const r = {};
            const pois = await POI.find().select('-_id -__v -createdAt -updatedAt'); // Fetch all POIs
            const updatedPoi = mapUtilities.addDistance2({lat: lat, lng: lng,}, pois)
            r.pois = updatedPoi;
            const policeDivision = await policeDivisionController.findPoliceDivisionByPoint(lng,lat)

            if (policeDivision){
              r.safety= {policeDivision : policeDivision} ; 

              let count = 0;

              for (const key in policeDivision.crime) {
                if (Object.hasOwnProperty.call(policeDivision.crime, key)) {
                  count += policeDivision.crime[key];
                  
                }
              }

              r.safety.count = count;

              const community = await communityController.findCommunityByPoint(lng,lat)

              if (community) {
                r.safety.exposure = community.safety.exposure
              } else {
                r.safety.exposure = "tangible"
              }
              
              
            
            } 
            
            res.status(200).json(r);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        }

    } else {
        // Handle case where lat and/or lng are missing or invalid
        res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    
};

const getAllPointsOfInterestWithinDistance = async (req, res) => {
    
  const lat = parseFloat(req.params.lat);
  const lng = parseFloat(req.params.lng);

  // Check if both lat and lng are provided
  if (!isNaN(lat) && !isNaN(lng)) {

      try {
          const r = {};
          const pois = await POI.aggregate([
            {
              $geoNear: {
                near: { type: 'Point', coordinates: [lng,lat] },
                distanceField: 'distance',
                maxDistance: parseInt(process.env.FAR_RADIUS),
                spherical: true,
              },
            },
            {
              $addFields: {
                distanceInKm: { 
                  $round: [{ $divide: ["$distance", 1000] }, 1]  // Round to 1 decimal place
                }
              },
            },
            { $project: { _id: 0, distanceInKm: 1, name: 1, location: 1, type: 1, category: 1, rating: 1 } } // Optionally project only the fields you need
          ]);
          
          
          // const updatedPoi = mapUtilities.addDistance2({lat: lat, lng: lng,}, pois)
          r.pois = pois;
          const policeDivision = await policeDivisionController.findPoliceDivisionByPoint(lng,lat)

          if (policeDivision){
            r.safety= {} ;
            // r.scores={}; 

            r.safety.policeDivisionName = policeDivision.name;
            
            let count = 0;
            
            for (const key in policeDivision.crime) {
              if (Object.hasOwnProperty.call(policeDivision.crime, key)) {
                count += policeDivision.crime[key];
                
              }
            }
            
            r.safety.count = count;

            const community = await communityController.findCommunityByPoint(lng,lat)

            // if (community) {
            //   r.safety.exposure = community.safety.exposure;
            //   r.scores.safety = mapUtilities.convertDecimalToGrade(calculateCrimeScore(policeDivision.weight, community.safety.exposure));
            //   r.scores.health = "A+";
            //   r.scores.emergency = "B+";
            //   r.scores.grocery = "C+";

            // } else {
            //   r.safety.exposure = "tangible";
            //   r.scores.safety = mapUtilities.convertDecimalToGrade(calculateCrimeScore(policeDivision.weight, "tangible"));
            //   r.scores.health = "A+";
            //   r.scores.emergency = "B+";
            //   r.scores.grocery = "C+";
            // }

            r.scores = poiScores(pois,policeDivision.weight, community)
            
          
          } 
          
          res.status(200).json(r);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Server Error' });
      }

  } else {
      // Handle case where lat and/or lng are missing or invalid
      res.status(400).json({ error: 'Invalid coordinates' });
  }
  
  
};

// Get all POIs
const getAllPOIs = async (req, res) => {
  try {
    const pois = await POI.find();
    res.json(pois);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const poiScores = (poi, policeDivisionWeight, community) =>{
  let safetyScore= 0;
  let healthScore= 0;
  let groceryScore= 0;
  let emergencyScore= 0;
  let overallScore = 0;
  let educationScore= 0;
  let financeScore= 0;

  if (community) {

    safetyScore= calculateCrimeScore(policeDivisionWeight, community.safety.exposure);

  } else {
    safetyScore = calculateCrimeScore(policeDivisionWeight, "mixed");
  }


  if(poi && poi.length > 0){

    const groupedPOIs = poi.reduce((groups, facility) => {
      (groups[facility.category] = groups[facility.category] || []).push(facility);
      return groups;
    }, {});
    
    healthScore= calculateHealthScore(groupedPOIs["healthFacility"]);
    groceryScore= calculateGroceryScore(groupedPOIs["supermarket"]);
    emergencyScore= calculateEmergencyScore(groupedPOIs["emergencyservices"]);
    educationScore= calculateEducationScore(groupedPOIs["education"]);
    financeScore= calculateFinanceScore(groupedPOIs["financialServices"]);
  }

  overallScore = (.55 * safetyScore) + (.09 * healthScore) + (.2 * emergencyScore) + (.09 * groceryScore) + (.03 * educationScore) + (.04 * financeScore);

  const scores= {
    safety: mapUtilities.convertDecimalToGrade(safetyScore),
    health: mapUtilities.convertDecimalToGrade(healthScore),
    emergency: mapUtilities.convertDecimalToGrade(emergencyScore),
    grocery: mapUtilities.convertDecimalToGrade(groceryScore),
    education: mapUtilities.convertDecimalToGrade(educationScore),
    overall: mapUtilities.convertDecimalToGrade(overallScore),
    finance: mapUtilities.convertDecimalToGrade(financeScore),
  }

  return scores

}

const calculateCrimeScore = (policeDivisionWeight, communityExposure) =>{

  let exposure = .8;

  switch (communityExposure) {
    case "minimal":
      exposure = 1;
      break;
    case "limited":  
      exposure = .9;
      break;
    case "tangible":  
      exposure = .55;
      break;

    default:
      break;
  }

  console.log(policeDivisionWeight)
  console.log(exposure)

  const score = policeDivisionWeight * exposure;

  return Math.round(score*100)/100; 

}

const calculateGroceryScore = (poi) =>{
  let score = 0

  if(poi && poi.length > 0){
    score = .65;

    poi.forEach(element => {

      if (element.distanceInKm >5 ) {
        score += .01;
      } else if (element.distanceInKm >1) {
        score += .03;
      }else{
        score += .05;
      }

    });

  }
  
  let r =  Math.round(score*100)/100;
  console.log(`Grocery Score: ${r}`)
  console.log(`Grocery Score Returned: ${(r > 1) ? 1:r}`)
  return (r > 1) ? 1:r;


}

const calculateHealthScore = (poi) =>{
  let score = 0

  if(poi && poi.length > 0){
    score = .6;

    poi.forEach(element => {

      if (element.type === "Hospital") score += .09;

      if (element.distanceInKm >5 ) {
        score += .005;
      } else if (element.distanceInKm >1) {
        score += .007;
      }else{
        score += .009;
      }

    });

  }


  let r =  Math.round(score*100)/100;
  console.log(`Health Score: ${r}`)
  console.log(`Health Score Returned: ${(r > 1) ? 1:r}`)
  return (r > 1) ? 1:r;

  

}

const calculateEmergencyScore = (poi) =>{
  let score = 0

  if(poi && poi.length > 0){
    score = .55;

    if(poi.some(item => item.type === "Police Station")) score += .055;
    if(poi.some(item => item.type === "Fire Station")) score += .055;
    if(poi.some(item => item.type === "Ambulance Service")) score += .055;

    poi.forEach(element => {
      score += .025;
    });

  }

  let r =  Math.round(score*100)/100;
  console.log(`Emergency Score: ${r}`)
  console.log(`Emergency Score Returned: ${(r > 1) ? 1:r}`)
  return (r > 1) ? 1:r;

}

const calculateEducationScore = (poi) =>{
  let score = 0

  if(poi && poi.length > 0){
    score = .65;

    poi.forEach(element => {
      // console.log(element)

      if (element.rating >= .85 ) {
        score += .03;
      } else if (element.rating >= .5) {
        score += .01;
      }else{
        score += .005;
      }

      score += .01;
    });

  }
  

  let r =  Math.round(score*100)/100;
  console.log(`Education Score: ${r}`)
  console.log(`Education Score Returned: ${(r > 1) ? 1:r}`)
  return (r > 1) ? 1:r;

}

const calculateFinanceScore = (poi) =>{
  let score = 0

  if(poi && poi.length > 0){
    score = .65;

    poi.forEach(element => {

      if (element.type === "Commercial Bank") score += .01;

      if (element.distanceInKm >5 ) {
        score += .001;
      } else if (element.distanceInKm >1) {
        score += .003;
      }else{
        score += .005;
      }

    });

  }
  
  let r =  Math.round(score*100)/100;
  console.log(`Finance Score: ${r}`)
  console.log(`Finance Score Returned: ${(r > 1) ? 1:r}`)
  return (r > 1) ? 1:r;

}

module.exports = {
  getAllPOIs,
  createPointOfInterest,
  getAllPointsOfInterest,
  getAllPointsOfInterestWithinDistance,
  // ... other exported functions
};
