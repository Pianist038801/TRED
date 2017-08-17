var config = require('../../config');
var version = require('../version/version.json');
var Mixpanel;
if (config.enable_mixpanel) {
  Mixpanel = require('react-native-mixpanel');
  
  Mixpanel.sharedInstanceWithToken(config.mixpanel_token);
} else {
  Mixpanel = {
    trackWithProperties: function() {},
    identify: function() {},
    track: function() {},
  };
}

exports.visited = function(routeId) {
  Mixpanel.trackWithProperties('Visited Scene - ' + routeId, {"version": version.commitish});
};

exports.identify = function(user_id) {
  Mixpanel.identify(user_id);
};

exports.track = function(event, properties) {
  Mixpanel.trackWithProperties(event, properties);
};