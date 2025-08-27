/*******************************************************
* 1️⃣ กำหนดพื้นที่สนใจ (AOI)
*******************************************************/
var aoi = ee.Geometry.Rectangle([100.2, 16.7, 100.7, 17.2]); // ตัวอย่าง: พิษณุโลก
Map.centerObject(aoi, 11);

/*******************************************************
* 2️⃣ โหลด DEM และ Slope
*******************************************************/
var dem = ee.Image('USGS/SRTMGL1_003').clip(aoi);
var slope = ee.Terrain.slope(dem);

// แสดง DEM และ Slope
Map.addLayer(dem, {min:0, max:500}, 'DEM');
Map.addLayer(slope, {min:0, max:30}, 'Slope');

/*******************************************************
* 3️⃣ โหลด Sentinel-1 SAR (Flood Detection)
*******************************************************/
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
            .filterBounds(aoi)
            .filterDate('2025-07-20','2025-07-30')
            .filter(ee.Filter.eq('instrumentMode','IW'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation','VV'))
            .mean()
            .select('VV')
            .clip(aoi);

/*******************************************************
* 4️⃣ โหลด Rainfall (GPM) - Optional
*******************************************************/
var rainfall = ee.ImageCollection('NASA/GPM_L3/IMERG_V07')
                 .filterDate('2025-07-20','2025-07-30')
                 .sum()
                 .clip(aoi);

/*******************************************************
* 5️⃣ ให้คะแนนแต่ละปัจจัย (1-3)
*******************************************************/
// DEM Score: Low elevation = high risk
var demScore = dem.expression(
  "b('elevation') < 20 ? 3 : (b('elevation') < 50 ? 2 : 1)"
).rename('DEM_Score');

// Slope Score: Flat = high risk
var slopeScore = slope.expression(
  "b('slope') < 5 ? 3 : (b('slope') < 10 ? 2 : 1)"
).rename('Slope_Score');

// SAR Score: Flood detected = high risk
var sarScore = s1.lt(-12).multiply(2).add(1).rename('SAR_Score'); // 1-3

// Rainfall Score: More rain = high risk
var rainScore = rainfall.expression(
  "b('precipitation') < 20 ? 1 : (b('precipitation') < 50 ? 2 : 3)"
).rename('Rain_Score');

/*******************************************************
* 6️⃣ รวม weighted score
*******************************************************/
var riskIndex = demScore.multiply(0.4)
                .add(slopeScore.multiply(0.2))
                .add(sarScore.multiply(0.1))
                .add(rainScore.multiply(0.3))
                .rename('RiskIndex');

/*******************************************************
* 7️⃣ แบ่งเป็น High / Medium / Low
*******************************************************/
var riskClass = riskIndex.expression(
  "b('RiskIndex') >= 2.5 ? 3 : (b('RiskIndex') >= 1.5 ? 2 : 1)"
).rename('RiskClass'); // 3=High, 2=Medium, 1=Low

Map.addLayer(riskClass.selfMask(), {min:1, max:3, palette:['green','yellow','red']}, 'Flood Risk Class');

/*******************************************************
* 8️⃣ Export vector
*******************************************************/
var riskVectors = riskClass.selfMask().reduceToVectors({
  geometry: aoi,
  scale: 30,
  geometryType:'polygon',
  labelProperty:'RiskClass',
  reducer: ee.Reducer.countEvery(),
  maxPixels: 1e13,
  bestEffort:true
});

Map.addLayer(riskVectors, {color:'red'}, 'Flood Risk Vectors');

Export.table.toDrive({
  collection:riskVectors,
  description:'Weighted_Flood_Risk',
  fileFormat:'SHP'
});
