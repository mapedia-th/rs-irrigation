// =============================
// Flood Mapping Sentinel-1 SAR
// =============================

// 1️⃣ กำหนดพื้นที่สนใจ (AOI)


// 2️⃣ โหลด Sentinel-1 VV images
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
            .filter(ee.Filter.eq('instrumentMode', 'IW'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
            .filterBounds(aoi);

// 3️⃣ เลือกช่วงเวลา Pre-flood / Post-flood
var preFlood = s1.filterDate('2025-04-01', '2025-04-30').mean();
var postFlood = s1.filterDate('2025-07-23', '2025-07-30').mean();

var visParams = {
  min: -25,       // min dB
  max: 5,         // max dB
  palette: ['0000ff', '00ffff', '00ff00', 'ffff00', 'ff0000'] // blue → red
};

// แสดง pre-flood
Map.addLayer(preFlood.select('VV'), visParams, 'Pre-Flood');

// แสดง post-flood
Map.addLayer(postFlood.select('VV'), visParams, 'Post-Flood');



print(preFlood)
print(postFlood)

// 4️⃣ Mask edges / low backscatter pixels
function maskEdges(image) {
  var edge = image.lt(-30);
  var mask = image.mask().and(edge.not());
  return image.updateMask(mask);
}

preFlood = maskEdges(preFlood);
postFlood = maskEdges(postFlood);

// 5️⃣ Detect flooded areas (thresholding)
var flood = preFlood.subtract(postFlood).gt(2); // change > 2 dB
print(flood.bandNames());  // ต้องมีแค่ 1 band เช่น "VV"

var flood_vv = flood.select('VV')

// 6️⃣ Visualize flood map
Map.centerObject(aoi, 12);
Map.addLayer(flood_vv.updateMask(flood_vv), {color: 'blue'}, 'Flooded Area');

// 7️⃣ Convert raster flood map → vector polygons
var floodVectors = flood_vv.reduceToVectors({
  geometry: aoi,
  scale: 20,
  geometryType: 'polygon',
  labelProperty: 'water',
  reducer: ee.Reducer.countEvery()
});

// 8️⃣ Calculate area (m², rai, km²)
floodVectors = floodVectors.map(function(feature) {
  var geom = feature.geometry().simplify(1);       // simplify geometry
  var area = geom.area(1);                        // area in m²
  return feature.set({
    'area_m2': area,
    'area_rai': area / 1600,
    'area_km2': area / 1e6
  });
});

print(floodVectors)
// 9️⃣ Export to Shapefile
Export.table.toDrive({
  collection: floodVectors,
  description: 'Flooded_Area_SHP',
  fileFormat: 'SHP'
});
