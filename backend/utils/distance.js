const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  // ==========================================
  // VALIDATE COORDINATES
  // ==========================================

  const latitude1 = Number(lat1);
  const longitude1 = Number(lon1);
  const latitude2 = Number(lat2);
  const longitude2 = Number(lon2);

  if (
    !Number.isFinite(latitude1) ||
    !Number.isFinite(longitude1) ||
    !Number.isFinite(latitude2) ||
    !Number.isFinite(longitude2)
  ) {
    throw new Error(
      `Invalid coordinates: (${lat1}, ${lon1}) -> (${lat2}, ${lon2})`
    );
  }

  // ==========================================
  // EARTH RADIUS
  // ==========================================

  const earthRadius = 6371;

  // ==========================================
  // CONVERT DEGREES TO RADIANS
  // ==========================================

  const dLat =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const dLon =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const radLat1 =
    (latitude1 * Math.PI) / 180;

  const radLat2 =
    (latitude2 * Math.PI) / 180;

  // ==========================================
  // HAVERSINE FORMULA
  // ==========================================

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  // ==========================================
  // DISTANCE IN KM
  // ==========================================

  const distance =
    earthRadius * c;

  return Number(distance.toFixed(2));
};

module.exports = calculateDistance;