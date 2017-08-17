var utils = require('./utils');
var localStorage = require('./localStorage.service');
var Platform = require('react-native').Platform;

var ListingService = {
  create: async function(data) {
    // if no data, use the local listing wip
    if (!data) {
      var listingWip = await localStorage.wip.listing.get();
      // do transformations here
      data = {
        vin: listingWip.vin,
        year: '' + listingWip.year,
        make: listingWip.make,
        model: listingWip.model,
        style_id: '' + listingWip.style_id,
        user_id: listingWip.user_id,
        body_style: listingWip.body_style,
        mileage: parseInt(listingWip.mileage.replace(',', '')),
        exterior_color_id: listingWip.exterior_color_id,
        interior_color_id: listingWip.interior_color_id,
        option_ids: listingWip.option_ids,
        location_day_street: listingWip.day_street,
        location_day_city: listingWip.day_city,
        location_day_state: listingWip.day_state,
        location_day_zip: listingWip.day_zip,
        price: listingWip.price,
        consignment_form: {
          car_loan: listingWip.has_loan,
          car_loan_balance: listingWip.loan_amount,
          loan_bank_name: listingWip.bank_name,
          loan_account_number: listingWip.loan_account_number,
          loan_ssn: listingWip.loan_ssn,
          has_dog: listingWip.has_dog,
          has_smoked: listingWip.has_smoked,
          modifications: listingWip.modifications,
          registered_owner: listingWip.registered_owner,
        },
        creation_source: Platform.OS
      };

      if (!listingWip.same_as_day) {
        data.location_night_street = listingWip.night_street;
        data.location_night_city = listingWip.night_city;
        data.location_night_state = listingWip.night_state;
        data.location_night_zip = listingWip.night_zip;
      }
    }

    return utils.post('/api/listings', data);
  },
  update: function(vin, data) {
    return utils.post('/api/listings/' + vin, data);
  },
  adjust_price: function(vin, data) {
    return utils.post('/api/listings/' + vin + '/adjust_price', data);
  },
  review: async function(vin) {
    if (!vin) {
      var listingWip = await localStorage.wip.listing.get();
      vin = listingWip.vin;
    }
    return utils.post('/api/listings/' + vin + '/review');
  },
  get: async function(vin) {
    if (!vin) {
      var listingWip = await localStorage.wip.listing.get();
      vin = listingWip.vin;
    }
    return utils.get('/api/listings/' + vin);
  },
  uploadImage: function(vin, options, fileUrl) {
    let data = new FormData();
    if (fileUrl) {
      data.append('images', {uri: fileUrl, name: 'image.jpg', type: 'image/jpg'});
    }
    if (options) {
      data.append('options', JSON.stringify(options));
    }
    return utils.post('/api/listings/' + vin + '/images', data);
  },
  urls: function(vin) {
    return utils.get('/api/listings/' + vin + '/urls');
  },
  createTestDrive: function(vin, data) {
    return utils.post('/api/listings/' + vin + '/test_drives', data);
  },
  updateTestDrive: function(vin, test_drive_id, data) {
    return utils.post('/api/listings/' + vin + '/test_drives/' + test_drive_id, data);
  },
  confirmTestDrive: function(vin, test_drive_id, chosen_time_index, data) {
    return utils.post('/api/listings/' + vin + '/test_drives/' + test_drive_id + '/confirm/' + chosen_time_index, data);
  },  
  cancelTestDrive: function(vin, test_drive_id) {
    return utils.del('/api/listings/' + vin + '/test_drives/' + test_drive_id);
  },
  requestRescheduleTestDrive: function(vin, test_drive_id) {
    return utils.post('/api/listings/' + vin + '/test_drives/' + test_drive_id + '/reschedule');
  }
};

module.exports = ListingService;
