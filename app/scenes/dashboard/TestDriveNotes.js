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
  TextInput,
  StyleSheet
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var localStorage = require('../../services/localStorage.service.js');
var listingService = require('../../services/listing.service');
var userService = require('../../services/user.service');
var utils = require('../../services/utils');
var KeyboardHandler = require('../../components/KeyboardHandler.js');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var TestDriveNotes = React.createClass({
  getDefaultProps: function(){
    return {
      vin: null,
      test_drive_id: null,
    }
  },
  getInitialState: function(){
    return {
      test_drive_id: null,
      initialized: false,
      locationNotes: null,    
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

      component.setState({
        initialized: true,
        testDrive: testDrive,
        listing: listing,
      });
    });
  },
  onConfirm: function(){
    var component = this;
    localStorage.wip.test_drive.get().then(function(test_drive_wip){
      if(component.state.listing &&
         component.state.listing.vin &&
         component.state.testDrive &&
         component.state.testDrive.id &&
         test_drive_wip &&
         test_drive_wip.selectedTimeIndex &&
         test_drive_wip.locationAddress &&
         test_drive_wip.locationLatitude &&
         test_drive_wip.locationLongitude &&
         test_drive_wip.locationLandmark){
        var vin = component.state.listing.vin;
        var test_drive_id = component.state.testDrive.id;
        var chosen_time_index = test_drive_wip.selectedTimeIndex;
        var data = {
          locationAddress: test_drive_wip.locationAddress,
          locationLatitude: test_drive_wip.locationLatitude,
          locationLongitude: test_drive_wip.locationLongitude,
          locationLandmark: test_drive_wip.locationLandmark,
          locationNotes: component.state.locationNotes,
        }
        listingService.confirmTestDrive(vin, test_drive_id, chosen_time_index, data).then(function(test_drive){
          //Success
          localStorage.wip.test_drive.clear();
          Alert.alert("Test Drive Confirmed", "You have confirmed the time and place for this test drive and we have notified the buyer. Please review  the test drive prep checklist and if you have any questions, contact us.", [
            {text: "View Prep Checklist", onPress: () => {
                component.props.navigator.resetTo({
                  id: "TestDriveChecklist",
                  name: "Test Drive Checklist",
                  vin: vin,
                  test_drive_id: test_drive_id,
                  standAlone: true
                });
              }
            },
            {text: "Contact Us", onPress: () => {
                component.props.navigator.push({
                  id: 'Support',
                  name: 'Support',
                });
              }
            },
          ]);          
        }, function(){
          //Error
          Alert.alert("Uh Oh...", "Somthing went wrong confirming this test drive. Please contact us for help.", [
            {text: "OK"},
            {text: "Contact Us", onPress: () => {
                component.props.navigator.push({
                  id: 'Support',
                  name: 'Support',
                });
              }
            },
          ]);          
        });
      } else {
        Alert.alert("Uh Oh...", "Somthing went wrong confirming this test drive. Please contact us for help.", [
          {text: "OK"},
          {text: "Contact Us", onPress: () => {
              component.props.navigator.push({
                id: 'Support',
                name: 'Support',
              });
            }
          },
        ]);
      }
    });
  },
  render: function() {
    var listing = this.state.listing;
    if(this.state.test_drive_id && this.state.testDrive){
      return (
        <View style={[styles.main, {paddingBottom:48}]}>
          <KeyboardHandler ref='kh' offset={110}>
            <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
              <Text style={styles.cameraTitle}>CONFIRM TEST DRIVE - NOTES</Text>
              <Text style={[styles.subText, {marginBottom:10}]}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)}</Text>

              <Text  style={[styles.subText, {marginTop:0}]}>Along with your confirmation, send {this.state.testDrive.buyer_first_name ? utils.capitalizeAllWords(this.state.testDrive.buyer_first_name) : 'Buyer'} any special instructions you&apos;d like to pass along.</Text>

              <View style={[styles.scroll, {flex:1}]}>
                {this.state.testDrive ?
                  <View style={[{flex:1}]}>
                    {this.state.testDrive.proposedTimes ?
                      <View>
                        <TextInput
                          ref="locationNotes"
                          placeholder="Ex: I’ll be in the north parking lot."
                          placeholderTextColor="#aaaaaa"
                          textAlign="left"
                          multiline={true}
                          selectTextOnFocus={true}
                          numberOfLines={4}
                          blurOnSubmit={true}
                          style={[styles.textInput, styles.larger]}
                          onChangeText={(locationNotes) => this.setState({locationNotes})}
                          value={this.state.locationNotes}
                          onFocus={()=>this.refs['kh'].inputFocused(this,'locationNotes')} />
                      </View>
                    :
                      <View>
                        <Text style={styles.listViewError}>NO TEST DRIVES DATES FOUND. PLEASE CONTACT US FOR HELP.</Text>
                      </View>                  
                    }
                  </View>
                :
                  <View>
                    <Text style={styles.listViewError}>LOADING TEST DRIVE...</Text>
                  </View>              
                }
              </View>
            </View>
          </KeyboardHandler>
          <View style={styles.bottom}>
            <View style={styles.stretch}>
              <View style={styles.formField}>
                <Button style={[styles.actionButton]} textStyle={styles.actionButtonText} onPress={this.onConfirm}>
                  SEND CONFIRMATION
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
module.exports = TestDriveNotes;
