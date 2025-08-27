# ภารกิจที่ 1: "ตามหาสีเขียวที่หายไป"
- โจทย์:
  - จากข้อมูลรายงานในช่วงฤดูแล้งที่รุนแรงที่สุดของปี ตั้งแต่ 1-30 เมษายน 2023 พื้นที่ป่าแห่งหนึ่งใน จ.น่าน ประเทศไทย มีสภาพแห้งแล้งกว่าปกติ
  - ให้ทีมใช้ GEE สร้างภาพ NDVI ของพื้นที่ดังกล่าวในช่วงเวลานั้น และให้ทำการดึงค่า NDVI ต่ำที่สุด (สีน้ำตาล/เหลือง) ให้ print ออกมา

- แนวทาง: ทีมจะต้องค้นหาชุดข้อมูล FeatureCollection ของจังหวัดน่านในประเทศไทย เพื่อนำมาใช้เป็นขอบเขต (AOI) จากนั้นจึงเรียกใช้ข้อมูล Sentinel-2, กรองข้อมูลตามช่วงเวลาและขอบเขต, สร้างภาพปลอดเมฆด้วย .median(), คำนวณ NDVI, และสุดท้ายคือการแสดงผลแผนที่ NDVI โดยใช้ Palette สีที่เหมาะสมเพื่อแยกพื้นที่พืชพรรณสมบูรณ์ (สีเขียว) ออกจากพื้นที่แห้งแล้ง (สีน้ำตาล/เหลือง)

- ตัวอย่างโค้ดเฉลย:

```js
// TODO 1: กำหนดขอบเขตพื้นที่ศึกษา (AOI)
// ค้นหาขอบเขตของอุทยานแห่งชาติจากชุดข้อมูล WCMC/WDPA
// จากนั้นใช้ .filter() เพื่อเลือกเฉพาะ 'Thung Salaeng Luang'
// var national_parks = ee.FeatureCollection("WCMC/WDPA/current/polygons");
// var aoi = national_parks.filter(ee.Filter.eq('NAME', 'Thung Salaeng Luang'));
// Map.centerObject(aoi, 9);

var provinces = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1");
var aoi = provinces.filter(ee.Filter.eq('ADM1_NAME', 'Nan'));
Map.centerObject(aoi, 9);

// TODO 2: กำหนดช่วงเวลาที่ต้องการวิเคราะห์
// ตั้งค่าตัวแปรสำหรับวันที่เริ่มต้นและสิ้นสุดของช่วงฤดูแล้ง
var dry_season_start = '2023-04-01';
var dry_season_end = '2023-04-30';

// TODO 3: เรียกใช้, กรองข้อมูล, และสร้างภาพปลอดเมฆ
// กรองข้อมูล Sentinel-2 ตามช่วงเวลาและขอบเขตที่กำหนด
// ใช้ .median() เพื่อสร้างภาพตัวแทนที่ปลอดเมฆ และ .clip() เพื่อตัดภาพตามขอบเขต AOI
var s2_image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate(dry_season_start, dry_season_end)
                  .filterBounds(aoi)
                  .median()
                  .clip(aoi);

// TODO 4: คำนวณค่าดัชนีพืชพรรณ (NDVI)
// ใช้ฟังก์ชัน .normalizedDifference() กับแบนด์ NIR (B8) และ Red (B4)
// และใช้ .rename() เพื่อตั้งชื่อแบนด์ใหม่ว่า 'NDVI'
var ndvi = s2_image.normalizedDifference(['B8', 'B4']).rename('NDVI');

// TODO 5: กำหนดสไตล์การแสดงผลสำหรับภาพ NDVI
// สร้างตัวแปร palette เพื่อเก็บชุดสีสำหรับไล่ระดับค่า NDVI
// จากค่าต่ำ (สีน้ำตาล) ไปยังค่าสูง (สีเขียว)
var ndvi_palette = ['#ce7e45', '#df923d', '#f1b555', '#fcd163', '#99b718',
                    '#74a901', '#66a000', '#529400', '#3e8601', '#207401',
                    '#056201', '#004c00', '#023b01', '#012e01', '#011d01',
                    '#011301'];

// TODO 6: แสดงผลลัพธ์ภาพ NDVI บนแผนที่
// ใช้ Map.addLayer() เพื่อนำภาพ NDVI มาแสดงผล พร้อมกำหนดสไตล์และชื่อเลเยอร์
Map.addLayer(ndvi, {min: 0, max: 1, palette: ndvi_palette}, 'NDVI Nan (เม.ย. 2023)');

// TODO 7: ค้นหาค่า NDVI ที่ต่ำที่สุดในพื้นที่ศึกษา
// ใช้ .reduceRegion() ร่วมกับ ee.Reducer.min() เพื่อหาค่าพิกเซลที่ต่ำที่สุด
// ภายในขอบเขต aoi ที่กำหนด
var minNdviStat = ndvi.reduceRegion({
  reducer: ee.Reducer.min(),
  geometry: aoi,
  scale: 10,
  maxPixels: 1e9
});

// TODO 8: ดึงค่าตัวเลข NDVI ต่ำสุดออกมาและแสดงผลใน Console
// ใช้ .get() เพื่อดึงค่าจากผลลัพธ์ของ reduceRegion
// และใช้ print() เพื่อแสดงค่าในหน้าต่าง Console
var minNdviValue = minNdviStat.get('NDVI');
print('ค่า NDVI ต่ำที่สุดที่พบ:', minNdviValue);

// TODO 9: สร้าง Mask และแปลงเป็นข้อมูลจุด (Point)
// 1. สร้างภาพ Mask ที่มีค่าเป็น 1 เฉพาะบริเวณที่ NDVI ต่ำที่สุด
// 2. ใช้ reduceToVectors() เพื่อแปลง Raster Mask ให้เป็น Vector (ในที่นี้คือจุด)
var lowestNdviPixels = ndvi.eq(ee.Image.constant(minNdviValue));
var minNdviPoint = lowestNdviPixels.selfMask().reduceToVectors({
  geometry: aoi,
  scale: 10,
  geometryType: 'centroid',
  maxPixels: 1e9
});

// TODO 10: ดึงค่าพิกัดและแสดงผล
// 1. ดึงข้อมูล Geometry (จุด) ออกมาจาก Feature แรกที่หาเจอ
// 2. ใช้ .coordinates() เพื่อดึงค่าพิกัด [lon, lat]
// 3. แสดงผลพิกัดใน Console และเพิ่มจุด Marker สีแดงบนแผนที่
var point = minNdviPoint.first().geometry();
var coordinates = point.coordinates();
print('พิกัดของจุดที่ NDVI ต่ำที่สุด (Lon, Lat):', coordinates);
Map.addLayer(point, {color: 'red'}, 'จุด NDVI ต่ำสุด');


```

# ภารกิจที่ 2: เขื่อนใดกักเก็บน้ำได้ดีที่สุด?
- โจทย์: "หลังจากสิ้นสุดฤดูฝนหนัก ในช่วงวันที่ 1-15 พฤศจิกายน 2024 เขื่อนหลัก 3 แห่ง ได้แก่ เขื่อนภูมิพล (จ.ตาก), เขื่อนสิริกิติ์ (จ.อุตรดิตถ์), และเขื่อนแควน้อยบำรุงแดน (จ.พิษณุโลก) เขื่อนใดมีพื้นที่ผิวน้ำ (Water Surface Area) มากที่สุด? ให้ทีมของคุณคำนวณหาพื้นที่ผิวน้ำของแต่ละเขื่อนโดยใช้ NDWI"

- แนวทาง: ทีมจะต้องหาขอบเขตของอ่างเก็บน้ำทั้ง 3 แห่ง
  - ให้ใช้ ee.Geometry.Point แล้ว buffer หรือวาด Polygon คร่าวๆ ก็ได้
  - จากนั้นทำการวิเคราะห์ทีละเขื่อนโดยใช้ Sentinel-2 ในช่วงเวลาที่กำหนด คำนวณ NDWI,
  - กำหนดค่าเกณฑ์เพื่อจำแนกพิกเซลที่เป็นน้ำ (ndwi.gt(0)), คูณภาพผลลัพธ์ด้วย ee.Image.pixelArea() เพื่อเปลี่ยนค่าพิกเซลให้เป็นพื้นที่ แล้วจึงใช้ reduceRegion() เพื่อหาผลรวมของพื้นที่ทั้งหมด สุดท้ายนำตัวเลขของทั้ง 3 เขื่อนมาเปรียบเทียบกัน

- ตัวอย่างโค้ดเฉลย:
```js
// TODO 1: กำหนดค่าพารามิเตอร์เริ่มต้น
// กำหนดจุดศูนย์กลางและขอบเขตพื้นที่ศึกษา (AOI) ของเขื่อนทั้ง 3 แห่ง
// โดยใช้ ee.Geometry.Point() เพื่อสร้างจุด และ .buffer() เพื่อสร้างรัศมีวงกลมรอบจุดนั้น
var bhumibol_dam = ee.Geometry.Point([98.90097271466408, 17.305860597412906]).buffer(22000); // เขื่อนภูมิพล
var sirikit_dam = ee.Geometry.Point([100.49741578298826, 17.858492230422126]).buffer(25000); // เขื่อนสิริกิติ์
var kwaenoi_dam = ee.Geometry.Point([100.44014579079604, 17.14305938457368]).buffer(10000); // เขื่อนแควน้อยฯ

// กำหนดช่วงเวลาที่ต้องการวิเคราะห์
var start_date = '2024-11-01';
var end_date = '2024-11-15';

// กำหนดสไตล์การแสดงผลสำหรับภาพ NDWI
// palette คือชุดสี โดยจะไล่สีจากค่าน้อยไปมาก (ดิน -> น้ำ)
var ndwi_vis_params = {
  min: -1, 
  max: 1, 
  palette: ['brown', 'white', 'blue']
};

// TODO 2: สร้างฟังก์ชันหลักสำหรับประมวลผลข้อมูลของเขื่อนแต่ละแห่ง
// ฟังก์ชันนี้จะรับ 'geometry' (ขอบเขต) และ 'dam_name' (ชื่อเขื่อน) เข้ามา
function processDamData(geometry, dam_name) {
  
  // TODO 2.1: เรียกใช้และกรองข้อมูล Sentinel-2
  // กรองข้อมูลภาพตามช่วงเวลาและขอบเขตที่กำหนด
  // จากนั้นใช้ .median() เพื่อสร้างภาพตัวแทนที่ปลอดเมฆ และ .clip() เพื่อตัดภาพตามขอบเขต
  var image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterDate(start_date, end_date)
                .filterBounds(geometry)
                .median()
                .clip(geometry);

  // TODO 2.2: คำนวณดัชนีน้ำ (NDWI)
  // ใช้ฟังก์ชัน .normalizedDifference() กับแบนด์ Green (B3) และ NIR (B8)
  var ndwi = image.normalizedDifference(['B3', 'B8']);
  
  // TODO 2.3: แสดงผลลัพธ์ NDWI บนแผนที่
  // ใช้ Map.addLayer() เพื่อนำภาพ NDWI ที่ได้มาแสดงบนแผนที่ พร้อมกำหนดสไตล์และชื่อเลเยอร์
  Map.addLayer(ndwi, ndwi_vis_params, 'NDWI ' + dam_name);

  // TODO 2.4: คำนวณพื้นที่ที่เป็นน้ำ
  // 1. ใช้ .gt(0) เพื่อสร้างภาพ Mask ที่มีค่าเป็น 1 เฉพาะบริเวณที่เป็นน้ำ (NDWI > 0)
  // 2. ใช้ .multiply(ee.Image.pixelArea()) เพื่อเปลี่ยนค่าพิกเซลจาก 1 ให้เป็นขนาดพื้นที่ (ตร.ม.)
  var water = ndwi.gt(0);
  var area_image = water.multiply(ee.Image.pixelArea());

  // TODO 2.5: สรุปผลรวมพื้นที่และพิมพ์ผลลัพธ์
  // ใช้ .reduceRegion() เพื่อรวมค่าพื้นที่ทั้งหมดในขอบเขตที่กำหนด
  // จากนั้นดึงค่าตัวเลขออกมาและแปลงหน่วยเป็น ตารางกิโลเมตร
  var stats = area_image.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 10,
    maxPixels: 1e9
  });

  var water_area_sq_km = ee.Number(stats.values().get(0)).divide(1e6);
  print('พื้นที่ผิวน้ำ(ตร.กม.) ' + dam_name, water_area_sq
}

// TODO 3: เรียกใช้งานฟังก์ชันสำหรับเขื่อนแต่ละแห่ง
// เรียกใช้ฟังก์ชัน processDamData โดยส่งขอบเขตและชื่อของแต่ละเขื่อนเข้าไป
processDamData(bhumibol_dam, 'เขื่อนภูมิพล');
processDamData(sirikit_dam, 'เขื่อนสิริกิติ์');
processDamData(kwaenoi_dam, 'เขื่อนแควน้อยฯ');


```

# ภารกิจที่ 3: "แกะรอยอุทกภัยฉับพลัน"
- โจทย์: "เกิดฝนตกหนักในจังหวัดสุโขทัย ทำให้เกิดน้ำท่วมฉับพลันบริเวณลุ่มน้ำยม แต่ภาพจากดาวเทียม Sentinel-2 ในช่วงเดือนกันยายน-ตุลาคม 2024 มีเมฆบดบังเป็นส่วนใหญ่ ภารกิจของทีมคือ ให้ใช้ข้อมูลดาวเทียมเรดาร์ Sentinel-1 เพื่อสร้างแผนที่แสดงพื้นที่น้ำท่วมใหม่ (ไม่รวมแหล่งน้ำเดิม) ให้สำเร็จ"

- แนวทาง: ทีมจะต้องใช้ Sentinel-1 GRD และใช้วิธี Change Detection เป็นหลัก โดยนำภาพเรดาร์หลังน้ำท่วมมาลบกับภาพก่อนน้ำท่วมเพื่อหา "ค่าความแตกต่าง" ของสัญญาณสะท้อนกลับ จากนั้นจึงใช้ค่าเกณฑ์ (Threshold) กับค่าความแตกต่างนั้น เพื่อสกัดเฉพาะพื้นที่ที่มีการเปลี่ยนแปลงอย่างมีนัยสำคัญ (มืดลงมาก) ซึ่งเป็นสัญญาณของการเกิดน้ำท่วมที่ชัดเจน นอกจากนี้ เพื่อเพิ่มความแม่นยำสูงสุด ทีมจะต้อง:
  - ลดสัญญาณรบกวน (Speckle Filtering) เพื่อให้ภาพเรียบเนียนขึ้น
  - กรองพื้นที่ที่เป็นแหล่งน้ำถาวรออก เพื่อให้เห็นเฉพาะพื้นที่น้ำท่วมใหม่
  - ปรับปรุงผลลัพธ์สุดท้าย โดยการกรองจุดรบกวนขนาดเล็กและพื้นที่ลาดชันออก

- ทักษะที่ต้องใช้:
  - การกรองข้อมูล Sentinel-1 (.filter, .select)
  - การสร้างภาพตัวแทนด้วย .mosaic()
  - การลดสัญญาณรบกวนด้วย .focal_mean()
  - การตรวจจับการเปลี่ยนแปลงด้วย .subtract()
  - การจำแนกพื้นที่ด้วย .lte() (Less than or equal)
  - การใช้ข้อมูลภายนอกเพื่อสร้าง Mask (JRC Global Surface Water)
  - การปรับปรุงผลลัพธ์ด้วย .where(), .connectedPixelCount(), และข้อมูลความลาดชัน (Slope)

- ตัวอย่างโค้ดเฉลย:
```js
// TODO 1: กำหนดค่าพารามิเตอร์เริ่มต้นสำหรับการวิเคราะห์
// กำหนดพื้นที่ศึกษา (aoi), ช่วงเวลาก่อนน้ำท่วม (before_start, before_end)
// และช่วงเวลาขณะเกิดน้ำท่วม (after_start, after_end)
var provinces = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1");
var aoi = provinces.filter(ee.Filter.eq('ADM1_NAME', 'Sukhothai'));
Map.centerObject(aoi, 9);

var before_start = '2024-01-01';
var before_end = '2024-05-24';

var after_start = '2024-09-15';
var after_end = '2024-10-15';

// TODO 2: เรียกใช้และกรองข้อมูลดาวเทียม Sentinel-1
// กำหนดค่าโพลาไรเซชัน (VH เหมาะกับน้ำท่วม) และทิศทางวงโคจร
// จากนั้นกรองข้อมูลดิบจาก ImageCollection 'COPERNICUS/S1_GRD'
var polarization = "VH";
var pass_direction = "DESCENDING";
var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
    .filter(ee.Filter.eq('instrumentMode', 'IW'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', polarization))
    .filter(ee.Filter.eq('orbitProperties_pass', pass_direction))
    .filter(ee.Filter.eq('resolution_meters', 10))
    .filterBounds(aoi)
    .select(polarization);

// TODO 3: สร้างภาพตัวแทนของช่วงเวลาก่อนและหลังน้ำท่วม
// กรองข้อมูลตามช่วงเวลาที่กำหนดไว้ แล้วใช้ .mosaic() เพื่อรวมภาพทั้งหมดเป็นภาพเดียว
var before_collection = collection.filterDate(before_start, before_end);
var after_collection = collection.filterDate(after_start, after_end);
var before = before_collection.mosaic().clip(aoi);
var after = after_collection.mosaic().clip(aoi);

// TODO 4: ลดสัญญาณรบกวนในภาพเรดาร์ (Speckle Filtering)
// ใช้ .focal_mean() เพื่อทำให้ภาพเรียบเนียนขึ้น ลดจุดรบกวน
// และทำให้ง่ายต่อการจำแนกพื้นที่น้ำ
var smoothing_radius = 25;
var before_filtered = before.focal_mean(smoothing_radius, 'circle', 'meters');
var after_filtered = after.focal_mean(smoothing_radius, 'circle', 'meters');

// TODO 5: คำนวณหา "ค่าความแตกต่าง" และจำแนกพื้นที่น้ำท่วมเบื้องต้น
// นำภาพหลังลบด้วยภาพก่อน แล้วใช้ค่าเกณฑ์ (difference_threshold)
// เพื่อหาพื้นที่ที่มีค่าสัญญาณสะท้อนกลับลดลงอย่างมีนัยสำคัญ (พื้นที่ที่มืดลง)
var difference_threshold = -5.5;
var difference_db = after_filtered.subtract(before_filtered);
var difference_binary = difference_db.lte(difference_threshold);
var flood_raw_mask = difference_db.updateMask(difference_binary);

// TODO 6: ปรับปรุงผลลัพธ์โดยการ "ลบพื้นที่ที่เป็นแหล่งน้ำถาวร" ออก
// ใช้ข้อมูล JRC Global Surface Water เพื่อสร้าง Mask ของพื้นที่ที่เป็นน้ำอยู่แล้ว
// แล้วนำไปลบออกจากพื้นที่น้ำท่วมที่เราตรวจจับได้
var swater = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
var swater_mask = swater.gte(5).updateMask(swater.gte(5));
var flooded_mask = difference_binary.where(swater_mask, 0);
var flooded = flooded_mask.updateMask(flooded_mask);

// TODO 7: ปรับปรุงผลลัพธ์ขั้นสุดท้ายโดย "กรองจุดรบกวนและพื้นที่ลาดชัน"
// กรองกลุ่มพิกเซลน้ำท่วมที่มีขนาดเล็กกว่า 8 พิกเซลออก
// และกรองพื้นที่ที่มีความลาดชันมากกว่า 5 องศาออก (เพื่อลดผลกระทบจากเงาเรดาร์)
var connections = flooded.connectedPixelCount();
var flooded = flooded.updateMask(connections.gte(8));
var dem = ee.Image('WWF/HydroSHEDS/03VFDEM');
var terrain = ee.Algorithms.Terrain(dem);
var slope = terrain.select('slope');
var flooded = flooded.updateMask(slope.lt(5));

// TODO 8: แสดงผลลัพธ์ทั้งหมดบนแผนที่
// แสดงภาพก่อน, หลัง, ค่าความแตกต่าง, และผลลัพธ์พื้นที่น้ำท่วมที่ปรับปรุงแล้ว
Map.centerObject(aoi);
Map.addLayer(before_filtered, { min: -25, max: 0 }, 'Before Flood', 0);
Map.addLayer(after_filtered, { min: -25, max: 0 }, 'After Flood', 1);
Map.addLayer(difference_db, { min: -5, max: 5 }, 'Difference (dB)', 0);
Map.addLayer(flood_raw_mask, { palette: 'orange' }, 'Flooded (raw)', 0);
Map.addLayer(flooded, { palette: 'blue' }, 'Flooded Areas (Final)', 1);


```
