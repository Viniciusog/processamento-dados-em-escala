// Define the bounding box for the city of São Paulo, Brazil.
// These coordinates are approximate for the urban area of São Paulo city.
// [west, south, east, north]
var saoPaulo_city_bbox = ee.Geometry.Rectangle([-46.85, -24.00, -46.35, -23.35]);

// Center the map on the city of São Paulo with a suitable zoom level.
// A zoom level of 10-12 is usually good for city views.
Map.centerObject(saoPaulo_city_bbox, 10);
print('Map centered on São Paulo City, Brazil.');

var startDate = '2025-06-01';
var endDate = '2025-06-10';

var maxCloudCover = 5;

// Filter the Sentinel-2 image collection for the defined city bounding box.
var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate(startDate, endDate)
  .filterBounds(saoPaulo_city_bbox) // Filter by the city's bounding box
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', maxCloudCover);
  
var collectionSize = sentinel2.size().getInfo();
print('Number of images in filtered collection:', collectionSize);

var selectedBands = ['B4', 'B3', 'B2'];
var homogeneousCollection = sentinel2.select(selectedBands);

var compositeImage = homogeneousCollection.median();

// Check if the composite image has any bands before proceeding.
var hasBands = compositeImage.bandNames().size().getInfo() > 0;

if (!hasBands) {
  print('Error: No bands found in the composite image. This might be due to no images matching the criteria (date, cloud cover, or region).');
} else {
  var visualizationParams = {
    min: 0,
    max: 2500,
    gamma: 1.1
  };

  Map.addLayer(compositeImage, visualizationParams, 'São Paulo City - Sentinel-2 RGB');
  print('Image displayed on the map.');

  // Update export details to reflect São Paulo City
  var exportDescription = 'SaoPaulo_City_Satellite_Image_RGB';
  var exportFileNamePrefix = 'SaoPaulo_';
  var exportFolder = 'SaoPaulo'; // New folder for city exports
  var exportScale = 20; // 10 meters per pixel for Sentinel-2
  var exportMaxPixels = 1e13; // Max pixels to allow large exports

  Export.image.toDrive({
    image: compositeImage,
    description: exportDescription,
    folder: exportFolder,
    fileNamePrefix: exportFileNamePrefix,
    region: saoPaulo_city_bbox, // Use the city's bounding box for export
    scale: exportScale,
    maxPixels: exportMaxPixels
  });

  print('Export task initiated for São Paulo City image to Google Drive.');
  print('Check the "Tasks" tab in Earth Engine Code Editor to monitor export progress.');
}
