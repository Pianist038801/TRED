/**
 * TRED Front Interior Screen Component
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

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var PhotoFrontInterior = React.createClass({
  getInitialState: function() {
    return {
      lastCaptureUri: null,
      loading: true
    };
  },
  componentDidMount: function(){
    analytics.visited('PhotoFrontInterior');
    return imageService.getImage('frontInterior')
      .then((image) => {
        this.setState({
          lastCaptureUri: image && image.uri,
          loading: false,
        });
      });
  },
  onConfirm: function(data) {
    return imageService.addImage('frontInterior', data.imageUri, {category: 'interior'})
      .then(() => {
        this.props.navigator.push({
          id: 'PhotoFrontPassengerCorner',
          name: 'PhotoFrontPassengerCorner',
        });
      });
  },
  render: function() {
    return (
      <View style={styles.cameraScene}>
        { this.state.loading ? null : <Camera
          title="FRONT INTERIOR"
          instructions="Using the orange outline as a guide, take a pic of the front interior through the passenger door."
          confirmation="Make sure your pic is centered and in focus. Keep in mind, well photographed cars sell for more."
          overlayImage={require('../../images/overlays/photo-front-interior.png')}
          vinRead={false}
          onConfirm={this.onConfirm}
          lastCaptureUri={this.state.lastCaptureUri}>
        </Camera>}
      </View>
    );
  }
});

module.exports = PhotoFrontInterior;
