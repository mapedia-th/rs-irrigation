# 1. EE Objects and Methods
```js
// =================================================================================
// TODO 1: การสร้าง Object ของ Earth Engine
// ในส่วนนี้ เราจะเรียนรู้วิธีการสร้าง Object พื้นฐานใน Earth Engine
// เช่น Geometry ซึ่งเป็นตัวแทนของพื้นที่บนแผนที่
// =================================================================================

// สร้าง Object ประเภทรูปหลายเหลี่ยม (Polygon) จากพิกัดที่กำหนด
// พิกัดอยู่ในรูปแบบ [ลองจิจูด, ละติจูด]

var geometry = ee.Geometry.Polygon([
  [
    [99.74963537611364, 17.112622728755497],
    [99.74963537611364, 16.753273777391442],
    [100.12022667481904, 16.753273777391442],
    [100.12022667481904, 17.112622728755497],
    [99.74963537611364, 17.112622728755497]
  ]
]);

print('Geometry:', geometry);

// =================================================================================
// TODO 2: การสร้าง Feature และการกำหนดคุณสมบัติ (Properties)
// Feature คือ Geometry ที่มีข้อมูลคุณสมบัติแนบไปด้วย
// เราสามารถเพิ่มข้อมูลต่างๆ เช่น ชื่อ, รหัสพื้นที่, หรือค่าที่วัดได้
// =================================================================================

// สร้าง Feature จาก 'geometry' ที่เราสร้างไว้ก่อนหน้า
// พร้อมกับกำหนดคุณสมบัติ (property) 'name' ให้มีค่าเป็น 'Sukhothai'

// var feature = ee.Feature(geometry, {
//   name: 'Sukhothai Extent',
//   household: 389,
//   population: 3500,
//   elevation: 45
// });

// แสดงผลข้อมูล Feature ในหน้าต่าง Console
// print('Feature:', feature);


// =================================================================================
// TODO 3: การเรียกใช้ Method ของ Object และการแปลงหน่วย
// Object ใน Earth Engine มีฟังก์ชัน (Method) ที่เราสามารถเรียกใช้เพื่อประมวลผลได้
// ตัวอย่างเช่น การคำนวณพื้นที่ของ Geometry และการแปลงหน่วยพื้นที่
// =================================================================================

// เรียกใช้ method .geometry() เพื่อเข้าถึงรูปทรงของ feature
// จากนั้นเรียก .area() เพื่อคำนวณพื้นที่ (หน่วยพื้นฐานคือตารางเมตร)
// var area_sqm = feature.geometry().area();

// แปลงหน่วยจากตารางเมตรเป็นตารางกิโลเมตร (1 ตร.กม. = 1,000,000 ตร.ม.)
// var area_sqkm = area_sqm.divide(1000 * 1000);

// แปลงหน่วยจากตารางเมตรเป็นไร่ (1 ไร่ = 1,600 ตร.ม.)
// var area_rai = area_sqm.divide(1600);

// แสดงผลค่าพื้นที่ที่คำนวณได้ในหน่วยต่างๆ ที่หน้าต่าง Console
// print('Area (square meters):', area_sqm);
// print('Area (square kilometers):', area_sqkm);
// print('Area (Rai):', area_rai);


// =================================================================================
// TODO 4: การจัดการการแสดงผลบนแผนที่ (Map)
// เราสามารถควบคุมการแสดงผลบนแผนที่ได้ เช่น การซูมไปยังพื้นที่ที่สนใจ
// และการเพิ่มชั้นข้อมูล (Layer) เพื่อแสดงผล Object ของเรา
// =================================================================================

// สั่งให้แผนที่ซูมไปยังศูนย์กลางของ 'feature' ด้วยระดับการซูมที่ 10
// Map.centerObject(feature, 10);

// เพิ่ม 'feature' ของเราลงบนแผนที่ให้เป็นชั้นข้อมูลใหม่
// พร้อมกำหนดค่าการแสดงผล เช่น สีของพื้นที่
// และตั้งชื่อ Layer ว่า 'Sukhothai Extent'
// Map.addLayer(feature, {
//   color: 'red'
// }, 'Sukhothai Extent');

```
----

# 2. Earth Engine objects for image and image collection
## 2.1 ImageCollection
```js
// =================================================================================
// TODO 1: สร้างและกรองชุดข้อมูลภาพ (ImageCollection)
// ในส่วนนี้ เราจะเรียนรู้การทำงานกับชุดข้อมูลภาพถ่ายดาวเทียมหลายๆ ภาพ
// =================================================================================

// 1.1 สร้าง Object ประเภท ImageCollection จากชุดข้อมูล Landsat 9
// และกรองข้อมูล (filter) เฉพาะภาพที่ถ่ายในช่วงวันที่ 1 ม.ค. - 31 มี.ค. 2024
var dataset = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA')
  .filterDate('2024-01-01', '2024-03-31');


// =================================================================================
// TODO 2: เตรียมข้อมูลสำหรับการแสดงผล
// หลังจากได้ชุดข้อมูลที่กรองแล้ว เราจะเลือกแบนด์และตั้งค่าการแสดงผล
// =================================================================================

// 2.1 เลือกแบนด์ที่ต้องการแสดงผล (B4=Red, B3=Green, B2=Blue) จากทุกภาพใน Collection
// var trueColor432 = dataset.select(['B4', 'B3', 'B2']);

// 2.2 กำหนดค่าพารามิเตอร์สำหรับการแสดงผล (Visualization Parameters)
// เพื่อปรับความสว่างและความคมชัดของภาพ
// var trueColor432Vis = {
//   min: 0.0,
//   max: 0.4,
// };


// =================================================================================
// TODO 3: แสดงผลลัพธ์บนแผนที่
// ขั้นตอนสุดท้ายคือการกำหนดมุมมองและเพิ่มชั้นข้อมูล (Layer) ลงบนแผนที่
// =================================================================================

// 3.1 กำหนดจุดศูนย์กลางและระดับการซูมของแผนที่
// Map.setCenter(99.9109, 16.9294, 9);

// 3.2 เพิ่ม Layer ของ ImageCollection ที่ผ่านการกรองและเลือกแบนด์แล้ว
// GEE จะทำการรวมภาพ (mosaic) ที่ดีที่สุดในช่วงเวลาที่เราเลือกมาแสดงผลโดยอัตโนมัติ
// Map.addLayer(trueColor432, trueColor432Vis, 'True Color (432)');

```
---
## 2.2 Image
```js
// =================================================================================
// TODO 1: กำหนดเงื่อนไขการค้นหาภาพถ่ายดาวเทียม
// ในส่วนนี้ เราจะกำหนดค่าต่างๆ เพื่อใช้ในการกรองข้อมูล
// =================================================================================

// 1.1 ระบุ Path และ Row ของพื้นที่ที่สนใจ
var path = 130;
var row = 48;

// 1.2 ระบุช่วงวันที่ที่ต้องการ
var startDate = '2024-01-01';
var endDate = '2024-03-31';

// 1.3 กำหนดเปอร์เซ็นต์เมฆสูงสุดที่ยอมรับได้
var maxCloudCover = 10;


// =================================================================================
// TODO 2: ค้นหาและกรองชุดข้อมูลภาพ (ImageCollection) ตามเงื่อนไข
// เราจะใช้เงื่อนไขจาก TODO 1 มากรองชุดข้อมูล Landsat 9
// =================================================================================

// 2.1 กรอง Image Collection ตาม Path, Row, ช่วงเวลา, และเปอร์เซ็นต์เมฆ
var filteredCollection = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA')
  .filter(ee.Filter.eq('WRS_PATH', path))                   // กรองตาม Path
  .filter(ee.Filter.eq('WRS_ROW', row))                     // กรองตาม Row
  .filterDate(startDate, endDate)                           // กรองตามช่วงเวลา
  .filter(ee.Filter.lt('CLOUD_COVER', maxCloudCover));      // กรองภาพที่มีเมฆน้อยกว่า 10%

// 2.2 พิมพ์ผลลัพธ์เพื่อตรวจสอบว่ามีภาพที่ตรงตามเงื่อนไขหรือไม่
// print('Collection ที่กรองแล้ว:', filteredCollection);

// 2.3 แสดงผลภาพทั้งหมดที่ผ่านการกรองบนแผนที่
// Map.addLayer(filteredCollection, {
//   bands: ['B4', 'B3', 'B2'],
//   max: 0.3
// }, 'Filtered Collection');


// =================================================================================
// TODO 3: เลือกภาพที่ดีที่สุดและดึงข้อมูล ID
// จาก Collection ที่กรองแล้ว เราจะเลือกมา 1 ภาพ (ภาพแรกสุด) เพื่อนำไปใช้งานต่อ
// =================================================================================

// 3.1 ดึงภาพแรก (ที่ดีที่สุด) ออกมาจาก Collection
// var firstImage = filteredCollection.first();

// 3.2 ดึงเอาเฉพาะ ID ของภาพนั้นออกมา
// var imageId = firstImage.id();

// 3.3 พิมพ์ ID ออกมาดูใน Console
// print('ID ของภาพแรกที่พบ:', imageId);


// =================================================================================
// TODO 4: การจัดการข้อมูลภาพเดี่ยว (ee.Image) โดยใช้ ID ที่ได้มา
// นำ ID ที่ได้จากขั้นตอนที่แล้ว มาสร้างเป็น Object ภาพเดี่ยวเพื่อวิเคราะห์ต่อ
// =================================================================================

// 4.1 สร้าง Object ประเภท Image โดยอ้างอิงจาก ID ที่เราค้นหามาได้
// var imageFromId = ee.Image('LANDSAT/LC09/C02/T1_TOA/LC09_130048_20240213');

// --- การเรียกใช้ Method ของ Object ประเภท Image ---
// 4.2 นับจำนวนแบนด์ทั้งหมดในภาพ
// var bandCount = imageFromId.bandNames().length();
// print('Band count:', bandCount);

// 4.3 ตรวจสอบชื่อแบนด์ทั้งหมดที่มีในภาพ
// var bandNames = imageFromId.bandNames();
// print('Band names:', bandNames);

// --- การแสดงผลบนแผนที่ ---

// 4.4 ซูมแผนที่ไปยังตำแหน่งของภาพ
// Map.centerObject(imageFromId, 9);

// 4.5 เพิ่ม Layer ของภาพเดี่ยวที่เลือกมาลงบนแผนที่ เพื่อเปรียบเทียบ
// Map.addLayer(imageFromId, {
//   bands: ['B4', 'B3', 'B2'],
//   min: 0,
//   max: 0.3000
// }, 'Single Image from ID');

```
---
# 3. Method Chaining
- Method Chaining คือเทคนิคการเขียนโค้ดโดยการเรียกใช้ฟังก์ชัน (Method) ต่อๆ กันไปเรื่อยๆ ในบรรทัดเดียว โดยใช้เครื่องหมายจุด . เป็นตัวเชื่อม เหมือนกับการต่อโซ่
```js
// =================================================================================
// TODO 0: กำหนดพื้นที่ตั้งต้น (Geometry)
// เราจะสร้างพื้นที่สี่เหลี่ยม (Polygon) เพื่อใช้ในการกรองข้อมูล
// =================================================================================
var geometry = ee.Geometry.Polygon([
  [
    [99.74963537611364, 17.112622728755497],
    [99.74963537611364, 16.753273777391442],
    [100.12022667481904, 16.753273777391442],
    [100.12022667481904, 17.112622728755497],
    [99.74963537611364, 17.112622728755497]
  ]
]);


// =================================================================================
// TODO 1: การเขียนโค้ดแบบไม่ใช้ Method Chaining (เปรียบเทียบ)
// วิธีนี้จะสร้างตัวแปรใหม่ในแต่ละขั้นตอน ทำให้โค้ดยาวขึ้น
// =================================================================================

// 1.1 เรียกใช้ภาพเดี่ยว
var image = ee.Image('LANDSAT/LC09/C02/T1_TOA/LC09_130048_20240213');

// 1.2 เลือกแต่ละแบนด์มาเก็บในตัวแปรแยกกัน
var band4 = image.select('B4');
var band3 = image.select('B3');
var band2 = image.select('B2');

// 1.3 รวมแบนด์กลับเข้าด้วยกัน
var rgb = band4.addBands(band3).addBands(band2);

// 1.4 แสดงผลภาพบนแผนที่
Map.centerObject(image, 10);
// หมายเหตุ: เราสามารถใช้ image.select(['B4', 'B3', 'B2']) เพื่อเลือกแบนด์ทีเดียวได้
Map.addLayer(image.select(['B4', 'B3', 'B2']), {min: 0.0, max: 0.3}, 'RGB (Non-chaining)');


// =================================================================================
// TODO 2: การใช้ Method Chaining กับ ImageCollection
// วิธีนี้จะเชื่อมต่อแต่ละคำสั่งเข้าด้วยกัน ทำให้โค้ดสั้นและอ่านง่าย
// =================================================================================

// var collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA')
//     .filterDate('2024-01-01', '2024-03-31')   // 1. กรองตามวันที่
//     .filterBounds(geometry)                   // 2. กรองเฉพาะภาพที่อยู่ในพื้นที่ geometry
//     .select(['B5', 'B4', 'B3', 'B2'])         // 3. เลือกแบนด์ที่ต้องการ
//     .mean();                                  // 4. คำนวณค่าเฉลี่ยของทุกภาพที่กรองมาได้ เช่น .first(), mean(), .mosaic()

// Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], min: 0.0, max: 0.3}, 'Mean Image (Chaining)');


// =================================================================================
// TODO 3: การใช้ Method Chaining ร่วมกับฟังก์ชัน (.map)
// เราสามารถสร้างฟังก์ชันเอง แล้วใช้ .map() เพื่อสั่งให้ฟังก์ชันนั้นทำงานกับทุกภาพใน Collection
// =================================================================================

// 3.1 สร้างฟังก์ชันสำหรับคำนวณค่า NDVI
function calculateNDVI(image) {
    // .normalizedDifference คือสูตร (NIR - Red) / (NIR + Red)
    // สำหรับ Sentinel-2 คือ (B8 - B4) / (B8 + B4)
    return image.normalizedDifference(['B8', 'B4']).rename('NDVI');
}

// 3.2 ใช้ Method Chaining และ .map()
// var filtered = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
//     .filterDate('2024-01-01', '2024-03-31')   // 1. กรองตามวันที่
//     .filterBounds(geometry)                   // 2. กรองตามพื้นที่
//     .map(calculateNDVI)                       // 3. **ส่งฟังก์ชัน calculateNDVI เข้าไปทำงานกับทุกภาพ**
//     .select('NDVI')                           // 4. เลือกเฉพาะแบนด์ NDVI ที่คำนวณเสร็จแล้ว
//     .mean();                                  // 5. หาค่าเฉลี่ยของ NDVI

// Map.addLayer(filtered, {min: 0, max: 1, palette: ['blue', 'white', 'green']}, 'Mean NDVI (Chaining with Map)');

```
---
# 4. NDVI Calculation Workflow
```js
// =================================================================================
// TODO 1: กำหนดพื้นที่และเงื่อนไขการค้นหาข้อมูล
// ในส่วนนี้ เราจะกำหนดพื้นที่ที่สนใจและกรองข้อมูลภาพถ่ายดาวเทียม Sentinel-2
// =================================================================================

// 1.1 กำหนดพื้นที่ตั้งต้น (Geometry) เพื่อใช้ในการกรองข้อมูล
var geometry = ee.Geometry.Polygon([
  [
    [99.74963537611364, 17.112622728755497],
    [99.74963537611364, 16.753273777391442],
    [100.12022667481904, 16.753273777391442],
    [100.12022667481904, 17.112622728755497],
    [99.74963537611364, 17.112622728755497]
  ]
]);

// 1.2 กรองชุดข้อมูล (ImageCollection) ของ Sentinel-2 ตามช่วงวันที่และพื้นที่ที่กำหนด
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2025-02-01', '2025-06-28')
  .filterBounds(geometry);


// =================================================================================
// TODO 2: สร้างภาพสังเคราะห์ (Composite) เพื่อลดผลกระทบจากเมฆ
// เราจะรวมภาพทั้งหมดที่กรองมาได้ให้เป็นภาพเดียวโดยใช้ค่ามัธยฐาน (Median)
// =================================================================================

// 2.1 สร้างภาพสังเคราะห์จากค่ามัธยฐานของทุกพิกเซลใน Collection
var composite = s2.median();


// =================================================================================
// TODO 3: คำนวณค่าดัชนีพืชพรรณ (NDVI)
// NDVI คือค่าที่บ่งบอกความสมบูรณ์ของพืชพรรณ คำนวณจากแบนด์ Near-Infrared (NIR) และ Red
// =================================================================================

// 3.1 คำนวณ NDVI โดยใช้ฟังก์ชัน normalizedDifference()
// สูตรคือ (NIR - Red) / (NIR + Red) หรือ (B8 - B4) สำหรับ Sentinel-2
var ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');

// 3.2 เพิ่มแบนด์ NDVI ที่คำนวณได้เข้าไปในภาพ composite เดิม
var compositeWithNDVI = composite.addBands(ndvi);

// 3.3 พิมพ์ข้อมูลของภาพสุดท้ายเพื่อตรวจสอบแบนด์ทั้งหมด
print('Image with NDVI:', compositeWithNDVI);


// =================================================================================
// TODO 4: กำหนดค่าการแสดงผลและเพิ่ม Layer บนแผนที่
// เราจะกำหนดชุดสี (Palette) เพื่อให้มองเห็นค่า NDVI ได้ง่าย และนำไปแสดงผล
// =================================================================================

// 4.1 กำหนดชุดสีสำหรับแสดงผล NDVI (ค่าต่ำไปสูง: น้ำตาล -> เหลือง -> เขียว)
var palette = [
  'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
  '74A901', '66A000', '529400', '3E8601', '207401', '056201',
  '004C00', '023B01', '012E01', '011D01', '011301'
];

// 4.2 กำหนดพารามิเตอร์การแสดงผล โดยระบุค่า min, max และชุดสี
var ndviVis = {
  min: 0,
  max: 0.7,
  palette: palette
};


// 4.3 เพิ่มชั้นข้อมูล (Layer) ของ NDVI ลงบนแผนที่
Map.centerObject(geometry, 10);
Map.addLayer(compositeWithNDVI.select('NDVI'), ndviVis, 'NDVI');

// 4.4 Clip bbox geometry
// var clippedNdvi = compositeWithNDVI.clip(geometry);
// Map.addLayer(clippedNdvi.select('NDVI'), ndviVis, 'NDVI Clip');

```
---
# 5. SRTM and Contour
```js
// =================================================================================
// TODO 1: การเตรียมข้อมูลพื้นฐาน (DEM และพื้นที่ศึกษา)
// =================================================================================

// 1.1 กำหนดพื้นที่ศึกษา (Area of Interest - AOI)
var AOI = ee.Geometry.Polygon([
  [
    [99.44736075297868, 17.07099803265264],
    [99.44736075297868, 16.71116666584878],
    [99.75833663457848, 16.71116666584878],
    [99.75833663457848, 17.07099803265264],
    [99.44736075297868, 17.07099803265264]
  ]
]);

// 1.2 เรียกใช้ข้อมูล DEM จาก SRTM และเลือกเฉพาะแบนด์ 'elevation'
var strmelevation = ee.Image("USGS/SRTMGL1_003").select('elevation');

// =================================================================================
// TODO 2: การแสดงผล DEM และ Hillshade
// เพื่อให้เห็นภาพรวมของลักษณะภูมิประเทศ
// =================================================================================

// 2.1 สร้าง Hillshade (ภาพจำลองแสงเงา) จากข้อมูล DEM
var hillshade = ee.Terrain.hillshade(strmelevation);

// 2.2 กำหนดค่าการแสดงผลสำหรับ DEM โดยใช้ชุดสี Terrain
var demVis = {
  min: 0,
  max: 1500,
  palette: ['006633', 'E5FFCC', '662A00', 'D8D8D8', 'FFFFFF']
};

// 2.3 เพิ่ม Layer ของ DEM และ Hillshade ลงบนแผนที่
Map.addLayer(strmelevation.clip(AOI), demVis, 'DEM', false); // false = ปิดไว้ก่อน
Map.addLayer(hillshade.clip(AOI), {min: 0, max: 255}, 'Hillshade', false); // false = ปิดไว้ก่อน

// =================================================================================
// TODO 3: สร้าง Contour โดยใช้ `zeroCrossing` (วิธีที่แนะนำ)
// หลักการ: หาพิกเซลที่เป็นเส้นขอบระหว่างโซนความสูงที่กำหนด
// =================================================================================

// 3.1 สร้างรายการระดับความสูงที่ต้องการสร้างเส้น (จาก 0 ถึง 2500 เมตร ทุกๆ 20 เมตร)
var lines = ee.List.sequence(0, 2500, 20);

// 3.2 สร้างฟังก์ชันเพื่อวนซ้ำการสร้างเส้น Contour ในแต่ละระดับความสูง
var contourlines = lines.map(function(line) {
  var mycontour = strmelevation
    .convolve(ee.Kernel.gaussian(5, 3)) // ปรับ DEM ให้เรียบเนียน
    .subtract(ee.Image.constant(line)).zeroCrossing() // หาเส้นขอบ
    .multiply(ee.Image.constant(line)).toFloat();
    
  return mycontour.mask(mycontour); // ทำให้พื้นหลังโปร่งใส
});

// 3.3 รวมเส้น Contour ทั้งหมดให้เป็นภาพเดียว
var contourlinesImage = ee.ImageCollection(contourlines).mosaic();

// 3.4 เพิ่ม Layer ของเส้น Contour ลงบนแผนที่
Map.addLayer(contourlinesImage.clip(AOI), {min: 0, max: 2500, palette:['ff0000']}, 'Contour (20m)');
Map.centerObject(AOI, 11);

```
# 6. Supervise Classification
```js
// 1. การจำแนกการใช้ประโยชน์ที่ดินแบบควบคุม (5 คลาส) โดยใช้ข้อมูล Sentinel-2 ในสองช่วงเวลา

// กำหนดขอบเขตพื้นที่ศึกษา (Region of Interest)
var roi = ee.Geometry.Polygon([
  [
    [100.75232211164234, 15.38193990270986],
    [100.75232211164234, 14.831900794708048],
    [101.30535273127566, 14.831900794708048],
    [101.30535273127566, 15.38193990270986],
    [100.75232211164234, 15.38193990270986]
  ]
]);

// 2. โหลดข้อมูลสำหรับฝึก (Training Data) ซึ่งเป็น FeatureCollection ของจุดหรือโพลีกอน
//    ต้องมี property ชื่อ 'landcover' ที่มีค่า 0–4 (สำหรับ 5 คลาส)
//    ตัวอย่าง: 0=แหล่งน้ำ, 1=ป่าไม้, 2=เขตเมือง, 3=เกษตรกรรม, 4=ที่ดินว่างเปล่า
// TODO: แก้ไข 'YOUR_ASSET_PATH' ให้เป็น Asset Path ของข้อมูล Training ที่คุณเตรียมไว้
var trainingFC = ee.FeatureCollection('projects/ee-end-to-end-gee/assets/roi');


print('ข้อมูลสำหรับฝึก:', trainingFC);
Map.addLayer(trainingFC, {
  color: 'blue'
}, 'Training Points');


// 3. โหลดข้อมูล Sentinel-2 และสร้างภาพ Composite สำหรับสองช่วงเวลา
// TODO: แก้ไขช่วงเวลาที่สอง (start2, end2) ให้เป็นช่วงเวลาในอดีตที่ต้องการเปรียบเทียบ
var start1 = '2019-01-01',
  end1 = '2019-12-31';
var start2 = '2024-01-01',
  end2 = '2024-12-31';

function makeComposite(start, end) {
  return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate(start, end)
    .filterBounds(roi)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .median()
    .clip(roi);
}

var comp1 = makeComposite(start1, end1);
var comp2 = makeComposite(start2, end2);

// 4. เลือกแบนด์ (Spectral Bands) ที่จะใช้ในการจำแนก
var bands = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12']; // Blue, Green, Red, NIR, SWIR1, SWIR2

// 5. สุ่มตัวอย่างค่าแบนด์จากภาพ Composite ณ ตำแหน่งของข้อมูลสำหรับฝึก
var samples1 = comp1.select(bands).sampleRegions({
  collection: trainingFC,
  properties: ['landcover'],
  scale: 10,
  geometries: true
});

var samples2 = comp2.select(bands).sampleRegions({
  collection: trainingFC,
  properties: ['landcover'],
  scale: 10,
  geometries: true
});

// 6. ฝึกโมเดลจำแนก (Random Forest) สำหรับแต่ละช่วงเวลา
var classifier1 = ee.Classifier.smileRandomForest(100)
  .train({
    features: samples1,
    classProperty: 'landcover',
    inputProperties: bands
  });

var classifier2 = ee.Classifier.smileRandomForest(100)
  .train({
    features: samples2,
    classProperty: 'landcover',
    inputProperties: bands
  });


// 7. จำแนกประเภทการใช้ที่ดินจากภาพ Composite
var classified1 = comp1.select(bands).classify(classifier1);
var classified2 = comp2.select(bands).classify(classifier2);

// 8. กำหนดชุดสี (Palette) สำหรับ 5 คลาส
// TODO: คุณสามารถแก้ไขรหัสสีได้ตามต้องการ
var palette = [
  '0000FF', // 0 = แหล่งน้ำ (น้ำเงิน)
  '007F00', // 1 = ป่าไม้ (เขียวเข้ม)
  'FF0000', // 2 = เขตเมือง (แดง)
  'FFFF00', // 3 = เกษตรกรรม (เหลือง)
  '804000', // 4 = ที่ดินว่างเปล่า (น้ำตาล)
];

// 9. แสดงผลลัพธ์บนแผนที่
Map.centerObject(roi, 10);
Map.addLayer(comp1, {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
}, 'ภาพสีจริง ' + start1.slice(0, 4), false);
Map.addLayer(classified1, {
  min: 0,
  max: 4,
  palette: palette
}, 'ผลการจำแนก ' + start1.slice(0, 4), true);

Map.addLayer(comp2, {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
}, 'ภาพสีจริง ' + start2.slice(0, 4), false);
Map.addLayer(classified2, {
  min: 0,
  max: 4,
  palette: palette
}, 'ผลการจำแนก ' + start2.slice(0, 4), true);

// 10. (ทางเลือก) การประเมินความแม่นยำสำหรับช่วงเวลาที่ 1
// TODO: หากต้องการประเมินความแม่นยำ 

var trainTest1 = samples1.randomColumn('rnd', 42);
var split = 0.7;
var trainSet = trainTest1.filter(ee.Filter.lt('rnd', split));
var testSet = trainTest1.filter(ee.Filter.gte('rnd', split));

var trainedRF = ee.Classifier.smileRandomForest(100)
    .train({features: trainSet, classProperty: 'landcover', inputProperties: bands});

var validated = testSet.classify(trainedRF);

var testAccuracy = validated.errorMatrix('landcover', 'classification');
print('ตาราง Confusion Matrix (ช่วงเวลาที่ 1):', testAccuracy);
print('ความแม่นยำโดยรวม:', testAccuracy.accuracy());


// 11. (ทางเลือก) การส่งออกผลลัพธ์ (Export)
// TODO: หากต้องการส่งออกผลลัพธ์เป็นไฟล์ GeoTIFF ให้นำเครื่องหมาย /* และ */ ออก และแก้ไขชื่อไฟล์ตามต้องการ
/*
Export.image.toDrive({
  image: classified1,
  description: 'LandUse_Classification_2019',
  folder: 'GEE_Exports',
  scale: 10,
  region: roi,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: classified2,
  description: 'LandUse_Classification_2024',
  folder: 'GEE_Exports',
  scale: 10,
  region: roi,
  maxPixels: 1e13
});
*/

```
---
# 7. Drought Monitoring using CHIRPS Precipitation Data
```
โค้ดนี้มีขั้นตอนการทำงานหลักๆ ดังนี้:

โหลดข้อมูล: เริ่มจากการดึงข้อมูลสำคัญ 2 อย่างคือ ขอบเขตของประเทศไทย และข้อมูลปริมาณน้ำฝนรายวันย้อนหลังจากดาวเทียม CHIRPS

กำหนดช่วงเวลา: เราต้องกำหนดช่วงเวลา 3 เดือนที่ต้องการวิเคราะห์ (เช่น มกราคม-มีนาคม 2024) โค้ดจะคำนวณปริมาณน้ำฝนรวมทั้งหมดใน 3 เดือนนี้

สร้างข้อมูลเปรียบเทียบ: เพื่อให้รู้ว่าฝนที่ตกนั้น "น้อย" หรือ "มาก" เราต้องมีค่าปกติไว้เปรียบเทียบ โค้ดจึงไปคำนวณปริมาณน้ำฝนรวมในช่วงเวลาเดียวกัน (มกราคม-มีนาคม) ของทุกๆ ปีย้อนหลัง (ตั้งแต่ปี 1981-2023) เพื่อสร้างเป็นชุดข้อมูลฐาน

คำนวณค่าทางสถิติ: จากข้อมูลย้อนหลังทั้งหมด จะถูกนำมาหา ค่าเฉลี่ย (mean) และ ค่าเบี่ยงเบนมาตรฐาน (stddev) ซึ่งเป็นตัวแทนของ "สภาวะฝนปกติ" ในอดีต

คำนวณดัชนี SPI: นี่คือหัวใจหลัก คือการนำเอา (ปริมาณฝนปัจจุบัน - ปริมาณฝนเฉลี่ยในอดีต) แล้วหารด้วย ค่าเบี่ยงเบนมาตรฐาน ผลลัพธ์ที่ได้คือค่า SPI ซึ่งจะบอกเราว่าปริมาณฝนในปัจจุบันเบี่ยงเบนไปจากค่าปกติมากน้อยแค่ไหน

แสดงผล: สุดท้ายคือการนำค่า SPI มาแสดงผลบนแผนที่ โดยใช้สีต่างๆ เพื่อให้ง่ายต่อการตีความ

สีโทนร้อน (แดง, ส้ม): หมายถึงฝนน้อยกว่าปกติ (สภาวะแห้งแล้ง)

สีโทนเย็น (เขียว): หมายถึงฝนมากกว่าปกติ (สภาวะชื้น)
```
```js
// หัวข้อ: การเฝ้าระวังภัยแล้งโดยใช้ข้อมูลปริมาณน้ำฝน CHIRPS

// 1. โหลดข้อมูลขอบเขตประเทศไทย และข้อมูลปริมาณน้ำฝนรายเดือนจาก CHIRPS
// TODO: คุณสามารถเปลี่ยนขอบเขตเป็นจังหวัดหรือภูมิภาคได้โดยแก้ไขส่วน filter
var thailand = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
  .filter(ee.Filter.eq('country_na', 'Thailand'));
var precip = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .select('precipitation');

// 2. กำหนดช่วงเวลา 3 เดือนที่สนใจเพื่อคำนวณดัชนีฝนมาตรฐาน (SPI-3)
// TODO: แก้ไขวันที่ '2024-01-01' เป็นวันที่เริ่มต้นของช่วงเวลา 3 เดือนที่คุณต้องการวิเคราะห์
var targetDate = ee.Date('2024-01-01');
var endPeriod = targetDate.advance(3, 'month');
print('ช่วงเวลาที่สนใจ:', targetDate, endPeriod);

// คำนวณปริมาณน้ำฝนรวมในช่วงเวลา 3 เดือนที่สนใจ
var current3mo = precip
  .filterDate(targetDate, endPeriod)
  .sum();

// 3. สร้างชุดข้อมูลปริมาณน้ำฝนรวม 3 เดือนย้อนหลัง
// TODO: คุณสามารถปรับช่วงปีในอดีต (1981, 2023) เพื่อใช้เป็นข้อมูลฐานในการเปรียบเทียบได้
var years = ee.List.sequence(1981, 2023);
var historical3mo = ee.ImageCollection.fromImages(
  years.map(function(y) {
    var start = ee.Date.fromYMD(y, 1, 1); // เริ่มจากเดือนมกราคมของแต่ละปี
    var end = start.advance(3, 'month'); // สิ้นสุดที่เดือนมีนาคม

    return precip
      .filterDate(start, end)
      .sum()
      .set('system:time_start', start.millis());
  }));
print('ชุดข้อมูลย้อนหลัง:', historical3mo);

// 4. คำนวณค่าเฉลี่ยและค่าเบี่ยงเบนมาตรฐานจากข้อมูลในอดีต
// สองค่านี้เป็นตัวแทนของสภาพอากาศปกติในอดีตสำหรับช่วงเวลานั้นๆ
var mean3mo = historical3mo.mean();
var stddev3mo = historical3mo.reduce(ee.Reducer.stdDev());
print('ค่าเฉลี่ยน้ำฝนในอดีต:', mean3mo);

// 5. คำนวณค่า SPI-3 (โดยประมาณ) จากค่าความผิดปกติมาตรฐาน
// สูตรคือ: (ฝนปัจจุบัน - ฝนเฉลี่ยในอดีต) / ค่าเบี่ยงเบนมาตรฐาน
var spi3 = current3mo
  .subtract(mean3mo)
  .divide(stddev3mo)
  .clip(thailand);

// 6. กำหนดพารามิเตอร์สำหรับแสดงภาพค่า SPI
// ค่าบวก (สีเขียว) หมายถึง สภาวะชื้นกว่าปกติ
// ค่าลบ (สีแดง/ส้ม) หมายถึง สภาวะแห้งแล้งกว่าปกติ
var spiVis = {
  min: -2,
  max: 2,
  palette: [
    '#d73027', // แล้งรุนแรง
    '#fc8d59',
    '#fee08b',
    '#d9ef8b', // ใกล้เคียงปกติ
    '#91cf60',
    '#1a9850' // ชื้น
  ]
};

// 7. แสดงผลชั้นข้อมูล SPI และเพิ่มคำอธิบายสัญลักษณ์ (Legend)
Map.centerObject(thailand, 6);
Map.addLayer(spi3, spiVis, 'SPI-3 (Jan-Mar 2024)');

// สร้าง Panel สำหรับ Legend
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px',
    backgroundColor: 'white',
    fontWeight: 'bold'
  }
});
legend.add(ui.Label('SPI-3 Legend'));

var makeRow = function(color, name) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: color,
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });
  var description = ui.Label(name, {
    margin: '0 0 4px 6px'
  });
  return ui.Panel([colorBox, description], ui.Panel.Layout.Flow('horizontal'));
};

var palette = spiVis.palette;
var names = ['แล้งรุนแรง (<= -1.5)', 'แล้ง (-1.5 ถึง -1.0)', 'แล้งเล็กน้อย (-1.0 ถึง -0.5)',
  'ใกล้เคียงปกติ (-0.5 ถึง 0.5)', 'ชื้น (0.5 ถึง 1.0)', 'ชื้นมาก (> 1.0)'
];

palette.forEach(function(color, i) {
  legend.add(makeRow(color, names[i]));
});

// (ทางเลือก) แสดงชั้นข้อมูลน้ำฝนเพื่อเปรียบเทียบ
Map.addLayer(current3mo.clip(thailand), {
  min: 0,
  max: 400,
  palette: ['#FFFFFF', '#ADD8E6', '#0000CD', '#00008B']
}, 'ปริมาณฝนปัจจุบัน', false);
Map.addLayer(historical3mo.mean().clip(thailand), {
  min: 0,
  max: 500,
  palette: ['#FFFFFF', '#ADD8E6', '#0000CD', '#00008B']
}, 'ปริมาณฝนเฉลี่ยในอดีต', false);

Map.add(legend);


```
