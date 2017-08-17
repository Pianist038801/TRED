/**
 * TRED Manual VIN Entry Layout
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * January, 2016
 */
'use strict';

var React = require('react-native');
var {
  View,
  Text,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../services/analytics.service');
var KeyboardHandler = require('../components/KeyboardHandler.js');
var InputAccessory = require('../components/InputAccessory.js');
var LoadingOverlay = require('../components/LoadingOverlay.js');
var validator = require('../services/validator.service');
var edmunds = require('../services/edmunds.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var ManualVinEntry = React.createClass({
  getInitialState: function() {
    return {
      vin: null,
      fetchingVinInfo: false,
      vinInfo: null,
    };
  },
  getVinInfo: function(vin) {
    var component = this;
    return edmunds.vin(vin)
      .then(function (res) {
        res.vin = vin.toUpperCase();

        var styleId;
        if (res && res.years && res.years.length > 0 && res.years[0].styles && res.years[0].styles.length == 1) {
          styleId = res.years[0].styles[0].id;
        }
        component.props.navigator.replacePrevious({
          id: 'PhotoVin',
          name: 'Photo VIN',
          vinInfo: res,
          styleId: styleId,          
        });
        component.props.navigator.pop();
      })
      .catch(function (err) {
        component.setState({
          fetchingVinInfo: false,
          vinInfo: null,
        });
        Alert.alert("Uh Oh...", "It looks like the VIN you entered is invalid.", [
          {text: "Fix", onPress: () => {}}
        ]);
      });
  },  
  onSubmitManualEntry: function() {
    var component = this;
    analytics.track('VIN Manually Entered', {vin: this.state.vin});
    component.setState({
      fetchingVinInfo: true,
    });
    return validator.validateVin(this.state.vin)
      .then(function(result) {
        if (result && !result.ok) {
          component.setState({
            fetchingVinInfo: false,
          }, function() {
            Alert.alert("Uh Oh...", "It looks like the VIN you entered is invalid.", [
              {text: "Fix", onPress: () => {}}
            ]);
          });
        } else {
          return component.getVinInfo(component.state.vin);
        }
      });
  },
  render: function() {
    var component = this;
    return (
      <View style={{flex:1}}>
        <View style={[styles.main, {paddingTop:75}]}>
          <KeyboardHandler ref='kh' offset={125}>
            <View style={[styles.content, {paddingHorizontal:0}]}>
              <Text style={styles.cameraTitle}>VEHICLE IDENTIFICATION NUMBER</Text>
              <Text style={styles.pText}>The easiest place to find your VIN number is on your insurance. If you don&apos;t have it handy, here are a couple other places to check:</Text>
              <View style={[styles.hiwImageContainer, {marginVertical:10}]}>
                <Image
                  source={require('../../images/findmyvin.png')}
                  style={[styles.hiwImage, styles.hiwImage]} />
              </View>
              <View style={styles.formField}>
                <Text style={[styles.label]}>Enter your 17 digit VIN Number</Text>
                <TextInput
                  ref='vin'
                  autoCapitalize={'characters'}
                  style={[styles.textInput]}
                  onChangeText={(vin) => this.setState({vin})}
                  value={this.state.vin}
                  maxLength={17}
                  onFocus={()=>this.refs['kh'].inputFocused(this,'vin')} />
              </View>
            </View>
          </KeyboardHandler>
          <View style={[styles.bottom]}>
            <View style={styles.stretch}>
              <View style={styles.formFieldHorizontal}>
                <Button onPress={() => {this.props.navigator.pop();}} style={[styles.cancelButton, styles.left, {flex:1, marginLeft:15}]} textStyle={styles.cancelButtonText}>
                  CANCEL
                </Button>
                <Button style={[styles.actionButton, styles.right, {flex:1, marginRight:15}]} textStyle={styles.actionButtonText} onPress={this.onSubmitManualEntry} isDisabled={!this.state.vin || this.state.vin.length != 17}>
                  SUBMIT
                </Button>
              </View>
            </View>
          </View>
        </View>
        <LoadingOverlay isVisible={component.state.fetchingVinInfo} text="Looking up your vehicle..." />
      </View>
    );
  }
});
module.exports = ManualVinEntry;
