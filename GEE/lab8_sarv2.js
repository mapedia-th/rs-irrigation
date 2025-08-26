// =============================
// Flood Mapping Example - Sentinel-1 SAR (VV)
// =============================


// 2️⃣ โหลด Sentinel-1 GRD VV images
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
            .filter(ee.Filter.eq('instrumentMode', 'IW'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
            .filterBounds(aoi);

// 3️⃣ เลือกช่วงเวลา Pre-flood / Post-flood
var preFlood = s1.filterDate('2025-04-01', '2025-04-30').max().select('VV').clip(aoi);
var postFlood = s1.filterDate('2025-07-20', '2025-07-30').max().select('VV').clip(aoi);

// 4️⃣ Mask edges / low backscatter pixels
function maskEdges(image) {
  var edge = image.lt(-30);  // ตัดค่าต่ำเกินไป
  var mask = image.mask().and(edge.not());
  return image.updateMask(mask);
}
preFlood = maskEdges(preFlood);
postFlood = maskEdges(postFlood);

// ----------------------
//   ค่าเฉลี่ย Pre/Post (bar chart)
// ----------------------
var preMean = preFlood.reduceRegion({
  reducer: ee.Reducer.max(),
  geometry: aoi,
  scale: 20,
  maxPixels: 1e9
}).get('VV');

var postMean = postFlood.reduceRegion({
  reducer: ee.Reducer.max(),
  geometry: aoi,
  scale: 20,
  maxPixels: 1e9
}).get('VV');

var chart2 = ui.Chart.array.values(
  ee.Array([preMean, postMean]), 0, ee.List(['Pre-Flood','Post-Flood'])
).setChartType('ColumnChart')
.setOptions({
  title: 'Mean VV Pre vs Post Flood',
  vAxis: {title: 'VV (dB)'},
  legend: {position: 'none'},
  colors: ['#1f77b4']
});

print(chart2);





// 5️⃣ Detect flood areas (change detection)
var flood = preFlood.subtract(postFlood).gt(2); // ค่า VV ลดลง >2 dB → น้ำท่วม
flood = flood.selfMask(); // ซ่อน pixel ที่ไม่ท่วม

// 6️⃣ แสดงผลบนแผนที่
Map.centerObject(aoi, 11);
Map.addLayer(preFlood, {min:-25, max:0}, 'Pre-Flood VV');
Map.addLayer(postFlood, {min:-25, max:0}, 'Post-Flood VV');
Map.addLayer(flood, {palette: 'blue'}, 'Flooded Area');

// 7️⃣ แปลง raster flood → vector polygons
var floodVectors = flood.reduceToVectors({
  geometry: aoi,
  scale: 20,
  geometryType: 'polygon',
  labelProperty: 'water',
  reducer: ee.Reducer.countEvery()
});

// 8️⃣ คำนวณพื้นที่ polygon (m², rai, km²)
floodVectors = floodVectors.map(function(feature) {
  var geom = feature.geometry().simplify(1);
  var area = geom.area(1); // m²
  return feature.set({
    'area_m2': area,
    'area_rai': area / 1600,
    'area_km2': area / 1e6
  });
});

// 9️⃣ แสดงผล
print(floodVectors);

// 10️⃣ Export เป็น Shapefile (ใช้ใน QGIS / ArcGIS)
Export.table.toDrive({
  collection: floodVectors,
  description: 'Flooded_Area_SHP',
  fileFormat: 'SHP'
});
