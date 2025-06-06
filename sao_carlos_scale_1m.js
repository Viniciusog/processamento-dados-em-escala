// This script is designed to be run in the Google Earth Engine Code Editor
// (https://code.earthengine.google.com/).

// --- 1. Define the Region of Interest (São Carlos, SP) ---
// Approximate bounding box for São Carlos, São Paulo, Brazil.
// Coordinates are [min_longitude, min_latitude, max_longitude, max_latitude].
// You can adjust these coordinates if you need a more precise or larger area.
var saoCarlos_bbox = ee.Geometry.Rectangle([-48.05, -22.15, -47.75, -21.85]);

// Center the map view on São Carlos.
// Map.centerObject(geometry, zoomLevel);
// Zoom level 11 is a good starting point to see the city.
Map.centerObject(saoCarlos_bbox, 11);
print('Map centered on São Carlos, SP.');

// --- 2. Image Collection and Filtering ---
// Define a date range for image acquisition.
// Adjust these dates as needed to find suitable imagery.
var startDate = '2023-01-01'; // This date range seems to cause the issue
var endDate = '2023-12-31';   // Let's broaden it or adjust if needed after fix

// Define maximum allowed cloud cover percentage (0-100).
// Lower values ensure clearer images but might reduce availability.
var maxCloudCover = 5; // 5% cloud cover

// Load the Sentinel-2 Surface Reflectance (Level-2A) image collection.
// This collection provides atmospherically corrected imagery.
var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterDate(startDate, endDate)
  .filterBounds(saoCarlos_bbox)
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', maxCloudCover);

// --- FIX: Explicitly select the desired bands BEFORE taking the median. ---
// This ensures that all images in the collection that are passed to .median()
// have the exact same set of bands, resolving the "homogeneous" error.
var selectedBands = ['B4', 'B3', 'B2']; // Red, Green, Blue bands for natural color
var homogeneousCollection = sentinel2.select(selectedBands);

// Get the median composite image from the filtered and selected collection.
// The median mosaic helps to reduce cloud artifacts by taking the median pixel value
// across all available images for a given location within the time range.
var compositeImage = homogeneousCollection.median();

// Check if the composite image has any bands (i.e., if images were found).
var hasBands = compositeImage.bandNames().size().getInfo() > 0;

if (!hasBands) {
  print('Error: No suitable images found for São Carlos with the given criteria.');
  print('Consider adjusting dates, cloud cover, or the bounding box.');
} else {
  // Define visualization parameters for the RGB image.
  // min and max values define the stretch for display.
  var visualizationParams = {
    min: 0,      // Minimum pixel value for display
    max: 2500,   // Maximum pixel value for display (adjust as needed for brightness)
    gamma: 1.1   // Gamma correction for visual enhancement
  };

  // Add the RGB image to the map for visualization.
  Map.addLayer(compositeImage, visualizationParams, 'São Carlos - Sentinel-2 RGB');
  print('Image displayed on the map.');

  // --- 3. Export the Image to Google Drive ---
  // Define export parameters.
  var exportDescription = 'SaoCarlos_Satellite_Image_RGB';
  var exportFileNamePrefix = 'SaoCarlos_RGB_50';
  var exportFolder = 'GEE_Exports_SaoCarlos'; // Folder name in your Google Drive
  var exportScale = 50; // Resolution in meters per pixel (10m is Sentinel-2 native)
  var exportMaxPixels = 1e13; // Maximum number of pixels to export (increase for large areas)

  // Initiate the export task.
  Export.image.toDrive({
    image: compositeImage,
    description: exportDescription,
    folder: exportFolder,
    fileNamePrefix: exportFileNamePrefix,
    region: saoCarlos_bbox, // CORRECTED: Pass the ee.Geometry.Rectangle object directly
    scale: exportScale,
    maxPixels: exportMaxPixels
  });

  print('Export task initiated. Check the "Tasks" tab on the right side of the GEE Code Editor to monitor its progress.');
  print('Once completed, the image will be available in your Google Drive under the folder: ' + exportFolder);
}