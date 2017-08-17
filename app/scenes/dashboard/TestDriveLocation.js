/**
 * TRED Test Drive Location Layout
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
  Alert,
  TouchableHighlight,
  StyleSheet,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var listingService = require('../../services/listing.service');
var userService = require('../../services/user.service');
var localStorage = require('../../services/localStorage.service.js');
var utils = require('../../services/utils');
var moment = require('moment-timezone');
var Icon = require('react-native-vector-icons/FontAwesome');
var {GooglePlacesAutocomplete} = require('react-native-google-places-autocomplete');
var config = require('../../../config');
const Qs = require('react-native-google-places-autocomplete/node_modules/qs');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var MapView = require('react-native-maps');

var TestDriveLocation = React.createClass({
  getDefaultProps: function(){
    return {
      vin: null,
      test_drive_id: null,
    }
  },
  getInitialState: function(){
    return {
      user: null,
      vin: null,
      test_drive_id: null,
      initialized: false,
      locationAddress: null,
      locationLandmark: null,
      locationLatitude: null,
      locationLongitude: null,
      homePlace: null,
      region: null,
      annotations:[],
      disabled: true,   
    }
  },
  componentDidMount: function(){
    if(this.props.test_drive_id){
      this.setState({
        test_drive_id: this.props.test_drive_id
      });
    }
    var component = this;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        component.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: .005,
            longitudeDelta: .005,
          }
        });
      },
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.loadTestDrive().then(function(){
      component.forceUpdate();
    });
  },
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  loadTestDrive: function(){
    var component = this;
    var listing = null;
    return listingService.get(this.props.vin).then(function(_listing){
      listing = _listing;
      return userService.get();
    }).then(function(user){
      var testDrives = listing.test_drives ? listing.test_drives : [];
      var testDrive = testDrives.filter(function(testDrive){
        return testDrive.id === component.props.test_drive_id;
      });
      testDrive = testDrive.length > 0 ? testDrive[0] : null;

      var homePlace = null;
      if(user.mailing_street &&
         user.mailing_city && 
         user.mailing_state &&
         user.mailing_state){
        var homeGoecodeParams = user.mailing_street + "," + user.mailing_city + "," + user.mailing_state + "," + user.mailing_zip;
        homePlace = {description:  "Home (" + user.mailing_street + ", " + user.mailing_city + ", " + user.mailing_state + ")", home: true, address: homeGoecodeParams };
      }
      component.setState({
        user: user,
        homePlace: homePlace,
        testDrive: testDrive,
        listing: listing,
        initialized: true,
      });
    });
  },
  onConfirm: function(){
    var component = this;    
    localStorage.wip.test_drive.upsert({locationAddress: this.state.locationAddress, locationLatitude: this.state.locationLatitude, locationLongitude: this.state.locationLongitude, locationLandmark: this.state.locationLandmark}).then(function(){
      component.props.navigator.push({
        id: "TestDriveNotes",
        name: "Test Drive Notes",
        vin: component.props.vin,
        test_drive_id: component.props.test_drive_id,
      });
    });
  },
  setLocation: function(details){
    if(details &&
       details.geometry &&
       details.geometry.location &&
       details.geometry.location.lat && 
       details.geometry.location.lng && 
       details.formatted_address)
    {                          
      var region = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: .005,
        longitudeDelta: .005,                          
      };
      var annotation = {
        title: details.name ? details.name : 'Home',
        subtitle: details.formatted_address,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        animateDrop: true,
      }
      this.setState({
        region: region,
        annotations: [annotation],
        locationAddress: details.formatted_address,
        locationLandmark: details.name ? details.name : "Home",
        locationLatitude: details.geometry.location.lat,
        locationLongitude: details.geometry.location.lng,
        disabled: false,
      });
      var component = this;
      if( typeof component.refs.marker.hideCallout === "function"){
        component.refs.marker.hideCallout();
      }

      setTimeout(function(){
        if( typeof component.refs.marker.showCallout === "function"){
          component.refs.marker.showCallout();
        }
      }, 500);
    }
  },
  homeAddress: function(homePlace){
    var component = this;
    var homeDetails = null;
    var request = new XMLHttpRequest();
    request.timeout = 15000;
    request.onreadystatechange = () => {
      if (request.readyState !== 4) {
        return null;
      }
      if (request.status === 200) {
        var responseJSON = JSON.parse(request.responseText);
        if (responseJSON.status === 'OK') {
          if (component.isMounted()) {
            homeDetails = responseJSON.results;
            component.setLocation(homeDetails[0]);                        
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
    request.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?' + Qs.stringify({
      key: config.google_places_key,
      address: homePlace.address,
      language: 'en',
    }));
    request.send();
  },
  render: function() {
    var listing = this.state.listing;
    if(this.state.testDrive){
      return (
        <View style={[styles.main, {paddingBottom:48}]} >
          <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
            <Text onPress={() => { this.refs.search.triggerBlur()}} style={styles.cameraTitle}>CONFIRM TEST DRIVE - LOCATION</Text>
            <Text onPress={() => { this.refs.search.triggerBlur()}} style={[styles.subText, {marginBottom:10}]}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)}</Text>
            <Text onPress={() => { this.refs.search.triggerBlur()}} style={[styles.subText, {marginTop:0}]}>Choose an address to meet {this.state.testDrive.buyer_first_name ? utils.capitalizeAllWords(this.state.testDrive.buyer_first_name) : 'Buyer'}. We recommend a place with a parking lot.</Text>
            <View style={[styles.scroll, {flex:1}]}>
              {this.state.testDrive ?
                <View style={[{flex:1}, styles.listViewBackground]}>
                  <View>
                    <GooglePlacesAutocomplete
                      ref={"search"}
                      placeholder='Search For a Test Drive Location'
                      minLength={3} // minimum length of text to search
                      autoFocus={false}
                      fetchDetails={true}
                      onPress={(data, details = null) => {
                        this.setState({
                          disabled: true,
                        });

                        if(details.home){
                          //call google api to get details for home address
                          this.homeAddress(details);
                        } else {
                          this.setLocation(details);                        
                        }
                      }}
                      getDefaultValue={() => {
                        return '';
                      }}
                      query={{
                        key: config.google_places_key,
                        language: 'en',
                      }}
                      styles={{
                        listView: {
                          height:225,
                        },
                        textInputContainer: {
                          backgroundColor: '#009DCD',
                        },
                        description: {
                          fontWeight: 'bold',
                        },
                        predefinedPlacesDescription: {
                          color: '#02BAF2',
                        },
                      }}
                      currentLocation={true}
                      currentLocationLabel="Places Near Current Location"
                      enablePoweredByContainer={false}
                      nearbyPlacesAPI='GooglePlacesSearch'
                      GoogleReverseGeocodingQuery={{
                      }}
                      GooglePlacesSearchQuery={{
                        rankby: 'distance',
                        types: 'cafe|car_wash|church|gas_station|home_goods_store|shopping_mall'
                      }}
                      predefinedPlaces={[this.state.homePlace]}
                    />
                  </View>
                  <View style={[{flex:1}, styles.listViewBackground]}>
                      <MapView 
                          ref={"map"}
                          style={{flex:1}}
                          region={this.state.region}>
                          {this.state.locationLatitude && this.state.locationLongitude ?
                            <MapView.Marker 
                              ref={"marker"}
                              flat={false}
                              showsUserLocation={true}
                              coordinate={{latitude: this.state.locationLatitude, longitude: this.state.locationLongitude}}
                              title={this.state.locationLandmark}
                              description={this.state.locationAddress} />
                          :
                            null
                          }
                      </MapView>
                  </View>
                </View>
              :
                <View>
                  <Text style={styles.listViewError}>LOADING TEST DRIVE...</Text>
                </View>              
              }
            </View>
          </View>
          <View style={styles.bottom}>
            <View style={styles.stretch}>
              <View style={styles.formField}>
                <Button style={[styles.actionButton]} textStyle={styles.actionButtonText} onPress={this.onConfirm} isDisabled={this.state.disabled}>
                  CONTINUE
                </Button>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{flex:1}}>
          <Text style={[styles.pText, {marginTop:15, textAlign:'center'}]}>TEST DRIVE NOT FOUND! PLEASE CONTACT US FOR HELP.</Text>
        </View>
      );      
    }
  }
});
module.exports = TestDriveLocation;
