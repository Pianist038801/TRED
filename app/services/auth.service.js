var utils = require('./utils');
var localStorage = require('./localStorage.service');
var userService = require('./user.service');
var analytics = require('./analytics.service');

var AuthService = {
  signup: async function(data) {
    var user;
    // if no data, use the local user wip
    if (!data) {
      var userWip = await localStorage.wip.user.get();
      // do transformations here
      userWip.sell_car = {};
      user = await utils.post('/api/auth/local/signup', userWip);
    } else {
      user = await utils.post('/api/auth/local/signup', data);
    }
    var token = await localStorage.get('DEVICE_TOKEN');
    if (token) {
      userService.registerDevice(null, token);
    }
    return user;
  },
  login: async function(email, password) {
    email = email.toLowerCase();
    var user = await utils.post('/api/auth/local/login', {email: email, password: password}, true);
    var token = await localStorage.get('DEVICE_TOKEN');
    if (token) {
      if (user.devices) {
        // Check if this device is already registered
        var thisDevice = user.devices.find(function(device) {
          return device.token == token;
        });
        if (!thisDevice) {
          // This is a new device, register it
          userService.registerDevice(null, token);
        }
      } else {
        userService.registerDevice(null, token);
      }
    }
    return user;
  },
  logout: function() {
    return utils.post('/api/auth/logout');
  },
  isLoggedIn: function() {
    return userService.get()
      .then(function(user) {
        return user && user.id ? user : false;
      })
      .catch(function() {
        return false;
      });
  }
};

module.exports = AuthService;
