# ภารกิจที่ 1: "ตามหาสีเขียวที่หายไป"
- โจทย์: "มีรายงานว่าในช่วงฤดูแล้งที่รุนแรงที่สุดของปี 2023 (1-30 เมษายน) พื้นที่ป่าแห่งหนึ่งในเขตอุทยานแห่งชาติทุ่งแสลงหลวง (จ.พิษณุโลก) มีสภาพแห้งแล้งกว่าปกติ ให้ทีมของคุณใช้ GEE สร้างภาพ NDVI ของพื้นที่ดังกล่าวในช่วงเวลานั้น และชี้จุดที่มีค่า NDVI ต่ำที่สุด (สีน้ำตาล/เหลือง) ให้เห็นบนแผนที่"

- แนวทาง: ทีมจะต้องค้นหาชุดข้อมูล FeatureCollection ของอุทยานแห่งชาติในประเทศไทย เพื่อนำมาใช้เป็นขอบเขต (AOI) จากนั้นจึงเรียกใช้ข้อมูล Sentinel-2, กรองข้อมูลตามช่วงเวลาและขอบเขต, สร้างภาพปลอดเมฆด้วย .median(), คำนวณ NDVI, และสุดท้ายคือการแสดงผลแผนที่ NDVI โดยใช้ Palette สีที่เหมาะสมเพื่อแยกพื้นที่พืชพรรณสมบูรณ์ (สีเขียว) ออกจากพื้นที่แห้งแล้ง (สีน้ำตาล/เหลือง)

- ตัวอย่างโค้ดเฉลย:

```js
// 1. ค้นหาและกำหนดขอบเขตอุทยานแห่งชาติทุ่งแสลงหลวง
var national_parks = ee.FeatureCollection("WCMC/WDPA/current/polygons");
var aoi = national_parks.filter(ee.Filter.eq('NAME', 'Thung Salaeng Luang'));
Map.centerObject(aoi, 9);

// 2. กำหนดช่วงเวลาที่เกิดภัยแล้ง
var dry_season_start = '2023-04-01';
var dry_season_end = '2023-04-30';

// 3. เรียกใช้, กรองข้อมูล Sentinel-2 และสร้างภาพปลอดเมฆ
var s2_image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate(dry_season_start, dry_season_end)
                  .filterBounds(aoi)
                  .median() // สร้างภาพจากค่ามัธยฐานเพื่อลดผลกระทบจากเมฆ
                  .clip(aoi);

// 4. คำนวณ NDVI
var ndvi = s2_image.normalizedDifference(['B8', 'B4']).rename('NDVI');

// 5. กำหนด Palette สีสำหรับแสดงผล NDVI
var ndvi_palette = ['#ce7e45', '#df923d', '#f1b555', '#fcd163', '#99b718',
                    '#74a901', '#66a000', '#529400', '#3e8601', '#207401',
                    '#056201', '#004c00', '#023b01', '#012e01', '#011d01',
                    '#011301'];

// 6. แสดงผลลัพธ์บนแผนที่
Map.addLayer(ndvi, {min: 0, max: 1, palette: ndvi_palette}, 'NDVI ทุ่งแสลงหลวง (เม.ย. 2023)');

// 7. ค้นหาค่า NDVI ที่ต่ำที่สุดในพื้นที่ที่กำหนด
var minNdviStat = ndvi.reduceRegion({
  reducer: ee.Reducer.min(),
  geometry: aoi,
  scale: 10,
  maxPixels: 1e9
});

// 8. ดึงค่าตัวเลข NDVI ต่ำสุดออกมาจากผลลัพธ์
var minNdviValue = minNdviStat.get('NDVI');
print('ค่า NDVI ต่ำที่สุดที่พบ:', minNdviV

```

# 2
```js
// 1. กำหนดตำแหน่งและขอบเขตของเขื่อนทั้ง 3 แห่ง
var bhumibol_dam = ee.Geometry.Point([98.90097271466408, 17.305860597412906]).buffer(22000); // เขื่อนภูมิพล
var sirikit_dam = ee.Geometry.Point([100.49741578298826, 17.858492230422126]).buffer(25000); // เขื่อนสิริกิติ์
var kwaenoi_dam = ee.Geometry.Point([100.44014579079604, 17.14305938457368]).buffer(10000); // เขื่อนแควน้อยฯ

// 2. กำหนดช่วงเวลา
var start_date = '2024-11-01';
var end_date = '2024-11-15';

// *** ส่วนที่เพิ่มเข้ามา: กำหนดค่าสีสำหรับแสดงผล NDWI ***
var ndwi_vis_params = {
  min: -1, 
  max: 1, 
  palette: ['brown', 'white', 'blue'] // ต่ำ (ดิน) = น้ำตาล, กลาง = ขาว, สูง (น้ำ) = น้ำเงิน
};

// 3. สร้าง Function สำหรับคำนวณพื้นที่และแสดงผลแผนที่
function processDamData(geometry, dam_name) {
  var image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterDate(start_date, end_date)
                .filterBounds(geometry)
                .median()
                .clip(geometry);

  var ndwi = image.normalizedDifference(['B3', 'B8']);
  
  // *** ส่วนที่เพิ่มเข้ามา: แสดงผล NDWI บนแผนที่ ***
  Map.addLayer(ndwi, ndwi_vis_params, 'NDWI ' + dam_name);

  // --- ส่วนการคำนวณพื้นที่ยังคงเดิม ---
  var water = ndwi.gt(0); // พื้นที่ที่เป็นน้ำ
  var area_image = water.multiply(ee.Image.pixelArea());

  var stats = area_image.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 10,
    maxPixels: 1e9
  });

  var water_area_sq_km = ee.Number(stats.values().get(0)).divide(1e6);
  print('พื้นที่ผิวน้ำ ' + dam_name, water_area_sq_km);
}

// 4. เรียกใช้ Function เพื่อคำนวณและแสดงผล (เปลี่ยนชื่อฟังก์ชันเล็กน้อยเพื่อความชัดเจน)
processDamData(bhumibol_dam, 'เขื่อนภูมิพล');
processDamData(sirikit_dam, 'เขื่อนสิริกิติ์');
processDamData(kwaenoi_dam, 'เขื่อนแควน้อยฯ');

```
