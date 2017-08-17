var LockOrientation = require('react-native').NativeModules.LockOrientation;
var Platform = require('react-native').Platform;

exports.lockToPortrait = function() {
  if (Platform.OS === 'ios') {
    LockOrientation.lockToPortrait();
  }
};

exports.lockToLandscapeRight = function() {
  if (Platform.OS === 'ios') {
    LockOrientation.lockToLandscapeRight();
  }
};

exports.lockToLandscapeLeft = function() {
  if (Platform.OS === 'ios') {
    LockOrientation.lockToLandscapeLeft();
  }
};
