
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(geometry)
    .filterDate('2023-01-01', '2023-12-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)); // กรองเมฆ

print(s2)

// -------------------------------
// 3. สร้างฟังก์ชันคำนวณ NDVI
// -------------------------------
function addNDVI(image) {
    var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
    return image.addBands(ndvi);
}

function addNDWI(image) {
    var ndvi = image.normalizedDifference(['B8', 'B3']).rename('NDWI');
    return image.addBands(ndvi);
}

var s2_ndvi = s2.map(addNDVI);
var s2_ndwi = s2.map(addNDWI);

// 3. คำนวณ NDVI และ NDWI
//-----------------------------
var withIndices = s2.map(function (img) {
    var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
    var ndwi = img.normalizedDifference(['B8', 'B3']).rename('NDWI');
    return img.addBands([ndvi, ndwi]);
});

// 4. แสดง Chart
//-----------------------------

// ดึงค่าเฉลี่ย NDVI เป็นอนุกรมเวลา
var ndviTS = ui.Chart.image.series({
    imageCollection: withIndices.select('NDVI'),
    region: geometry,
    reducer: ee.Reducer.mean(),
    scale: 10
})
    .setOptions({
        title: 'NDVI Time Series (2023)',
        vAxis: { title: 'NDVI' },
        hAxis: { title: 'Date' },
        lineWidth: 2,
        pointSize: 4
    })

var ndwiTS = ui.Chart.image.series({
    imageCollection: withIndices.select('NDWI'),
    region: geometry,
    reducer: ee.Reducer.mean(),
    scale: 10
})
    .setOptions({
        title: 'NDWI Time Series (2023)',
        vAxis: { title: 'NDWI' },
        hAxis: { title: 'Date' },
        lineWidth: 2,
        pointSize: 4
    })

// print(ndviTS);
// print(ndwiTS);



var chart = ui.Chart.image.series({
    imageCollection: withIndices.select(['NDVI', 'NDWI']),
    region: geometry,
    reducer: ee.Reducer.max(),
    scale: 10
})
    .setOptions({
        title: 'Time Series of NDVI & NDWI (2022)',
        vAxis: { title: 'Index Value' },
        hAxis: { title: 'Date' },
        lineWidth: 2,
        series: {
            0: { color: 'green', label: 'NDVI' },
            1: { color: 'blue', label: 'NDWI' }
        }
    });
chart.setChartType('ScatterChart');

print(chart);

// Export.table.toDrive({
//   collection: withIndices.select(['NDVI','NDWI'])
//     .map(function(img){
//       return ee.Feature(null, {
//         'date': img.date().format('YYYY-MM-dd'),
//         'NDVI': img.select('NDVI').reduceRegion({
//           reducer: ee.Reducer.mean(),
//           geometry: geometry,
//           scale: 30
//         }).get('NDVI'),
//         'NDWI': img.select('NDWI').reduceRegion({
//           reducer: ee.Reducer.mean(),
//           geometry: geometry,
//           scale: 30
//         }).get('NDWI')
//       });
//     }),
//   description: 'NDVI_NDWI_timeseries',
//   fileFormat: 'CSV'
// });

// ดึงค่าเฉลี่ย NDVI
var ndviTable = s2_ndvi.map(function (img) {
    var mean = img.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: geometry,
        scale: 50
    });
    return ee.Feature(null, {
        'month': img.get('month'),
        'NDVI': mean.get('NDVI')
    });
});

print(ndviTable)

// Export ไป CSV
Export.table.toDrive({
    collection: ndviTable,
    description: 'NDVI_Monthly',
    fileFormat: 'CSV',
    selectors: ['system:index', 'NDVI']   // กำหนดเฉพาะคอลัมน์ที่อยากให้มี

});