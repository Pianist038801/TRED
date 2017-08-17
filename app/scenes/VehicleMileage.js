/**
 * TRED Vehicle Mileage Screen Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * February, 2015
 */
'use strict';

var React = require('react-native');
var {
  View,
  Text,
  Platform,
  TextInput,
  SegmentedControlIOS,
  Alert,
} = React;

var Button = require('apsl-react-native-button');
var KeyboardHandler = require('../components/KeyboardHandler.js');
var LocalStorage = require('../services/localStorage.service.js');
var InputAccessory = require('../components/InputAccessory.js');
var analytics = require('../services/analytics.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var VehicleMileage = React.createClass({
  getInitialState: function(){
    return {
      mileage: null,
      disabled: false,
      enableInputAccessory: false,
    };
  },
  componentDidMount: function(){
    var component = this;
    analytics.visited('VehicleInfo');
    LocalStorage.wip.listing.get().then(function(listing){
      component.setState({
        mileage: listing.mileage,
      });
      
    });
  },
  onChangeMileage: function(value){
    if (value !== null) {
      value = value.toString();
      value = value.replace(/[^0-9]/g, '');
      var num = value.replace(/,/gi, '');
      var num2 = num.replace(/\d(?=(?:\d{3})+$)/g, '$&,');
      this.setState({mileage:num2});
    }
  },
  hasErrors: function(){
    var error = null;
    if(!this.state.mileage){
      error = {msg:"You're missing your vehicle's mileage.", field:"mileage"};
    }
    return error;
  },  
  onConfirm: function(){
    var component = this;
    this.setState({disabled: true});
    var error = this.hasErrors();
    if(!error){
      return LocalStorage.wip.listing.update({
        mileage: this.state.mileage,
      }).then(function(){
        component.setState({disabled: false});
        component.props.navigator.push({
          id: 'InfoQuestions',
          name: 'Info Questions',
        });    
      });
    } else {
      component.setState({disabled: false});
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
            <Text style={styles.cameraTitle}>VEHICLE MILEAGE</Text>
            <Text style={styles.subText}>Look at your odometer and enter your mileage.</Text>

            <View style={[styles.formField]}>
              <Text style={[styles.label]}>Mileage</Text>
              <TextInput
                ref="mileage"
                keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                style={[styles.textInput]}
                selectTextOnFocus={true}
                onChangeText={this.onChangeMileage}
                onFocus={()=>{
                  this.setState({
                    enableInputAccessory: true,
                  });
                  this.refs['kh'].inputFocused(this,'mileage');
                }}
                onBlur={()=>{
                  this.setState({
                    enableInputAccessory: false,
                  });
                }}
                value={this.state.mileage} />
            </View>
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
        <InputAccessory buttonText='Done' onPress={()=>{this.refs.mileage.blur()}} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory}/>
      </View>
    );
  },
});

module.exports = VehicleMileage;
