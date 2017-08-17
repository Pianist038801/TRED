/**
 * TRED Front Driver Corner Photo Screen Component
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

var PhotoFrontDriverCorner = React.createClass({
  getInitialState: function() {
    return {
      lastCaptureUri: null,
      loading: true
    };
  },
  componentDidMount: function(){
    analytics.visited('PhotoFrontDriverCorner');
    return imageService.getImage('frontDriverCorner')
      .then((image) => {
        this.setState({
          lastCaptureUri: image && image.uri,
          loading: false,
        });
      });
  },
  onConfirm: function(data) {
    return imageService.addImage('frontDriverCorner', data.imageUri, {category: 'exterior'})
      .then(() => {
        this.props.navigator.push({
          id: 'PhotoDriverSide',
          name: 'Photo Driver Side',
        });
      });
  },
  render: function() {
    return (
      <View style={styles.cameraScene}>
        { this.state.loading ? null : <Camera
          title="FRONT DRIVER CORNER"
          instructions="Use the orange outline to line up a pic from the front driver corner. The best pics are taken from bumper height so GET LOW."
          confirmation="Make sure your pic is centered and in focus. Well photographed cars sell for more money."
          overlayImage={require('../../images/overlays/photo-front-driver-corner.png')}
          vinRead={false}
          onConfirm={this.onConfirm}
          lastCaptureUri={this.state.lastCaptureUri}>
        </Camera>}
      </View>
    );
  }
});

module.exports = PhotoFrontDriverCorner;
