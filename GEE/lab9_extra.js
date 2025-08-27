var river = ee.FeatureCollection([
    ee.Feature(ee.Geometry.LineString([
      [100.2, 16.6],
      [100.6, 17.1]
    ]))
  ]);
  
  Map.addLayer(river)
  Map.centerObject(river,12)
  // สร้าง raster จาก vector
  var riverRaster = ee.Image().toByte().paint(river, 1).clip(aoi);
  
  // ระยะจาก river
  var distToWater = riverRaster.distance(ee.Kernel.euclidean(1000, 'meters'));