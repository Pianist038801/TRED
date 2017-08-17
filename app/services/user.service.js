var utils = require('./utils');
var Platform = require('react-native').Platform;

var UserService = {
  get: function() {
    return utils.get('/api/user');
  },
  update: function(data) {
    return utils.post('/api/user', data);
  },
  registerDevice: function(oldToken, newToken) {
    // pass the old token as well so that it is unregistered
    console.log('Registering device with token ' + newToken);
    return utils.post('/api/user/devices', { oldToken: oldToken, token: newToken, platform: Platform.OS }, true);
  }
};

module.exports = UserService;
