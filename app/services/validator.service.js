var utils = require('./utils');

var ValidatorService = {
  validateEmail: function(email) {
    return utils.get('/api/validator/email?email=' + email);
  },
  validatePhone: function(phone) {
    return utils.get('/api/validator/phone?phone=' + phone);
  },
  validateVin: function(vin) {
    return utils.get('/api/validator/vin?vin=' + vin);
  }
};

module.exports = ValidatorService;