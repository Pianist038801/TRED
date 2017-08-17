var utils = require('./utils');

var EdmundsService = {
  vin: function(vin) {
    return utils.get('/api/edmunds/vins/' + vin)
      .then((res) => {
        if (res && res.years && res.years.length > 0 && res.years[0].year
            && res.make && res.make.name
            && res.model && res.model.name
            && res.years[0].styles && res.years[0].styles.length > 0 && res.years[0].styles[0].name
            && res.years[0].styles[0].id) {
          return res;
        } else {
          throw new Error('Could not get VIN info');
        }
      });
  },
  details: function(style_id){
    return utils.get('/api/edmunds/details/' + style_id)
      .then((res) => {
        if (res && res.colors && res.colors.exterior && res.colors.interior) {
          return res;
        } else {
          throw new Error('Could not get color information for this style id.');
        }
      });
  },
  options: function(style_id){
    return utils.get('/api/edmunds/options/' + style_id)
      .then((res) => {
        if (res && res.options) {
          return res;
        } else {
          throw new Error('Could not get option information for this style id.');
        }
      });
  },  
};

module.exports = EdmundsService;
