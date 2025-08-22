
//mask เมฆออกตามคำแนะนำของ GEE 
function maskS2clouds(image) {
    var qa = image.select('QA60');

    // Bits 10 and 11 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;

    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

    return image.updateMask(mask).divide(10000);
}


// สร้าง ImageCollection และการใช้ filter
var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate('2020-01-01', '2020-01-30')
    .filterBounds(geometry)
    // Pre-filter to get less cloudy granules.
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .map(maskS2clouds);


//การทำ band composite
var visualization = {
    min: 0.0,
    max: 0.3,
    bands: ['B4', 'B3', 'B2'],
};

Map.centerObject(geometry, 10)
Map.addLayer(dataset.mean(), visualization, 'RGB_mean');
Map.addLayer(dataset.median(), visualization, 'RGB_median');
Map.addLayer(dataset.max(), visualization, 'RGB_max');



//first() / limit() / sort() — เลือกภาพเดี่ยวหรือกลุ่มเล็ก
var firstImg = dataset.sort('system:time_start').first();
Map.addLayer(firstImg.select(['B4', 'B3', 'B2']), { min: 0.02, max: 0.3 }, '8) First image in period');

var latestImg = dataset.sort('system:time_start', false).first();
Map.addLayer(latestImg.select(['B4', 'B3', 'B2']), { min: 0.02, max: 0.3 }, '8) Latest image in period');

var top5 = dataset.sort('CLOUDY_PIXEL_PERCENTAGE').limit(5);
print('8) Top 5 (least cloudy) list:', top5);


// toList() + วนแสดงตัวอย่างภาพ (safe: limit ไว้)
var sampleList = dataset.toList(6);
var n = sampleList.size();
print('9) show up to 6 sample images, count=', n);

//addLayer ทีละหลายๆ รูป
for (var i = 0; i < 6; i++) {
    var img = ee.Image(sampleList.get(i));
    img.get('system:index').evaluate(function (id) { // เอา ee.String → JS string
        Map.addLayer(img.select(['B4', 'B3', 'B2']),
            { min: 0.02, max: 0.3 },
            'Image ' + id);
    });
}