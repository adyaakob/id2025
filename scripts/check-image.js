const sharp = require('sharp');

sharp('public/images/slide1.jpg')
  .metadata()
  .then(metadata => {
    console.log('Image dimensions:', {
      width: metadata.width,
      height: metadata.height
    });
  });
