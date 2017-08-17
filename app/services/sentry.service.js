var config = require('../../config');
var version = require('../version/version.json');
var Raven = require('raven-js');
require('raven-js/plugins/react-native')(Raven);
var Platform = require('react-native').Platform;
if (Platform.OS === 'ios') {
  var device = require('react-native-device');
}

Raven
  .config(config.sentry_dsn, { release: version.packageVersion })
  .install();

exports.captureException = function(ex, data) {
  data = data || {};
  if (device) {
    data.platformVersion = device.systemVersion;
  }
  if (ex instanceof Error) {
    Raven.captureException(ex, {
      extra: data
    });
  } else if (ex && ex.error && ex.error.message) {
    Raven.captureException(new Error(ex.error.message), {
      extra: data
    });
  } else {
    Raven.captureException(new Error(ex), {
      extra: data
    });
  }
};
