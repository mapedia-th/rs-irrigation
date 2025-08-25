// --------------------------
// 1) กำหนด AOI
// --------------------------
var aoi = ee.Geometry.Rectangle([100.2, 16.7, 100.7, 17.2]); // ตัวอย่าง (พิษณุโลก)

// --------------------------
// 2) เลือกภาพดาวเทียม (Sentinel-2)
// --------------------------
var image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate('2023-01-01', '2023-03-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .median()
  .clip(aoi);

// เลือก band ที่ใช้
var bands = ['B2','B3','B4','B8'];  // Blue, Green, Red, NIR
var input = image.select(bands);

// --------------------------
// 3) Sample ข้อมูล pixel
// --------------------------
var training = input.sample({
  region: aoi,
  scale: 10,
  numPixels: 5000,
  seed: 42,
  geometries: false
});

// --------------------------
// 4) Train Clusterer (KMeans = 5 classes)
// --------------------------
var clusterer = ee.Clusterer.wekaKMeans(5).train(training);

// --------------------------
// 5) Run Clustering
// --------------------------
var result = input.cluster(clusterer);

// --------------------------
// 6) แสดงผล
// --------------------------
Map.centerObject(aoi, 11);
Map.addLayer(image, {bands:['B4','B3','B2'], min:0, max:3000}, 'True Color');
Map.addLayer(result.randomVisualizer(), {}, 'Clusters');
