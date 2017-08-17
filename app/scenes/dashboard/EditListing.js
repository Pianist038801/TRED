/**
 * TRED Test Layout
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
  TextInput,
  Alert,
} = React;
var Button = require('apsl-react-native-button');
var KeyboardHandler = require('../../components/KeyboardHandler.js');
var InputAccessory = require('../../components/InputAccessory.js');
var listingService = require('../../services/listing.service');
var analytics = require('../../services/analytics.service');
var utils = require('../../services/utils');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var EditListing = React.createClass({
  getDefaultProps: function(){
    return {
      listing: null,
    }
  },
  getInitialState: function(){
    return {
      mileage: null,
      price: null,
      enableInputAccessory: false,
      disabled: false,
      listing: false,
    }
  },
  componentDidMount: function(){
    var component = this;
    if(this.props.listing){
      this.setState({
        mileage: this.props.listing.mileage ? this.formatNumber(this.props.listing.mileage) : 0,
        price: this.props.listing.price ? this.formatMoney(this.props.listing.price) : 0,
        listing: this.props.listing
      });
    }
  },
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  formatNumber: function(value) {
    return utils.formatNumber(value);
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
  onChangePrice: function(value){
    value = value.toString();
    value = value.replace(/[^0-9]/g, '');
    var num = value.replace(/,/gi, '');
    var num2 = num.replace(/\d(?=(?:\d{3})+$)/g, '$&,');
    this.setState({
      price: '$' + num2
    });
  },
  hasErrors: function(){
    var error = null;
    if(!this.state.mileage){
      error = {msg:"You're missing your vehicle's mileage.", field:"mileage"};
    }
    if(!this.state.price){
      error = {msg:"You're missing your vehicle's price.", field:"price"};
    }
    if(utils.moneyToInt(this.state.price) > this.state.listing.price){
      error = {msg:"Your new price must be lower than the current price.", field:"price"};
      this.setState({
        price: utils.formatMoney(this.state.listing.price)
      })
    }
    return error;
  },  
  onConfirm: function(){
    var component = this;
    this.setState({disabled: true});
    var error = this.hasErrors();
    if(!error){
      if(this.state.listing.vin){
        return listingService.update(component.state.listing.vin, {
          mileage: parseInt(component.state.mileage.replace(',', '')),
        }).then(function(listing){
          if(component.state.price !== component.state.listing.price){
            return listingService.adjust_price(component.state.listing.vin, {
              current_price: component.state.listing.price,
              adjusted_price: utils.moneyToInt(component.state.price),
            }).then(function(_newPriceListing){
              component.setState({
                listing: _newPriceListing,
                disabled: false,
              });              
              component.props.navigator.replacePrevious({
                id: 'Listing',
                name: 'Listing',
                listing: component.state.listing,                
              });
              component.props.navigator.pop();
            }), function(){
              component.setState({disabled: false});
              Alert.alert("Uh Oh...", "An error occurred updating your vehicle. Please try again or contact us for help.", [
                {text: "Ok"}
              ]);              
            }
          } else {
            component.setState({
              listing: listing,
              disabled: false,
            });
            component.props.navigator.replacePrevious({
              id: 'Listing',
              name: 'Listing',
              listing: component.state.listing,                
            });
            component.props.navigator.pop();
          }
        }, function(){
          component.setState({disabled: false});
          Alert.alert("Uh Oh...", "An error occurred updating your vehicle. Please try again or contact us for help.", [
            {text: "Ok"}
          ]);
        });
      } else {
        component.setState({disabled: false});
        Alert.alert("Uh Oh...", "We cannot update your vehicle at this time. Please try again later.", [
          {text: "Ok"}
        ]);            
      }
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
    var listing = this.state.listing;
    return (
      <View style={{flex:1}}>
        <View style={[styles.main, {paddingTop:75}]}>
          <KeyboardHandler ref='kh' offset={110}>
            <View style={[styles.content, {paddingHorizontal:0}]}>
              <Text style={[styles.cameraTitle]}>EDIT YOUR {listing.make ? listing.make.toUpperCase() : ''} {listing.model ? listing.model.toUpperCase() : ''}</Text>
              <View style={[styles.formField]}>
                <Text style={[styles.largeLabel]}>CHANGE YOUR MILEAGE</Text>
                <TextInput
                  ref="mileage"
                  keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                  style={[styles.textInput]}
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
              <View style={[styles.formField, {marginTop:15}]}>
                <Text style={[styles.largeLabel]}>LOWER YOUR PRICE</Text>
                <TextInput
                  ref="price"
                  enablesReturnKeyAutomatically={true}
                  keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                  style={[styles.textInput]}
                  onChangeText={this.onChangePrice}
                  value={this.state.price}
                  placeholder={this.state.suggestedStartingPrice}
                  onFocus={()=>{
                    this.setState({
                      enableInputAccessory: true,
                    });
                    this.refs['kh'].inputFocused(this,'price');
                  }}
                  onBlur={()=>{
                    this.setState({
                      enableInputAccessory: false,
                    });
                  }}
                  maxLength={8} />
                <Text style={[styles.subText, {marginTop:15}]}>
                  <Text style={{fontWeight:'bold'}}>Please Note: </Text>
                  It can take up to 24 hours for your new price to be posted on all services.
                </Text>
              </View>
            </View>
          </KeyboardHandler>
          <View style={styles.bottom}>
            <View style={styles.stretch}>
              <View style={styles.formFieldHorizontal}>
                <Button onPress={() => this.props.navigator.pop()} style={[styles.cancelButton, {flex:1, marginLeft:15}]} textStyle={styles.cancelButtonText} isDisabled={this.state.disabled}>
                  CANCEL
                </Button>
                <Button onPress={this.onConfirm} style={[styles.actionButton, {flex:1, marginLeft:15}]} textStyle={styles.cancelButtonText} isDisabled={this.state.disabled}>
                  SUBMIT
                </Button>
              </View>
            </View>
          </View>
        </View>
        <InputAccessory buttonText='Done' onPress={()=>{this.refs.mileage.blur(); this.refs.price.blur();}} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory}/>
      </View>
    );
  }
});
module.exports = EditListing;
