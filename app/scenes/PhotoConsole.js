/**
 * TRED Dashboard Screen Component
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

var PhotoDashboard = React.createClass({
  getInitialState: function() {
    return {
      lastCaptureUri: null,
      loading: true
    };
  },
  componentDidMount: function(){
    analytics.visited('PhotoDashboard');
    return imageService.getImage('console')
      .then((image) => {
        this.setState({
          lastCaptureUri: image && image.uri,
          loading: false,
        });
      });
  },
  onConfirm: function(data) {
    return imageService.addImage('console', data.imageUri, {category: 'interior'})
      .then(() => {
        this.props.navigator.push({
          id: 'VehicleMileage',
          name: 'Vehicle Mileage',
        });
      });
  },
  render: function() {
    return (
      <View style={styles.cameraScene}>
        { this.state.loading ? null : <Camera
          title="CENTER CONSOLE"
          instructions="Using the orange outline as a guide, turn the engine on and take a photo of the center console."
          confirmation="Make sure your pic is centered and in focus."
          overlayImage={require('../../images/overlays/photo-console.png')}
          hideOverlayLandscape={true}
          vinRead={false}
          onConfirm={this.onConfirm}
          lastCaptureUri={this.state.lastCaptureUri}>
        </Camera>}
      </View>
    );
  }
});

module.exports = PhotoDashboard;
