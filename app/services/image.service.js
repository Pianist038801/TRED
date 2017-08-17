var localStorage = require('./localStorage.service');
var fileService = require('./file.service');
var listingService = require('./listing.service');
var utils = require('./utils');

var LS_IMAGE_KEY = 'images';

exports.addImage = function(key, uri, options) {
  return localStorage.getObject(LS_IMAGE_KEY)
    .then((images) => {
      if (!images) {
        images = {};
      } else if (images[key] && images[key].uri != uri) {
        // Clean up the old image
        return fileService.remove(images[key].uri)
          .then(() => {
            return images;
          });
      }
      return images;
    })
    .then((images) => {
      images[key] = {
        uri: uri,
        options: options,
        uploaded: false
      };
      return localStorage.setObject(LS_IMAGE_KEY, images, true);
    });
};

exports.getImage = async function(key) {
  var images = await localStorage.getObject(LS_IMAGE_KEY);
  if (images && images[key]) {
    return images[key];
  } else {
    return null;
  }
};

async function markUploaded(key) {
  var images = await localStorage.getObject(LS_IMAGE_KEY);
  if (images && images[key]) {
    images[key] = Object.assign(images[key], { uploaded: true });
  }
  return localStorage.setObject(LS_IMAGE_KEY, images);
}

exports.uploadImages = async function(vin, notify) {
  // upload any images that haven't been uploaded already from local storage
  var images = await localStorage.getObject(LS_IMAGE_KEY);
  var tasks = [];

  for (var imageKey in images) {
    if (images.hasOwnProperty(imageKey) && !images[imageKey].uploaded) {
      tasks.push((function (imageKey) {
        return () => {
          return listingService.uploadImage(vin, images[imageKey].options, images[imageKey].uri)
            .then(function () {
              return markUploaded(imageKey);
            })
            .then(notify);
        };
      })(imageKey));
    }
  }

  await utils.durable(tasks);
};

exports.resetUploaded = async function() {
  // FOR TESTING
  console.log('resetUploaded');
  var images = await localStorage.getObject(LS_IMAGE_KEY);
  for (var image in images) {
    images[image] = Object.assign(images[image], { uploaded: false });
  }
  await localStorage.setObject(LS_IMAGE_KEY, images);
};
