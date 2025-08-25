/*******************************************************
* 1) Ground Truth น้ำจาก ESA WorldCover 2021
*******************************************************/
var wc = ee.Image("ESA/WorldCover/v200/2021").clip(aoi);

// mask เฉพาะน้ำ (class890)
var waterMask = wc.eq(80);
print(waterMask)
Map.addLayer(waterMask.selfMask(), {palette:'blue'}, 'Water Mask');

// แปลงเป็น polygon
var waterROI = waterMask.selfMask().reduceToVectors({
  geometry: aoi,
  scale: 10,
  geometryType: 'polygon',
  labelProperty: 'class',
  reducer: ee.Reducer.countEvery()
});

// property class = 0 สำหรับน้ำ
waterROI = waterROI.map(function(f){ return f.set('class', 0); });
Map.addLayer(waterROI, {color:'blue'}, 'Water ROI');


/*******************************************************
* 2) เตรียม Sentinel-2 Feature Image
*******************************************************/
function maskS2sr(image){
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
             .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask);
}

var s2col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate('2024-01-01','2024-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',30))
  .map(maskS2sr)
  .map(function(img){
    var scaled = img.select(['B2','B3','B4','B8','B11','B12']).divide(10000);
    return img.addBands(scaled, null, true);
  });

var s2 = s2col.median().clip(aoi);

// คำนวณดัชนีน้ำ
var ndwi  = s2.normalizedDifference(['B3','B8']).rename('NDWI');
var mndwi = s2.normalizedDifference(['B3','B11']).rename('MNDWI');

// feature image
var featureImage = s2.select(['B2','B3','B4','B8','B11','B12'])
                      .addBands([ndwi, mndwi]);
Map.addLayer(s2, {bands:['B4','B3','B2'], min:0, max:0.3}, 'S2 RGB');

/*******************************************************
* 3) สร้าง Training/Test Set
*******************************************************/
// sample feature image ตาม ROI น้ำ
var samples = featureImage.sampleRegions({
  collection: waterROI,
  properties:['class'],
  scale:10,
  geometries:false
});

// สำหรับไม่ใช่น้ำ (background) → สุ่มจุดนอก waterROI
var nonWater = ee.FeatureCollection.randomPoints({
  region: aoi,
  points: samples.size(),  // same number of points
  seed: 42
}).map(function(f){ return f.set('class',1); });

// sample features สำหรับ non-water
var samplesNonWater = featureImage.sampleRegions({
  collection: nonWater,
  properties:['class'],
  scale:10,
  geometries:false
});

// รวม training data
var allSamples = samples.merge(samplesNonWater);

// split 70% train, 30% test
var withRand = allSamples.randomColumn({columnName:'rand', seed: 99});
var training = withRand.filter(ee.Filter.lt('rand',0.7));
var testing  = withRand.filter(ee.Filter.gte('rand',0.7));



/*******************************************************
* 4) Train Random Forest
*******************************************************/
var bands = featureImage.bandNames();
var rf = ee.Classifier.smileRandomForest(150)
          .train({
            features: training,
            classProperty: 'class',
            inputProperties: bands
          });

/*******************************************************
* 5) จำแนกน้ำ/ไม่ใช่น้ำ
*******************************************************/
var classified = featureImage.classify(rf).clip(aoi);
Map.addLayer(classified, {min:0,max:1,palette:['red','blue']}, 'RF Classification');

/*******************************************************
* 6) Accuracy Assessment
*******************************************************/
var testingPred = testing.classify(rf);
var cm = testingPred.errorMatrix('class','classification');
print('Confusion Matrix:', cm);
print('Overall Accuracy:', cm.accuracy());
print('Kappa:', cm.kappa());
print('Producers Accuracy (per class):', cm.producersAccuracy());


// แปลง raster เป็น vector
var vectors = classified.reduceToVectors({
  geometry: aoi,            // ขอบเขต
  scale: 10,                // resolution (เช่น Sentinel-2 ใช้ 10m)
  geometryType: 'polygon',  // แปลงเป็น polygon
  labelProperty: 'class',   // ตั้งชื่อ field ที่เก็บค่าคลาส
  reducer: ee.Reducer.countEvery(),
  eightConnected: true,
  maxPixels: 1e13
  
});

// 2) กรองเอาเฉพาะ class = 0
var class0 = vectors.filter(ee.Filter.eq('class', 0));

// 3) เพิ่ม field area
class0 = class0.map(function(feature) {
  var geom = feature.geometry().simplify(0.1); // simplify geometry
  var area = geom.area(1); // area with margin
  return feature.set({
    'area_m2': area,
    'area_rai': area / 1600,
    'area_km2': area / 1e6
  });
});

// 4) Export เฉพาะ class 0
Export.table.toDrive({
  collection: class0,
  description: 'RF_Classification_Class0_SHP',
  fileFormat: 'SHP'
});

Map.addLayer(vectors)