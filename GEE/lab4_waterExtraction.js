// โหลดข้อมูล Sentinel-2
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(geometry)        // พื้นที่สนใจ
    .filterDate('2023-01-01', '2023-01-31') // ช่วงเวลา
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .median();  // รวมเป็นภาพเดียว

// คำนวณ NDWI
var ndwi = s2.normalizedDifference(['B3', 'B8']).rename('NDWI');

// สร้าง Mask น้ำ (NDWI > 0)
var waterMask = ndwi.gt(0.26);

// 5) ภาพน้ำแบบ mask แล้ว
var waterMasked = waterMask.updateMask(waterMask);

// แสดงผล
Map.centerObject(geometry, 10);
Map.addLayer(ndwi, { min: -1, max: 1, palette: ['brown', 'yellow', 'blue'] }, 'NDWI');
Map.addLayer(waterMasked, { palette: 'blue' }, 'Water');

// คิดพื้นที่พิกเซล (หน่วย: m²) แล้วเก็บเฉพาะที่เป็นน้ำ
var waterAreaImage = ee.Image.pixelArea().updateMask(waterMask).rename('area_m2');
print(waterAreaImage)

// รวมพื้นที่ในขอบเขต geometry
var totalAreaStats = waterAreaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 10,         // Sentinel-2
    maxPixels: 1e13,
    bestEffort: true
});

var totalArea_m2 = ee.Number(totalAreaStats.get('area_m2'));
var totalArea_km2 = totalArea_m2.divide(1e6);

print('Total water area (m²):', totalArea_m2);
print('Total water area (km²):', totalArea_km2);


// ==============================================
// C) วิธีที่ 2: หา “แหล่งน้ำแต่ละแอ่ง” แล้วคำนวณพื้นที่รายแหล่ง
// ==============================================

// 1) ทำให้เป็นส่วนต่อเนื่อง (label) เพื่อแยกแต่ละบ่อ/แอ่ง
// หมายเหตุ: connectivity=8 ใจดีขึ้นสำหรับเส้นบาง ๆ

var kernel8 = ee.Kernel.plus(1); // 1-pixel radius, ใช้ plus() = 8-connected

var labeled = waterMask.selfMask()
    .connectedComponents({

        connectedness: kernel8,
        maxSize: 1024  // เพิ่ม/ลดได้ตามขนาดแหล่งน้ำที่คาด
    });

// เลือกเฉพาะ band ที่ต้องการ (ชื่อ band = "labels")
var labeledOnly = labeled.select('labels');

// 2) แปลง raster → vector (polygon) เฉพาะที่เป็นน้ำ
var waterVectors = labeledOnly.reduceToVectors({
    geometry: geometry,
    scale: 10,
    geometryType: 'polygon',
    labelProperty: 'label',
    eightConnected: true,
    maxPixels: 1e13
});

// 3) คำนวณพื้นที่ให้แต่ละ polygon (m² และ km²)
var waterPolysWithArea = waterVectors.map(function (feat) {
    var area_m2 = feat.geometry().area({ maxError: 1 });
    var area_km2 = ee.Number(area_m2).divide(1e6);
    return feat
        .set('area_m2', area_m2)
        .set('area_km2', area_km2);
});

// 4) กรองทิ้งชิ้นเล็ก ๆ (เช่น < 1,000 m²) เพื่อกัน noise
var minArea_m2 = 1000; // ปรับได้
var waterPolysFiltered = waterPolysWithArea.filter(ee.Filter.gte('area_m2', minArea_m2));

// 5) แสดงผล
Map.addLayer(waterPolysFiltered.style({
    color: '0000FF',
    fillColor: '0000FF55',
    width: 1.2
}), {}, 'Water polygons (filtered)');

print('Water polygons (with area):', waterPolysFiltered.limit(20)); // ดูตัวอย่าง 20 รายการ

// D2) Export polygon ของแหล่งน้ำ + ตารางพื้นที่ (SHP/GeoJSON)
// เลือก SHP:
Export.table.toDrive({
    collection: waterPolysFiltered,
    description: 'water_polygons_with_area_SHP',
    fileFormat: 'SHP'
});