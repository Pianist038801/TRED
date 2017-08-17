/**
 * TRED Test Drive Select Time Layout
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
  ListView,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableHighlight,
  StyleSheet
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var listingService = require('../../services/listing.service');
var localStorage = require('../../services/localStorage.service.js');
var utils = require('../../services/utils');
var moment = require('moment-timezone');
var Icon = require('react-native-vector-icons/FontAwesome');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var TestDriveTime = React.createClass({
  getDefaultProps: function(){
    return {
      vin: null,
      test_drive_id: null,
    }
  },
  getInitialState: function(){
    var datesDS = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      return true;
    }});
    return {
      test_drive_id: null,
      datesDataSource: datesDS.cloneWithRows([]),  
      initialized: false,    
      isRefreshing: false,
      times: null,
      disabled: true,
      selectedIndex: null,
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
    localStorage.wip.test_drive.clear();
    var component = this;
    component.setState({
      isRefreshing: true,
      initialized: false,
      datesDataSource: component.state.datesDataSource.cloneWithRows([])
    });
    return listingService.get(this.props.vin).then(function(listing){
      var testDrives = listing.test_drives ? listing.test_drives : [];
      var testDrive = testDrives.filter(function(testDrive){
        return testDrive.id === component.props.test_drive_id;
      });
      testDrive = testDrive.length > 0 ? testDrive[0] : null;
      var arrTimes = [];
      if(testDrive && testDrive.proposedTimes){
        arrTimes = testDrive.proposedTimes;
        var disabled = true;
        for(var i in arrTimes){
          if(arrTimes[i].start && moment(arrTimes[i].start).isBefore(moment())){
            arrTimes[i].selectable = false;
            arrTimes[i].isSelected = false;
          } else {
            arrTimes[i].selectable = true;            
          }
          if(component.state.selectedIndex && component.state.selectedIndex === i){
            arrTimes[i].isSelected = true;
            if(arrTimes[i].selectable){
              disabled = false;
            }
          } else {
            arrTimes[i].isSelected = false;
          }
        }
      }
      component.setState({
        isRefreshing: false,
        initialized: true,
        testDrive: testDrive,
        listing: listing,
        times: arrTimes,
        datesDataSource: component.state.datesDataSource.cloneWithRows(arrTimes)
      });
    });
  },
  pressRow: function(rowID){
    var arrTimes = this.state.times.slice();
    for(var i in arrTimes){
      arrTimes[i].isSelected = false;
      if(arrTimes[i].start && moment(arrTimes[i].start).isBefore(moment())){
        arrTimes[i].selectable = false;
      } else {
        arrTimes[i].selectable = true;            
      }
    }
    var disabled = false;
    if(arrTimes[rowID].selectable){
      arrTimes[rowID].isSelected = true;
      var selectedIndex = rowID;
    } else {
      disabled = true;
    }
    this.setState({
      selectedIndex: selectedIndex,
      times: arrTimes,
      disabled: disabled,
      datesDataSource: this.state.datesDataSource.cloneWithRows(arrTimes),
    });
  },
  onReschedule: function(e){
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
  onConfirm: function(e){
    var component = this;
    localStorage.wip.test_drive.upsert({selectedTimeIndex: this.state.selectedIndex}).then(function(){
      component.props.navigator.push({
        id: "TestDriveLocation",
        name: "Test Drive Location",
        vin: component.props.vin,
        test_drive_id: component.props.test_drive_id,
      });      
    });
  },
  render: function() {
    var listing = this.state.listing;
    if(this.state.test_drive_id && this.state.testDrive){
      return (
        <View style={[styles.main, {paddingBottom:48}]}>
          <ScrollView style={[styles.scroll]}>
            <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
              <Text style={styles.cameraTitle}>CONFIRM TEST DRIVE - TIME</Text>
              <Text style={[styles.subText, {marginBottom:10}]}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)}</Text>
              <Text  style={[styles.subText, {marginTop:0}]}>{this.state.testDrive.buyer_first_name ? utils.capitalizeAllWords(this.state.testDrive.buyer_first_name) : 'Buyer'} has proposed the following times to test drive. Please select one that works for you.</Text>
              <View style={{flex:1}}>
                {this.state.testDrive ?
                  <View style={[{flex:1}]}>
                    {this.state.testDrive.proposedTimes ?
                      <View>
                        <ListView
                          style={[{flex:.5}, styles.listViewBackground]}                        
                          dataSource={this.state.datesDataSource}
                          renderRow={(rowData, sectionID, rowID) => 
                            { 
                              return <TouchableHighlight onPress={() => this.pressRow(rowID)}>
                                <View>
                                  <View style={[styles.listViewRow, {justifyContent: 'flex-start'}]}>
                                    <Icon name={'calendar'} size={32} color={'#02BAF2'} style={[{paddingRight:15}, Platform.OS === 'android' ? {marginTop:9} : {marginTop:0}]} />
                                    <Text style={rowData.selectable ? styles.offerListViewText : styles.offerListViewTextDisabled}>
                                      {moment(rowData.start).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z') + '\n'}
                                      {rowID === '0' ?
                                        <Text style={rowData.selectable ? styles.trimListViewText : styles.trimListViewTextDisabled}>Preferred Time</Text> : null
                                      }
                                      {rowID === '1' ?
                                        <Text style={rowData.selectable ? styles.trimListViewText : styles.trimListViewTextDisabled}>First Alternate Time</Text> : null
                                      }
                                      {rowID === '2' ?
                                        <Text style={rowData.selectable ? styles.trimListViewText : styles.trimListViewTextDisabled}>Second Alternate Time</Text> : null
                                      }
                                    </Text>
                                    {Platform.OS === 'android' ? 
                                      <Image 
                                        source={require('../../../images/check-android.png')}
                                        style={[styles.listViewCheck, rowData.isSelected ? {opacity:1} : {opacity:0}]} />
                                    :
                                      <Image 
                                        source={require('../../../images/check-ios.png')}
                                        style={[styles.listViewCheck, rowData.isSelected ? {opacity:1} : {opacity:0}]} />
                                    }
                                  </View>
                                  <View style={styles.separator} />
                                </View>
                              </TouchableHighlight>;
                          }
                        } />
                        <Text  style={[styles.subText, {marginTop:25}]}>If none of these times work, ask {this.state.testDrive.buyer_first_name ? utils.capitalizeAllWords(this.state.testDrive.buyer_first_name) : 'Buyer'} to propose some new times. Warning: this may result in losing this buyer’s interest.</Text>
                        <View style={styles.stretch}>
                          <View style={styles.formField}>
                            <Button style={[styles.cancelButton, {marginTop:0}]} textStyle={styles.actionButtonText} onPress={this.onReschedule}>
                              RESCHEDULE
                            </Button>
                          </View>
                        </View>
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
          </ScrollView>
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
module.exports = TestDriveTime;
