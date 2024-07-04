
//As the crow flys
function haversineDistance(point1, point2) {
    const { lat: lat1, lng: lng1 } = point1;
    const { lat: lat2, lng: lng2 } = point2;
  
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lng2 - lng1);
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
    // return distance;
    // return distance / 1000
    const distanceInKm = distance / 1000;
    return parseFloat(distanceInKm.toFixed(1)); // Round to one decimal place  
}

  
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function groupPois(selected, poi){

    const groupedPOIs = poi.reduce((groups, facility) => {
        // Create a new object that includes the existing facility properties
        const facilityWithExtraField = { 
          ...facility,
          distance: haversineDistance(selected, {lat: facility.lat, lng: facility.lng }) // Example: Adding distance from a reference point
        };
      
        (groups[facility.cluster] = groups[facility.cluster] || []).push(facilityWithExtraField);
        return groups;
    }, {});

    return groupedPOIs;

}

function addDistance(selected, poi){
    const updatedPoi = poi.map(place => ({
        ...place,
        distance: haversineDistance(selected, {lat: place.lat, lng: place.lng })  
      }));
    
    return updatedPoi;
}

function addDistance2(selected, poi){
    
    const updatedPoi = poi.map(obj => obj.toObject())
    updatedPoi.forEach(place => {
        place.distance = haversineDistance(selected, {lat: place.location.coordinates[1], lng: place.location.coordinates[0] });
        place.lat= place.location.coordinates[1];
        place.lng= place.location.coordinates[0];
        delete place.location;
    });
    return updatedPoi;
}


function convertDecimalToGrade(decimalGrade) {
    if (decimalGrade >= 0.97) return "A+";
    if (decimalGrade >= 0.93) return "A";
    if (decimalGrade >= 0.90) return "A-";
    if (decimalGrade >= 0.87) return "B+";
    if (decimalGrade >= 0.83) return "B";
    if (decimalGrade >= 0.80) return "B-";
    if (decimalGrade >= 0.77) return "C+";
    if (decimalGrade >= 0.73) return "C";
    if (decimalGrade >= 0.70) return "C-";
    if (decimalGrade >= 0.67) return "D+";
    if (decimalGrade >= 0.63) return "D";
    if (decimalGrade >= 0.60) return "D-";
    return "F"; // Catch-all for grades below 0.60
}




module.exports = {
    groupPois,
    addDistance,
    addDistance2,
    convertDecimalToGrade,
    // ... other exported functions
  };