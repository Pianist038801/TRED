/**
 * TRED View External Listings Layout
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
  TouchableOpacity,
  Alert,
  Linking,
} = React;
var Button = require('apsl-react-native-button');
var KeyboardHandler = require('../../components/KeyboardHandler.js');
var InputAccessory = require('../../components/InputAccessory.js');
var authService = require('../../services/auth.service');
var userService = require('../../services/user.service');
var listingService = require('../../services/listing.service');
var analytics = require('../../services/analytics.service');
var utils = require('../../services/utils');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');


var ViewExternalListings = React.createClass({
  getInitialState: function(){
    return {
      listing: null,
      urls: null,
    }
  },
  componentDidMount: function(){
    var component = this;
    if(this.props.vin){
      listingService.urls(this.props.vin).then(function(urls){
        component.setState({
          urls: urls.urls
        });
        return listingService.get(component.props.vin);
      }).then(function(listing){
        component.setState({
          listing: listing
        });
      });
    }
  },
  visitExternal: function(service){
    var url = this.state.urls[service];
    if(url){
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          return Linking.openURL(url);
        }
      });
    } else {
      Alert.alert("Uh Oh...", "Your vehicle is not available on this service yet, It can take up to 24 hours. Please try again later.", [
        {text: "Ok" }
      ]);                  
    }
  },
  render: function() {
    var paddingTop = 75;
    if(Platform.OS === 'android'){
      paddingTop = 60;
    }
    var listing = this.state.listing;
    return (      
      <View style={[styles.main, {paddingTop:paddingTop}]}>
        <KeyboardHandler ref='kh' offset={110}>
          <View style={[styles.content, {paddingHorizontal:0}]}>
            <Text style={[styles.cameraTitle]}>YOUR {listing && listing.make ? listing.make.toUpperCase() : ""} {listing && listing.model ? listing.model.toUpperCase() : ""} LISTINGS</Text>
            <Text style={styles.subText}>
              View your vehicle for sale on each one of our partner sites.
            </Text>
            <View style={styles.logoRow}>
              <TouchableOpacity onPress={() => {this.visitExternal('tred');}} style={[styles.externalLeft]}>
                <Image
                  source={require('../../../images/external_buttons/tred.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {this.visitExternal('autotrader');}} style={[styles.externalRight]}>
                <Image
                  source={require('../../../images/external_buttons/autotrader.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
            </View>
            <View style={styles.logoRow}>
              <TouchableOpacity onPress={() => {this.visitExternal('craigslist');}} style={[styles.externalLeft]}>
                <Image 
                  source={require('../../../images/external_buttons/craigslist.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {this.visitExternal('truecar');}} style={[styles.externalRight]}>
                <Image 
                  source={require('../../../images/external_buttons/truecar.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
            </View>
            <View style={styles.logoRow}>
              <TouchableOpacity onPress={() => {this.visitExternal('edmunds');}} style={[styles.externalLeft]}>
                <Image 
                  source={require('../../../images/external_buttons/edmunds.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {this.visitExternal('usaa');}} style={[styles.externalRight]}>
                <Image 
                  source={require('../../../images/external_buttons/usaa.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
            </View>
            <View style={styles.logoRow}>
              <TouchableOpacity onPress={() => {this.visitExternal('amex');}} style={[styles.externalLeft]}>
                <Image 
                  source={require('../../../images/external_buttons/amex.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {this.visitExternal('usnews');}} style={[styles.externalRight]}>
                <Image 
                  source={require('../../../images/external_buttons/usnews.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
            </View>
            <View style={styles.logoRow}>
              <TouchableOpacity onPress={() => {this.visitExternal('overstock');}} style={[styles.externalLeft]}>
                <Image 
                  source={require('../../../images/external_buttons/overstock.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {this.visitExternal('cargurus');}} style={[styles.externalRight]}>
                <Image 
                  source={require('../../../images/external_buttons/cargurus.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>                   
            </View>
            <View style={styles.logoRow}>
              <TouchableOpacity onPress={() => {this.visitExternal('geico');}} style={[styles.externalLeft]}>
                <Image 
                  source={require('../../../images/external_buttons/geico.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {this.visitExternal('allstate');}} style={[styles.externalRight]}>
                <Image 
                  source={require('../../../images/external_buttons/allstate.png')}
                  style={[styles.externalButton]} />                      
              </TouchableOpacity>                   
            </View>            
            { this.state.urls && this.state.urls.cars_com ?
              <View style={styles.logoRow}>
                <TouchableOpacity onPress={() => {this.visitExternal('cars_com');}} style={[styles.externalLeft]}>
                  <Image 
                    source={require('../../../images/external_buttons/carscom.png')}
                    style={[styles.externalButton]} />                      
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.visitExternal('cars_com');}} style={[styles.externalLeft]}>
                </TouchableOpacity>                    
              </View> : null
            }
            <Text style={[styles.subText, {marginTop:15}]}>
              <Text style={{fontWeight:'bold'}}>Please Note: </Text>
              It can take up to 24 hours for your listing to be posted on all services.
            </Text>
          </View>
        </KeyboardHandler>
        <View style={styles.bottom}>
          <View style={styles.stretch}>
            <View style={styles.formField}>
              <Button onPress={() => {this.props.navigator.pop();}} style={[styles.actionButton, {flex:1, marginLeft:15}]} textStyle={styles.cancelButtonText}>
                CLOSE
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }
});
module.exports = ViewExternalListings;
