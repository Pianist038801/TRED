/**
 * TRED Rear Driver Corner Photo Screen Component
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

var PhotoRearDriverCorner = React.createClass({
  getInitialState: function() {
    return {
      lastCaptureUri: null,
      loading: true
    };
  },
  componentDidMount: function(){
    analytics.visited('PhotoRearDriverCorner');
    return imageService.getImage('rearDriverCorner')
      .then((image) => {
        this.setState({
          lastCaptureUri: image && image.uri,
          loading: false,
        });
      });
  },
  onConfirm: function(data) {
    return imageService.addImage('rearDriverCorner', data.imageUri, {category: 'exterior'})
      .then(() => {
        this.props.navigator.push({
          id: 'PhotoRear',
          name: 'Photo Rear',
        });
      });
  },
  render: function() {
    return (
      <View style={styles.cameraScene}>
        { this.state.loading ? null : <Camera
          title="REAR DRIVER CORNER"
          instructions="Use the orange outline to line up a pic from the rear driver corner. The best pics are taken from bumper height so GET LOW."
          confirmation="Make sure your pic is centered and in focus."
          overlayImage={require('../../images/overlays/photo-rear-driver-corner.png')}
          vinRead={false}
          onConfirm={this.onConfirm}
          lastCaptureUri={this.state.lastCaptureUri}>
        </Camera>}
      </View>
    );
  }
});

module.exports = PhotoRearDriverCorner;
