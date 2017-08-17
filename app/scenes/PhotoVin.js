/**
 * TRED VIN Photo Screen Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
 */
'use strict';

var React = require('react-native');
var {
  View,
  Platform,
} = React;
var Camera = require('../components/Camera');
var localStorage = require('../services/localStorage.service');
var imageService = require('../services/image.service');
var analytics = require('../services/analytics.service');
var edmunds = require('../services/edmunds.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var PhotoVin = React.createClass({
  getInitialState: function() {
    return {
      lastCaptureUri: null,
      vinInfo: null,
      styleId: null,
      loading: true,
    };
  },
  componentDidMount: function(){
    analytics.visited('PhotoVin');

    if(this.props.vinInfo){
      this.setState({
        vinInfo: this.props.vinInfo,
        styleId: this.props.styleId,
        loading: false,
      });      
    }

    return imageService.getImage('vin')
      .then((image) => {
        return localStorage.wip.listing.get()
          .then((listing) => {
            this.setState({
              lastCaptureUri: image && image.uri,
              vinInfo: listing && listing.vinInfo,
              styleId: listing && listing.style_id,
              loading: false,
            });
          });
    });
  },
  onConfirm: function(data) {
    var body_style;
    if (data && data.vinInfo && data.styleId && data.vinInfo.years && data.vinInfo.years.length > 0 && data.vinInfo.years[0].styles && data.vinInfo.years[0].styles.length > 0) {
      var style = data.vinInfo.years[0].styles.find((style) => {
        return style.id === data.styleId;
      });
      body_style = style.submodel && style.submodel.body;
    }

    var details = null;
    return edmunds.details(data.styleId).then((_details) => {
      details = _details;
      return edmunds.options(data.styleId);
    }).then((options) => {
      return localStorage.wip.listing.upsert({
        vin: data.vinInfo.vin,
        year: data.vinInfo.years && data.vinInfo.years.length > 0 && data.vinInfo.years[0].year,
        make: data.vinInfo.make && data.vinInfo.make.name,
        model: data.vinInfo.model && data.vinInfo.model.name,
        style_id: data.styleId,
        body_style: body_style,
        details: details,
        options: options,
        vinInfo: data.vinInfo, // store the whole object to make returning to this scene easier
      });
    }).then(() => {
      if (data.imageUri) {
        return imageService.addImage('vin', data.imageUri, {category: 'vin'});
      }
    }).then(() => {
      this.props.navigator.push({
        id: 'PhotoFrontDriverCorner',
        name: 'Photo Front Driver Corner',
      });
    });
  },
  render: function() {
    return (
      <View style={styles.cameraScene}>
        { this.state.loading ? null : <Camera
          title="SCAN THE BARCODE"
          instructions="Open the driver door and look inside the door well for a sticker with a barcode. Point your phone at it and line up the barcode."
          overlayImage={require('../../images/overlays/photo-vin.gif')}
          vinRead={true}
          onConfirm={this.onConfirm}
          vinInfo={this.state.vinInfo}
          styleId={this.state.styleId}
          lastCaptureUri={this.state.lastCaptureUri}
          navigator={this.props.navigator}>
        </Camera>}
      </View>        
    );
  }
});

module.exports = PhotoVin;
