/**
 * TRED Test Drive Checklist Layout
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
  TextInput,
  StyleSheet,
  ListView,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var localStorage = require('../../services/localStorage.service.js');
var listingService = require('../../services/listing.service');
var userService = require('../../services/user.service');
var permissions = require('../../services/permission.service');
var constants = require('../../services/constant.service');
var utils = require('../../services/utils');
var moment = require('moment-timezone');
var Icon = require('react-native-vector-icons/FontAwesome');
var KeyboardHandler = require('../../components/KeyboardHandler.js');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var TestDriveChecklist = React.createClass({
  getDefaultProps: function(){
    return {
      vin: null,
      test_drive_id: null,
      standAlone: false,
    }
  },
  getInitialState: function(){
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      return true;
    }});
    return {
      isPast: false,
      isCurrent: false,
      test_drive_id: null,
      initialized: false,
      locationNotes: null,
      buyerPaymentType: "All Cash",
      sellerhasLoan: false,
      fraudWarning: null,
      dataSource: ds.cloneWithRows([]),
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
    if(this.props.standAlone){
      permissions.setAllowed(constants.PERMISSION_NAVIGATE, false);      
    }
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
        var isPast = false;
        var isCurrent = false;
        if(testDrive.startTime){
          isCurrent = moment().isBetween(moment(testDrive.startTime), moment(testDrive.startTime).add(1, "hours"));  
          isPast = moment(testDrive.startTime).add(1, "hours").isBefore(moment());  
        }
      }
      var buyer_payment_type = testDrive.buyer_payment_type ? testDrive.buyer_payment_type : "All Cash"
      var has_loan = listing.consignment_form && listing.consignment_form.car_loan ? listing.consignment_form.car_loan : false;

      localStorage.getObject(component.props.test_drive_id).then(function(_checklist){
        var checklist = null;
        var fraudWarning = null;
        if(buyer_payment_type === "All Cash" && !has_loan){
          fraudWarning = <Text style={styles.checklistText}>
                          <Text style={{fontWeight: 'bold'}}>FRAUD WARNING:</Text> don’t accept payment directly from your buyer and don’t release your title or vehicle until we’ve sent you a money transfer confirmation. Once we’ve processed payment, we’ll provide temporary permitting that will allow your buyer to drive away without your license plates. Otherwise, you’ll be paying parking tickets on a car your don’t have - or worse!
                        </Text>;
          checklist = [
            {name: "Bring all sets of keys."},
            {name: "Bring your title document."},
            {name: "Bring your car's servicing records."},
            {name: "Bring a screwdriver or wrench (appropriate tool) to remove your license plates if need be."},
            {name: "Bring a bag in case you need to remove all your belongings."},
            {name: "Be prepared to arrange transportation home from the test drive location (Uber, a friend, etc.)."},
            {name: "Before, during or after your test drive, when you’re ready, negotiate with your buyer until you’ve accepted an offer price through our app - you’ll be notified when they make an offer."}
          ];

        } else if(buyer_payment_type === "All Cash" && has_loan) {
          fraudWarning = <Text style={styles.checklistText}>
                          <Text style={{fontWeight: 'bold'}}>FRAUD WARNING:</Text> don’t accept payment directly from your buyer and don’t release your vehicle until we’ve sent you a money transfer confirmation. Once we’ve processed payment, we’ll repay your loan and provide temporary permitting that will allow your buyer to drive away without your license plates. Otherwise, you’ll be covering payments and parking tickets on a car your don’t have!
                        </Text>;
          checklist = [
            {name:"Bring all sets of keys."},
            {name:"Bring your odometer disclosure document."},
            {name:"Bring your car's servicing records."},
            {name:"Bring a screwdriver or wrench (appropriate tool) to remove your license plates if need be."},
            {name:"Bring a bag in case you need to remove all your belongings."},
            {name:"Be prepared to arrange transportation home from the test drive location (Uber, a friend, etc.)."},
            {name:"Before, during or after your test drive, when you’re ready, negotiate with your buyer until you’ve accepted an offer price through our app - you’ll be notified when they make an offer."}
          ];
        } else if(buyer_payment_type === "TRED Hassle-Free Financing" && !has_loan){
          fraudWarning = <Text style={styles.checklistText}>
                          <Text style={{fontWeight: 'bold'}}>FRAUD WARNING:</Text> don’t accept payment directly from your buyer and don’t release your title or vehicle until we have sent you a money transfer confirmation. Once we’ve processed payment, we’ll provide temporary permitting that will allow your buyer to drive away without your license plates. Otherwise, you’ll be paying parking tickets on a car your don’t have - or worse!
                        </Text>;
          checklist = [
            {name: "Bring all sets of keys."},
            {name: "Bring your title document."},
            {name: "Bring your car's servicing records."},
            {name: "Bring a screwdriver or wrench (appropriate tool) to remove your license plates if need be."},
            {name: "Bring a bag in case you need to remove all your belongings."},
            {name: "Be prepared to arrange transportation home from the test drive location (Uber, a friend, etc.)."},
            {name: "Before, during or after your test drive, when you’re ready, negotiate with your buyer until you’ve accepted an offer price through our app - you’ll be notified when they make an offer."}
          ];
        } else if(buyer_payment_type === "TRED Hassle-Free Financing" && has_loan) {
          fraudWarning = <Text style={styles.checklistText}>
                          <Text style={{fontWeight: 'bold'}}>FRAUD WARNING:</Text> don’t accept payment directly from your buyer and don’t release your vehicle until we have sent you a money transfer confirmation. Once we’ve processed payment, we’ll repay your loan and provide temporary permitting that will allow your buyer to drive away without your license plates. Otherwise, you’ll be covering payments and parking tickets on a car your don’t have!
                        </Text>;
          checklist = [
            {name:"Bring all sets of keys."},
            {name:"Bring your odometer disclosure document."},
            {name:"Bring your car's servicing records."},
            {name:"Bring a screwdriver or wrench (appropriate tool) to remove your license plates if need be."},
            {name:"Bring a bag in case you need to remove all your belongings."},
            {name:"Be prepared to arrange transportation home from the test drive location (Uber, a friend, etc.)."},
            {name:"Before, during or after your test drive, when you’re ready, negotiate with your buyer until you’ve accepted an offer price through our app - you’ll be notified when they make an offer."}
          ];
        } else if(buyer_payment_type === "My Own Bank" && !has_loan){
          fraudWarning = <Text style={styles.checklistText}>
                          <Text style={{fontWeight: 'bold'}}>FRAUD WARNING:</Text> don’t accept payment directly from your buyer and don’t release your title or vehicle until we have sent you a money transfer confirmation. Once we’ve processed payment, we’ll provide temporary permitting that will allow your buyer to drive away without your license plates. Otherwise, you’ll be paying parking tickets on a car your don’t have - or worse!
                        </Text>;
          checklist = [
            {name: "Bring all sets of keys."},
            {name: "Bring your title document."},
            {name: "Bring your car's servicing records."},
            {name: "Bring a screwdriver or wrench (appropriate tool) to remove your license plates if need be."},
            {name: "Bring a bag in case you need to remove all your belongings."},
            {name: "Be prepared to arrange transportation home from the test drive location (Uber, a friend, etc.)."},
            {name: "Before, during or after your test drive, when you’re ready, negotiate with your buyer until you’ve accepted an offer price through our app - you’ll be notified when they make an offer."}
          ];
        } else if(buyer_payment_type === "My Own Bank" && has_loan) {
          fraudWarning = <Text style={styles.checklistText}>
                          <Text style={{fontWeight: 'bold'}}>FRAUD WARNING:</Text> don’t accept payment directly from your buyer and don’t release your vehicle until we have sent you a money transfer confirmation. Once we’ve processed payment, we’ll repay your loan and provide temporary permitting that will allow your buyer to drive away without your license plates. Otherwise, you’ll be covering payments and parking tickets on a car your don’t have!
                        </Text>;
          checklist = [
            {name:"Bring all sets of keys."},
            {name:"Bring your odometer disclosure document."},
            {name:"Bring your car's servicing records."},
            {name:"Bring a screwdriver or wrench (appropriate tool) to remove your license plates if need be."},
            {name:"Bring a bag in case you need to remove all your belongings."},
            {name:"Be prepared to arrange transportation home from the test drive location (Uber, a friend, etc.)."},
            {name:"Before, during or after your test drive, when you’re ready, negotiate with your buyer until you’ve accepted an offer price through our app - you’ll be notified when they make an offer."}
          ];
        } else {
          fraudWarning = <Text style={styles.checklistText}>
                          <Text style={{fontWeight: 'bold'}}>FRAUD WARNING:</Text> don’t accept payment directly from your buyer and don’t release your title or vehicle until we’ve sent you a money transfer confirmation. Once we’ve processed payment, we’ll provide temporary permitting that will allow your buyer to drive away without your license plates. Otherwise, you’ll be paying parking tickets on a car your don’t have - or worse!
                        </Text>;        
          checklist = [
            {name: "Bring all sets of keys."},
            {name: "Bring your title document."},
            {name: "Bring your car's servicing records."},
            {name: "Bring a screwdriver or wrench (appropriate tool) to remove your license plates if need be."},
            {name: "Bring a bag in case you need to remove all your belongings."},
            {name: "Be prepared to arrange transportation home from the test drive location (Uber, a friend, etc.)."},
            {name: "Before, during or after your test drive, when you’re ready, negotiate with your buyer until you’ve accepted an offer price through our app - you’ll be notified when they make an offer."}
          ];
        }
        checklist = _checklist ? _checklist : checklist;

        component.setState({
          isPast: isPast,
          isCurrent: isCurrent,
          initialized: true,
          testDrive: testDrive,
          buyerPaymentType: buyer_payment_type, 
          sellerHasLoan: has_loan,
          fraudWarning: fraudWarning,
          listing: listing,
          checklist: checklist,
          dataSource: component.state.dataSource.cloneWithRows(checklist),
        });
      });
    });
  },
  onContact: function(){
    this.props.navigator.push({
      id: "Support",
      name: "Support",
    });
  },
  onClose: function(){
    if(this.props.standAlone){
      permissions.setAllowed(constants.PERMISSION_NAVIGATE, true);      
      this.props.navigator.resetTo({
        id: "Listing",
        name: "Listing",
        vin: this.props.vin, 
        initialTab: "testDrives",
      });
    } else {
      this.props.navigator.pop();
    }
  },
  pressRow: function(rowID){
    var newArray = this.state.checklist.slice();
    if(newArray[rowID].isSelected){
      newArray[rowID].isSelected = false;
    } else {
      newArray[rowID].isSelected = true;
    }
    localStorage.setObject(this.props.test_drive_id, newArray);
    this.setState({
      checklist: newArray,
      dataSource: this.state.dataSource.cloneWithRows(newArray),
    });    
  },
  render: function() {
    var listing = this.state.listing;
    if(this.state.test_drive_id && this.state.testDrive){
      return (
        <View style={[styles.main, styles.hiwWarning, Platform.OS === 'android' ? {marginTop:-6} : {}, {paddingBottom:0}]}>
          <KeyboardHandler ref='kh' offset={110}>
            <View style={[styles.hiwTop, styles.hiwTopWarning]}>
              <Text style={[styles.hiwHeading, {marginTop:2}]}>PLEASE READ CAREFULLY!</Text>
            </View>        
            <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
             <Text style={styles.cameraTitle}>TEST DRIVE PREP CHECKLIST</Text>
             <Text style={styles.subText}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)}</Text>
              <Text style={[styles.subText,{fontWeight:"bold"}]}>{moment(this.state.testDrive.startTime).tz(moment.tz.guess()).format('dddd MMM Do, YYYY h:mma z')}</Text>
              <Text style={[styles.subText,{fontWeight:"bold", marginBottom:5}]}>meeting with {this.state.testDrive.buyer_first_name}</Text>

             <View style={[styles.scroll, {flex:1}]}>
                {this.state.testDrive ?
                  <View style={{flex:1}}>
                    <View style={[styles.hiwTop, styles.hiwWarning]}>
                      { this.state.fraudWarning }
                    </View>        
                    <ListView
                      style={{marginTop:10, marginBottom:15}}
                      dataSource={this.state.dataSource}
                      renderRow={(rowData, sectionID, rowID) => 
                        <TouchableHighlight onPress={() => this.pressRow(rowID)}>
                          <View style={styles.listViewBackground}>
                            <View style={styles.listViewRow, {flexDirection: "row", alignItems:'center', paddingVertical:10, paddingHorizontal:15}}>
                              { rowData.isSelected ?
                                <Icon name="check-square-o" size={36} color={"#3EB5AC"} style={[{paddingRight:15}]} />
                              :
                                <Icon name="square-o" size={36} color={"#364347"} style={[{paddingRight:22}]} />
                              }
                              <Text style={[styles.checklistViewText]}>
                                {rowData.name}
                              </Text>
                            </View>
                            <View style={styles.separator} />
                          </View>
                        </TouchableHighlight>
                      } />
                    <View>
                      <Text style={styles.checklistText}>
                        <Text style={{fontWeight: 'bold'}}>NOTE:</Text> if you don’t agree on a price during the test drive or if your buyer pays with financing, you’ll have to arrange a second meeting to transfer possession of your vehicle.
                      </Text>
                    </View>              
                  </View>
                :
                  <View>
                    <Text style={styles.listViewError}>LOADING CHECKLIST...</Text>
                  </View>              
                }
              </View>
            </View>
          </KeyboardHandler>
          <View style={styles.bottom, styles.hiwTopWarning}>
            <View style={styles.stretch}>
              {this.props.standAlone ?
                <View style={styles.formFieldHorizontal}>
                  <Button style={[styles.darkButton, styles.left, {flex:1, marginLeft:15}]} textStyle={styles.buttonTextSmall} onPress={this.onContact}>
                    CONTACT US
                  </Button>
                  <Button style={[styles.darkButton, styles.right, {flex:1, marginRight:15}]} textStyle={styles.buttonTextSmall} onPress={this.onClose}>
                    GOT IT!
                  </Button>
                </View>
              :
                <View style={styles.formField}>
                  <Button style={[styles.darkButton]} textStyle={styles.darkButtonText} onPress={this.onContact}>
                    CONTACT US FOR HELP
                  </Button>
                </View>
              }
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
module.exports = TestDriveChecklist;
