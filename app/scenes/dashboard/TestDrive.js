/**
 * TRED Test Drive Notes Layout
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
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
  StyleSheet,
  Linking,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var localStorage = require('../../services/localStorage.service.js');
var listingService = require('../../services/listing.service');
var userService = require('../../services/user.service');
var utils = require('../../services/utils');
var moment = require('moment-timezone');
var Icon = require('react-native-vector-icons/FontAwesome');
var KeyboardHandler = require('../../components/KeyboardHandler.js');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var MapView = require('react-native-maps');

import RNCalendarEvents from 'react-native-calendar-events';
const {NativeAppEventEmitter} = React;

if(Platform.OS === 'android'){
  var SendIntentAndroid = require('react-native-send-intent');
}

var TestDrive = React.createClass({
  getDefaultProps: function(){
    return {
      vin: null,
      test_drive_id: null,
    }
  },
  getInitialState: function(){
    return {
      isPast: false,
      isCurrent: false,
      test_drive_id: null,
      initialized: false,
      locationNotes: null,    
    }
  },
  componentWillMount: function(){
    if(Platform.OS !== 'android'){
      this.eventSuccessEmitter = NativeAppEventEmitter.addListener('eventSaveSuccess', (id) => {
        Alert.alert("Added to Your Calendar", "The event was successfully added to your calendar.", [
          {text: "Ok", onPress: () => {}}
        ]);
      });
      this.eventErrorEmitter = NativeAppEventEmitter.addListener('eventSaveError', (msg) => {
        Alert.alert("Uh Oh...", "Something went wrong. The event was not added to your calendar. Please try again.", [
          {text: "Ok", onPress: () => {}}
        ]);
      });
    }
  },
  componentWillUnmount: function(){
    if(Platform.OS !== 'android'){
      this.eventSuccessEmitter.remove();
      this.eventErrorEmitter.remove();
    }
  },
  componentDidMount: function(){
    if(this.props.test_drive_id){
      this.setState({
        test_drive_id: this.props.test_drive_id
      });
    }
    var component = this;
    this.loadTestDrive().then(function(){
      component.forceUpdate();
    });
  },
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  loadTestDrive: function(){
    var component = this;
    component.setState({
      initialized: false,
    });
    return listingService.get(this.props.vin).then(function(listing){
      var testDrives = listing.test_drives ? listing.test_drives : [];
      var testDrive = testDrives.filter(function(testDrive){
        return testDrive.id === component.props.test_drive_id;
      });
      testDrive = testDrive.length > 0 ? testDrive[0] : null;

      if(testDrive.status === 'confirmed'){
        var isCurrent = false;
        var isPast = false;
        if(testDrive.startTime){
          isCurrent = moment().isBetween(moment(testDrive.startTime), moment(testDrive.startTime).add(1, "hours"));  
          isPast = moment(testDrive.startTime).add(1, "hours").isBefore(moment()) ? isPast + 1: isPast;  
        }
      }

      component.setState({
        isCurrent: isCurrent,
        isPast: isPast,
        initialized: true,
        testDrive: testDrive,
        listing: listing,
      });

      setTimeout(function(){
        if( typeof component.refs.marker.showCallout === "function"){
          component.refs.marker.showCallout();
        }
      }, 500);

    });
  },
  onChecklist: function(){
    this.props.navigator.push({
      id: "TestDriveChecklist",
      name: "Test Drive Checklist",
      vin: this.props.vin,
      test_drive_id: this.props.test_drive_id,
    });
  },
  onReschedule: function(){
    var component = this;
    Alert.alert("Reschedule Test Drive", "We'll let the buyer know that you'd like new times. If you have any questions please contact us for help.", [
      {text: "Reschedule", onPress: () => {
          listingService.requestRescheduleTestDrive(component.props.vin, component.props.test_drive_id)
            .then(() => {
              component.props.navigator.replacePrevious({
                id: 'Listing',
                name: 'Listing',
                vin: component.props.vin, 
                initialTab: "testDrives",                
              });
              component.props.navigator.pop();
            });
        }
      },
      {text: "Cancel"},
      {text: "Contact Us", onPress: () => {
          component.props.navigator.push({
            id: 'Support',
            name: 'Support',
          });
        }
      },
    ]);
  },
  onGetDirections: function(){
    var addr = this.state.testDrive.locationAddress;
    if(Platform.OS !== 'android'){
      var url = 'http://maps.apple.com/?dirflg=d&daddr=' + encodeURIComponent(addr);
    } else {
      var url = "google.navigation:q=" + encodeURIComponent(addr) + "&mode=d";
    }
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
    });
  },
  onAddToCalendar: function(){
    var title =  "(TRED) " + this.state.listing.make + " " + this.state.listing.model + " Test Drive with " + this.state.testDrive.buyer_first_name;
    var addr = this.state.testDrive.locationAddress + " (" + this.state.testDrive.locationLandmark + ")";
    var notes = this.state.testDrive.locationNotes;
    var startTimeIOS = moment(this.state.testDrive.startTime).utc().format("YYYY-MM-DDTHH:mm:ss.sssUTC");
    var endTimeIOS = moment(this.state.testDrive.startTime).utc().add(1, 'hours').format("YYYY-MM-DDTHH:mm:ss.sssUTC");
    var startTimeAndroid = moment(this.state.testDrive.startTime).format("YYYY-MM-DD HH:mm:ss.sss");
    var endTimeAndroid = moment(this.state.testDrive.startTime).add(1, 'hours').format("YYYY-MM-DD HH:mm:ss.sss");
    if(Platform.OS === 'android'){
      SendIntentAndroid.addCalendarEvent({
        title: title,
        description: notes,
        location: addr,
        startDate: startTimeAndroid,
        endDate: endTimeAndroid,
        recurrence: ''
      });
    } else {
      RNCalendarEvents.authorizationStatus(({status}) => {
        if(status !== 'authorized'){
          RNCalendarEvents.authorizeEventStore(({status}) => {
            RNCalendarEvents.saveEvent(title, {
              location: addr,
              notes: notes || "",
              startDate: startTimeIOS,
              endDate: endTimeIOS,
              alarms: [{
                date: -120 
              }]
            });
          });
        } else {
          RNCalendarEvents.saveEvent(title, {
            location: addr,
            notes: notes || "",
            startDate: startTimeIOS,
            endDate: endTimeIOS,
            alarms: [{
              date: -120 
            }]
          });
        }
      });
    }
  },
  render: function() {
    var listing = this.state.listing;
    if(this.state.test_drive_id && this.state.testDrive){
      return (
        <View style={[styles.main, this.state.isPast ? {paddingBottom:0} : {paddingBottom:48}]}>
          <View style={[styles.content, {flex:1, paddingHorizontal:0, paddingBottom:0}]}>
            <Text style={styles.cameraTitle}>TEST DRIVE DETAILS</Text>
            <Text style={styles.subText}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)}</Text>

            <View style={[styles.scroll, {flex:1}]}>
              {this.state.testDrive ?
                <View style={{flex:1}}>
                  <View style={{marginBottom:10}}>
                    {this.state.isPast ?
                      <Text style={[styles.testDriveLarge]}>You met with {this.state.testDrive.buyer_first_name ? utils.capitalizeAllWords(this.state.testDrive.buyer_first_name) : 'Buyer'} </Text>
                    :
                      <Text style={[styles.testDriveLarge]}>You&apos;re meeting {this.state.testDrive.buyer_first_name ? utils.capitalizeAllWords(this.state.testDrive.buyer_first_name) : 'Buyer'} </Text>
                    }
                    <Text style={[styles.testDriveLarge,{fontWeight:"bold"}]}>{moment(this.state.testDrive.startTime).tz(moment.tz.guess()).format('dddd MMM Do, YYYY h:mma z')}</Text>
                    <Text style={[styles.subText, {marginTop:0, marginBottom:2}]}>{this.state.testDrive.locationAddress}</Text>
                    {/*
                    <View>
                      <Text style={[styles.subSubText, {marginTop:0, marginBottom:0}]}>Note to {this.state.testDrive.buyer_first_name ? utils.capitalizeAllWords(this.state.testDrive.buyer_first_name) : 'Buyer'}: {this.state.testDrive.locationNotes}</Text>
                    </View>
                    */}
                    <View style={{flex:1, flexDirection: "row", alignItems: "stretch", justifyContent:"center", marginBottom:10}}>
                      <TouchableOpacity onPress={this.onGetDirections}>           
                        <Text style={[styles.actionLinkSmall, {marginHorizontal:15, marginTop:3, textAlign:'center', fontWeight: "bold"}]}>
                          Get Directions
                        </Text>
                      </TouchableOpacity>
                      { !this.state.isPast ?
                        <TouchableOpacity onPress={this.onAddToCalendar}>
                          <Text style={[styles.actionLinkSmall, {marginHorizontal:15, marginTop:3, textAlign:'center', fontWeight: "bold"}]}>
                            Add To My Calendar
                          </Text>
                        </TouchableOpacity>
                      : 
                        null
                      }
                    </View>
                    <View style={{flex:1, flexDirection: "row", alignItems: "stretch", justifyContent:"center", marginBottom:10}}>
                      <TouchableOpacity onPress={this.onChecklist}>           
                        <Icon name="exclamation-circle" size={30} color={"#FAD46B"} style={[{paddingRight:0}, Platform.OS === 'android' ? {marginTop:4} : {marginTop:2}]} />
                      </TouchableOpacity>                      
                      <TouchableOpacity onPress={this.onChecklist}>           
                        <Text style={[styles.actionLink, {color:"#FAD46B", marginHorizontal:15, marginTop:5, textAlign:'center', fontWeight:"bold"}]}>
                          Read the Prep Checklist
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[{flex:1}]}>
                      <MapView 
                          style={{flex:1}}
                          region={{
                            latitude: this.state.testDrive.locationLatitude,
                            longitude: this.state.testDrive.locationLongitude,
                            latitudeDelta: .005,
                            longitudeDelta: .005,                          
                          }}>
                        <MapView.Marker 
                          ref={'marker'}
                          flat={false}
                          coordinate={{latitude: this.state.testDrive.locationLatitude, longitude: this.state.testDrive.locationLongitude}}
                          title={this.state.testDrive.locationLandmark}
                          description={this.state.testDrive.locationAddress} />
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
          {!this.state.isPast ?
            <View style={styles.bottom}>
              <View style={styles.stretch}>
                { this.state.isCurrent ?
                  <View style={styles.formField}>
                    <Button onPress={this.onChecklist} style={[styles.secondaryButton]} textStyle={styles.buttonTextSmall}>
                      CHECKLIST
                    </Button>
                  </View>                
                :
                  <View style={styles.formField}>
                    <Button style={[styles.actionButton]} textStyle={styles.actionButtonText} onPress={this.onReschedule}>
                      RESCHEDULE
                    </Button>
                  </View>
                }
              </View>
            </View> : null
          }
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
module.exports = TestDrive;
