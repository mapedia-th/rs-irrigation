var point = ee.Geometry.Point([100.504220,13.919694]);
var line = ee.Geometry.LineString([[100.504220,13.919694],[100.504220,12.919694]])
var polygon  = ee.Geometry.Polygon([[100.504220,13.919694],[100.504220,12.919694],[100.503220,12.919694]])

var aoi = ee.FeatureCollection('projects/ee-satapron/assets/contour_shp');
Map.addLayer(point)
Map.addLayer(line)
Map.addLayer(polygon)
Map.addLayer(aoi,{color:"red"})
Map.centerObject(aoi,14)