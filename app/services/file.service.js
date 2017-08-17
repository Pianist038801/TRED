var RNFS = require('react-native-fs');

exports.remove = function(path) {
  return RNFS.unlink(path)
    .catch((err) => {
      // `unlink` will throw an error, if the item to unlink does not exist
      // and that's OK
    });
};

exports.exists = function(path) {
  return RNFS.readFile(path)
    .then(() => {
      return true;
    })
    .catch((err) => {
      return false;
    });
};
