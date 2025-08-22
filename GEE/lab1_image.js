// Load Landsat 9 
var collection_landsat = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
    .filterDate('2025-01-01', '2025-01-31')
    .filterBounds(geometry)

var img = ee.Image('LANDSAT/LC09/C02/T1_L2/LC09_130048_20250114')

// Applies scaling factors.
function applyScaleFactors(image) {
    var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
    var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
    return image.addBands(opticalBands, null, true)
        .addBands(thermalBands, null, true);
}

var dataset = applyScaleFactors(img);
var clip_img = dataset.clip(geometry)


var trueColor432Vis = {
    min: 0.0,
    max: 0.3,
    bands: ['SR_B4', 'SR_B3', 'SR_B2'],
};

var falseColorVis = {
    min: 0.0,
    max: 0.3,
    bands: ['SR_B5', 'SR_B4', 'SR_B3'],

};

var falseColorVis2 = {
    min: 0.0,
    max: 0.3,
    bands: ['SR_B4', 'SR_B5', 'SR_B3'],
};


var ShortwaveColorVis = {
    min: 0.0,
    max: 0.3,
    bands: ['SR_B6', 'SR_B5', 'SR_B3'],
};


Map.addLayer(clip_img, trueColor432Vis, 'true-color')
Map.addLayer(clip_img, falseColorVis, 'false-color')
Map.addLayer(clip_img, falseColorVis2, 'false-color2')
Map.addLayer(clip_img, ShortwaveColorVis, 'Shortwave-color')


// เลือก band ที่ต้องการ
var band2 = img.select('SR_B2'); // Blue
var band3 = img.select('SR_B3'); // Green
var band4 = img.select('SR_B4'); // Red

// แสดงผลทีละ band
Map.addLayer(band2, { min: 0, max: 10000 }, 'Blue (B2)');
Map.addLayer(band3, { min: 0, max: 10000 }, 'Green (B3)');
Map.addLayer(band4, { min: 0, max: 10000 }, 'Red (B4)');

// NDVI = (NIR - RED) / (NIR + RED)
var ndvi = img.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
// หรือใช้ expression
var ndvi2 = img.expression(
    '(NIR - RED) / (NIR + RED)',
    {
        'NIR': img.select('SR_B5'),
        'RED': img.select('SR_B4')
    }
);

Map.addLayer(ndvi, { min: -1, max: 1, palette: ['blue', 'white', 'green'] }, 'NDVI');
Map.addLayer(ndvi2, { min: -1, max: 1, palette: ['blue', 'white', 'green'] }, 'NDVI2');

// ดู property ทั้งหมด
print(img.propertyNames());

// ดึง property
print(img.get('system:time_start'));

// เพิ่ม property
var img_new = img.set('myTag', 'landsatScene');

// scale pixel values
var scaled = img.multiply(0.0000275).add(-0.2);

// mask ค่าที่ไม่ต้องการ
var masked = img.updateMask(ndvi.gt(0.2));



// Mask NDVI < 0.1
var mask = ndvi.lt(0.1);
var masked = ndvi.updateMask(mask);

// แสดงผล
Map.centerObject(img, 9);
Map.addLayer(ndvi, { min: -1, max: 1, palette: ['brown', 'yellow', 'green'] }, 'NDVI Original');
Map.addLayer(masked, { min: -1, max: 1, palette: ['brown', 'yellow', 'green'] }, 'NDVI < 0.1 Masked');



var img1 = ee.Image('LANDSAT/LC09/C02/T1_L2/LC09_130048_20250114');
var img2 = ee.Image('LANDSAT/LC09/C02/T1_L2/LC09_130047_20250130');

// mosaic รวมภาพเข้าด้วยกัน (ถ้ามี overlap จะใช้ค่าของภาพแรกที่ซ้อนทับอยู่)
var mosaic = ee.ImageCollection([img1, img2]).mosaic();

// ใช้ mosaic สร้าง NDVI
var ndvi = mosaic.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');

// แสดงผล
Map.centerObject(mosaic, 8);
Map.addLayer(mosaic, { bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0, max: 3000 }, 'Mosaic RGB');
Map.addLayer(ndvi, { min: -1, max: 1, palette: ['brown', 'yellow', 'green'] }, 'NDVI from Mosaic');

// ขั้นตอนใช้งานภาพที่เราอัปโหลดเข้าไป (Asset)

// อัปโหลดไฟล์เข้า GEE Asset

// ไปที่ Assets → NEW → เลือก Image upload

// อัปโหลดไฟล์ GeoTIFF (.tif) หรือ .zip ของ shapefile

// เมื่ออัปโหลดเสร็จ GEE จะให้ path ประมาณนี้:

// users/your_username/your_image

// โหลดภาพจาก Asset
var myImg = ee.Image('users/your_username/your_image');

// แสดงผลภาพที่อัปโหลด
Map.centerObject(myImg);
Map.addLayer(myImg, { bands: ['b1'], min: 0, max: 5000 }, 'My Uploaded Image');