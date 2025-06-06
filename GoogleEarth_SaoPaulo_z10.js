var saoPaulo_bbox = ee.Geometry.Rectangle([-53.0, -26.0, -44.0, -19.5]);

Map.centerObject(saoPaulo_bbox, 7);
print('Map centered on São Paulo State, Brazil.');

var startDate = '2023-01-01';
var endDate = '2023-12-31';

var maxCloudCover = 5;

var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterDate(startDate, endDate)
  .filterBounds(saoPaulo_bbox)
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', maxCloudCover);

var selectedBands = ['B4', 'B3', 'B2'];
var homogeneousCollection = sentinel2.select(selectedBands);

var compositeImage = homogeneousCollection.median();

var hasBands = compositeImage.bandNames().size().getInfo() > 0;

if (!hasBands) {
  print('Erro n achou bands');
} else {
  var visualizationParams = {
    min: 0,      
    max: 2500,  
    gamma: 1.1  
  };

  Map.addLayer(compositeImage, visualizationParams, 'São Paulo State - Sentinel-2 RGB');
  print('Image displayed on the map.');

  var exportDescription = 'SaoPaulo_State_Satellite_Image_RGB';
  var exportFileNamePrefix = 'SaoPaulo_State_RGB';
  var exportFolder = 'GEE_Exports_SaoPaulo_State';
  var exportScale = 10;
  var exportMaxPixels = 1e13; 
                            
  Export.image.toDrive({
    image: compositeImage,
    description: exportDescription,
    folder: exportFolder,
    fileNamePrefix: exportFileNamePrefix,
    region: saoPaulo_bbox,
    scale: exportScale,
    maxPixels: exportMaxPixels
  });

}
