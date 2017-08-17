var utils = require('./utils');

var PriceService = {
  get: function(vin, style_id, zip, mileage, option_ids) {
    return utils.post('/api/prices', {
      vin: vin,
      style_id: style_id,
      zip: zip,
      mileage: mileage,
      option_ids: option_ids
    });
  }
};

module.exports = PriceService;
