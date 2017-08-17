/**
 * TRED Vehicle Location Screen Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
 */
'use strict';

var React = require('react-native');
var {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  TextInput,
  SegmentedControlIOS,
  Alert,
  Button,
} = React;

var Button = require('apsl-react-native-button');
var KeyboardHandler = require('../components/KeyboardHandler.js');
var LocalStorage = require('../services/localStorage.service.js');
var InputAccessory = require('../components/InputAccessory.js');
var analytics = require('../services/analytics.service');
var userService = require('../services/user.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var VehicleLocation = React.createClass({
  getInitialState: function(){
    return {
      mailing_street: null,
      mailing_city: null,
      mailing_state: null,
      mailing_zip: null,
      disabled: false,
      enableInputAccessory: false,
    };
  },
  componentDidMount: function(){
    analytics.visited('VehicleLocation');
    var component = this;
    userService.get().then(function(user){
      component.setState({
        mailing_street: user.mailing_street,
        mailing_city: user.mailing_city,
        mailing_state: user.mailing_state || 'WA',
        mailing_zip: user.mailing_zip || user.zip,
      });
      if(!user || !user.mailing_street){
        component.refs.mailing_street.focus();
      }
    });
  },
  onZipField: function(){
    this.refs.mailing_zip.blur();
  },
  validateZip: function(zip){
    if(typeof zip !== 'undefined' && zip && zip.length > 0 && zips.indexOf(zip) == -1) {
      return false;
    }
    return true;
  },
  hasErrors: function(){
    var error = null;
    if(!this.state.mailing_street){
      error = {msg:"You're missing your mailing street address.", field:"mailing_street"};
      return error;
    } else if (!this.state.mailing_city) {
      error = {msg:"You're missing your mailing city.", field:"mailing_city"};
      return error;
    } else if (!this.state.mailing_state) {
      error = {msg:"You're missing your mailing state.", field:"mailing_state"};
      return error;
    } else if (!this.state.mailing_zip) {
      error = {msg:"You're missing your mailing zip code.", field:"mailing_zip"};
      return error;
    }
    return error;
  },
  onConfirm: function(){
    var component = this;    
    this.setState({disabled: true});
    var error = this.hasErrors();
    if(!error){
      userService.update({
        mailing_street: this.state.mailing_street,
        mailing_city: this.state.mailing_city,
        mailing_state: this.state.mailing_state || 'WA',
        mailing_zip: this.state.mailing_zip,
      }).then(function(){
        LocalStorage.wip.user.upsert({ zip: component.state.mailing_zip }).then(function() {
          component.setState({disabled: false});
          component.props.navigator.push({
            id: 'LoanInfo',
            name: 'Loan Information',
          });    
        }, function(){
          alert("An error occurred creating a local user.");
        });
      });
    } else {
      this.setState({disabled: false});
      Alert.alert("Uh Oh...", error.msg, [
        {text: "Fix", onPress: () => {
            setTimeout(() =>{
              component.refs[error.field].focus()
            }, 250);
          }
        }
      ]);      
    }
  },
  render: function() {
    var component = this;
    return (
      <View style={styles.main}>
        <KeyboardHandler ref='kh' offset={110}>
          <View style={[styles.content, {paddingHorizontal:0}]}>
            <Text style={styles.cameraTitle}>MAILING ADDRESS</Text>
            <Text style={styles.subText}>We may need to send you important documents.</Text>
            
            <View style={styles.formField}>
              <Text style={[styles.label]}>Street Address</Text>
              <TextInput
                ref="mailing_street"
                autoFocus={false}
                autoCapitalize='words'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                selectTextOnFocus={true}
                style={[styles.textInput]}
                onChangeText={(mailing_street) => this.setState({mailing_street})}
                value={this.state.mailing_street}
                onSubmitEditing={()=>{this.refs.mailing_city.focus()}}
                onFocus={()=>this.refs['kh'].inputFocused(this,'mailing_street')} />
            </View>
            <View style={styles.formFieldHorizontal}>
              <Text style={[styles.label, styles.city]}>City</Text>
              <Text style={[styles.label, styles.state, {marginLeft:-5}]}>State</Text>
              <Text style={[styles.label, styles.zip]}>Zip</Text>
            </View>
            <View style={styles.formFieldHorizontal}>
              <TextInput
                ref="mailing_city"
                autoCapitalize='words'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                selectTextOnFocus={true}
                style={[styles.textInput, styles.city]}
                onChangeText={(mailing_city) => this.setState({mailing_city})}
                value={this.state.mailing_city} 
                onSubmitEditing={()=>{this.refs.mailing_state.focus()}}
                onFocus={()=>this.refs['kh'].inputFocused(this,'mailing_city')} />
              <TextInput
                ref="mailing_state"
                autoCapitalize='characters'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                selectTextOnFocus={true}
                style={[styles.textInput, styles.state]}
                onChangeText={(mailing_state) => this.setState({mailing_state})}
                value={this.state.mailing_state} 
                maxLength={2} 
                onSubmitEditing={()=>{this.refs.mailing_zip.focus()}}
                onFocus={()=>this.refs['kh'].inputFocused(this,'mailing_state')} />
              <TextInput
                ref="mailing_zip"
                keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                enablesReturnKeyAutomatically={true}
                selectTextOnFocus={true}
                style={[styles.textInput, styles.zip]}
                onChangeText={(mailing_zip) => this.setState({mailing_zip})}
                value={this.state.mailing_zip} 
                maxLength={5}
                onFocus={()=>{
                  this.setState({
                    enableInputAccessory: true,
                  });
                  this.refs['kh'].inputFocused(this,'mailing_zip');
                }}
                onBlur={()=>{
                  this.setState({
                    enableInputAccessory: false,
                  });
                }} />
            </View>
            <View ref="extra" style={{height:0}}></View>
          </View>
        </KeyboardHandler>
        <View style={styles.bottom}>
          <View style={styles.stretch}>
            <View style={styles.formField}>
              <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText} isDisabled={this.state.disabled}>
                CONTINUE
              </Button>
            </View>
          </View>
        </View>
        <InputAccessory buttonText='Next' onPress={this.onZipField} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory}/>
      </View>
    );
  },
});

module.exports = VehicleLocation;
