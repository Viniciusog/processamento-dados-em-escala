// (https://code.earthengine.google.com/).

var saoCarlos_bbox = ee.Geometry.Rectangle([-48.05, -22.15, -47.75, -21.85]);


Map.centerObject(saoCarlos_bbox, 11);
print('Map centered on São Carlos, SP.');

var startDate = '2023-01-01';
var endDate = '2023-12-31';   

var maxCloudCover = 5; // 5% de cobertura de núvem

var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterDate(startDate, endDate)
  .filterBounds(saoCarlos_bbox)
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', maxCloudCover);

var selectedBands = ['B4', 'B3', 'B2']; // Red, Green, Blue
var homogeneousCollection = sentinel2.select(selectedBands);

var compositeImage = homogeneousCollection.median();

var hasBands = compositeImage.bandNames().size().getInfo() > 0;

if (!hasBands) {
  print('Error: No suitable images found for São Carlos with the given criteria.');
  print('Consider adjusting dates, cloud cover, or the bounding box.');
} else {

  var visualizationParams = {
    min: 0,      
    max: 2500,   
    gamma: 1.1   
  };

  Map.addLayer(compositeImage, visualizationParams, 'São Carlos - Sentinel-2 RGB');
  print('Image displayed on the map.');


  var exportDescription = 'SaoCarlos_Satellite_Image_RGB';
  var exportFileNamePrefix = 'SaoCarlos_RGB_50';
  var exportFolder = 'GEE_Exports_SaoCarlos'; 
  var exportScale = 50; 
  var exportMaxPixels = 1e13; 

  Export.image.toDrive({
    image: compositeImage,
    description: exportDescription,
    folder: exportFolder,
    fileNamePrefix: exportFileNamePrefix,
    region: saoCarlos_bbox, 
    scale: exportScale,
    maxPixels: exportMaxPixels
  });

  print('Export task initiated. Check the "Tasks" tab on the right side of the GEE Code Editor to monitor its progress.');
  print('Once completed, the image will be available in your Google Drive under the folder: ' + exportFolder);
}