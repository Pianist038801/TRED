/**
 * TRED Listing Test Drives Tab Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
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
  TouchableHighlight,
} = React;
var listingService = require('../services/listing.service');
var analytics = require('../services/analytics.service');
var utils = require('../services/utils');
var moment = require('moment-timezone');
var Icon = require('react-native-vector-icons/FontAwesome');
var authService = require('../services/auth.service');
var userService = require('../services/user.service');
var navigationService = require('../services/navigation.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var ListingTestDrivesTab = React.createClass({
  getDefaultProps: function(){
    return {
      listing: null,
    }
  },
  getInitialState: function(){
    var getSectionData = (dataBlob, sectionID) => {
      return dataBlob[sectionID];
    }
    var getRowData = (dataBlob, sectionID, rowID) => {
      return dataBlob[sectionID + ':' + rowID];
    }
    return {
      listing: false,
      testDrives: [],
      testDrivesDataSource : new ListView.DataSource({
        getSectionData : getSectionData,
        getRowData : getRowData,
        rowHasChanged: (r1, r2) => {
          (r1, r2) => r1 != r2
        },
        sectionHeaderHasChanged : (s1, s2) => s1 !== s2
      }),
      initialized:false,
      isRefreshing:false,
      filteredTestDrives : [],
    }
  },
  componentDidMount: function() {
    if(this.props.listing){
      this.setState({
        listing: this.props.listing
      });
    }
    var component = this;
    this.loadTestDrives().then(function(){
      component.forceUpdate();
    });
  },
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  buildSectionsAndRows: function(sections){
    var length = sections.length,
        dataBlob = {},
        sectionIDs = [],
        rowIDs = [],
        section,
        testDrives,
        testDrivesLength,
        testDrive,
        i,
        j;
    for (i = 0; i < length; i++) {
      section = sections[i];
      sectionIDs.push(section.sectionName);
      dataBlob[section.sectionName] = section.sectionName;
      testDrives = section.testDrives;
      testDrivesLength = testDrives.length;
      rowIDs[i] = [];
      for(j = 0; j < testDrivesLength; j++) {
        testDrive = testDrives[j];
        rowIDs[i].push(testDrive.id);
        dataBlob[section.sectionName + ':' + testDrive.id] = testDrive;
      }
    }
    this.setState({
      initialized: true,
      testDrivesDataSource : this.state.testDrivesDataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
    });

    if(typeof this.props.onFocus === 'function'){
      this.props.onFocus();
    }

  },
  refreshTestDrives: function(){
    var component = this;
    this.setState({
      isRefreshing: true,
    });
    authService.isLoggedIn().then(function(loggedInUser) {
      component.setState({
        loggedIn: !!loggedInUser,
      });
      if(!loggedInUser){
        component.setState({
          isRefreshing: false,
        });
        navigationService.showLogin();
      } else {
        component.loadTestDrives().then(function(){
          component.setState({
            isRefreshing: false,
          });
          component.forceUpdate();
        });
      }
    });
  },
  loadTestDrives: function(){
    var component = this;
    component.setState({
      initialized: false,
      testDrivesDataSource: component.state.testDrivesDataSource.cloneWithRowsAndSections({},[], [])
    });
    return listingService.get(this.props.listing.vin).then(function(listing){
      var testDrives = listing.test_drives ? listing.test_drives : [];

      var objSections = {};
      testDrives.forEach(function(testDrive){
        var sectionName = testDrive.status
        if(testDrive.status === 'pending'){
          var isPast = 0;
          if(testDrive.proposedTimes){
            testDrive.proposedTimes.forEach(function(time){
              isPast = moment(time.start).isBefore(moment()) ? isPast + 1: isPast;  
            });
          }
          sectionName = isPast === 3 ? "missed" : sectionName
          testDrive.status = isPast === 3 ? "missed" : sectionName
        
          if(isPast !== 3 && testDrive.rescheduled){
            sectionName = "rescheduled";
            testDrive.status = "rescheduled";
          }
        }

        if(testDrive.status === 'confirmed'){
          var isPast = 0;
          var isCurrent = 0;
          if(testDrive.startTime){
            isCurrent = moment().isBetween(moment(testDrive.startTime), moment(testDrive.startTime).add(1, "hours")) ? isCurrent + 1: isCurrent;  
            isPast = moment(testDrive.startTime).add(1, "hours").isBefore(moment()) ? isPast + 1: isPast;  
          }
          if(isPast === 1){
            sectionName = isPast === 1 ? "completed" : sectionName
            testDrive.status = isPast === 1 ? "completed" : sectionName
          } else if(isCurrent === 1){
            sectionName = isCurrent === 1 ? "current" : sectionName
            testDrive.status = isCurrent === 1 ? "current" : sectionName
          }
        }
        
        //Remove missed and canceled test drives for now
        if(sectionName !== 'missed' && sectionName !== 'canceled'){
          objSections[sectionName] = objSections[sectionName] || [];
          objSections[sectionName].push(testDrive);
        }
      });
      
      var filteredTestDrives = testDrives.filter(function(testDrive){ 
        return testDrive.status !== "missed" && testDrive.status !== "canceled"
      });

      //Sort confirm test drive oldest to newest startTime
      if(objSections.confirmed){
        objSections.confirmed.sort(function(a,b){
          if(moment(a.startTime).isBefore(moment(b.startTime))){
            return -1;
          } else {
            return 0;
          }
        });
      }

      var sortedSections = ['current', 'pending', 'confirmed', 'rescheduled', 'missed', 'completed', 'canceled']
      var sections = sortedSections.map(function(section){
        var sectionName = utils.capitalizeAllWords(section);        
        sectionName = section === 'pending' ? 'Pending Requested Test Drives' : sectionName; 
        sectionName = section === 'rescheduled' ? 'Rescheduled Test Drives' : sectionName; 
        sectionName = section === 'confirmed' ? 'Upcoming Confirmed Test Drives' : sectionName; 
        sectionName = section === 'missed' ? 'Missed Test Drives' : sectionName; 
        sectionName = section === 'current' ? 'Current Test Drives' : sectionName; 
        sectionName = section === 'completed' ? 'Completed Test Drives' : sectionName; 
        sectionName = section === 'canceled' ? 'Canceled Test Drives' : sectionName; 
        return { sectionName: sectionName, testDrives: objSections[section] || []};        
      });

      component.setState({
        testDrives: testDrives,
        filteredTestDrives: filteredTestDrives,
      });
      component.buildSectionsAndRows(sections);
    });
  },
  onTestDrivePress: function(rowData){
    if(rowData.status !== "completed"){
      if(rowData.status && (rowData.status === "pending" || rowData.status === "rescheduled")){
        if(!rowData.rescheduled){
          this.props.navigator.push({
            id: "TestDriveTime",
            name: "Test Drive Time",
            vin: this.props.listing.vin, 
            test_drive_id: rowData.id,
          });
        }
      } else {
        this.props.navigator.push({
          id: "TestDrive",
          name: "Test Drive",
          vin: this.props.listing.vin, 
          test_drive_id: rowData.id,
        });      
      }
    }
  },
  render: function() {
    var listing = this.state.listing;
    return (
      <View style={{flex:1}}>
        <View style={[styles.main, {paddingBottom:0}]}>
          <View style={[styles.content, {flex:1, paddingHorizontal:0, paddingBottom:0}]}>
            <Text style={styles.cameraTitle}>TEST DRIVES</Text>
            <Text style={styles.subText}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)} </Text>
            <View style={[styles.scroll, styles.listViewBackground]}>
              <View style={{flex:1}}>
                { this.state.filteredTestDrives && this.state.filteredTestDrives.length > 0 ?
                  <ListView
                    dataSource={this.state.testDrivesDataSource}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this.refreshTestDrives}
                        tintColor="#364347"
                        title="LOADING..."
                        colors={['#fff', '#fff', '#fff']}
                        progressBackgroundColor="#02BAF2"
                      />
                    }
                    renderSectionHeader={(sectionData, sectionID) =>
                      <View style={styles.section}>
                        <Text style={styles.sectionText}>{sectionData}</Text>
                      </View>
                    }
                    renderRow={(rowData, sectionID, rowID) => 
                      {
                        var iconColor = "#364347";
                        if(rowData && rowData.status && rowData.status === 'pending'){
                          var iconColor = "#F58410";
                          var fontWeight = "bold";
                        }
                        if(rowData && rowData.status && rowData.status === 'rescheduled'){
                          var iconColor = "#9175BD";
                          var fontWeight = "bold";
                        }
                        if(rowData && rowData.status && rowData.status === 'missed'){
                          var iconColor = "#CC0000";
                          var fontWeight = "normal";
                        }
                        if(rowData && rowData.status && rowData.status === 'confirmed'){
                          var iconColor = "#009DCD";
                          var fontWeight = "normal";
                        }
                        if(rowData && rowData.status && rowData.status === 'completed'){
                          var iconColor = "#3EB5AC";
                          var fontWeight = "normal";
                        }
                        if(rowData && rowData.status && rowData.status === 'current'){
                          var iconColor = "#9175BD";
                          var fontWeight = "bold";
                        }
                        if(rowData && rowData.status && rowData.status === 'canceled'){
                          var iconColor = "#364347";
                          var fontWeight = "normal";
                        }
                        return <TouchableHighlight onPress={() => this.onTestDrivePress(rowData)}>
                          <View>
                            <View style={styles.listViewRow}>
                              <Icon name="car" size={36} color={iconColor} style={[{paddingRight:15}, Platform.OS === 'android' ? {marginTop:9} : {marginTop:7}]} />
                              { rowData && rowData.status && rowData.status === 'pending' ?
                                <Icon name="circle" size={8} color={"red"} style={styles.listViewBadge} />
                              :
                                null
                              }
                              <Text style={[styles.offerListViewText, {fontWeight: fontWeight}]}>
                                {rowData.buyer_first_name ? utils.capitalizeAllWords(rowData.buyer_first_name) : 'Buyer'} {'\n'}
                                { rowData && rowData.status && rowData.status === 'pending' ?
                                  <Text style={[styles.orangeOfferListViewText, {color: iconColor}]}>Requested a test drive</Text>
                                : 
                                  null
                                }                                
                                { rowData && rowData.status && rowData.status === 'rescheduled' ?
                                  <Text style={[styles.orangeOfferListViewText, {color: iconColor}]}>Was asked to reschedule</Text>
                                : 
                                  null
                                }
                                { rowData && rowData.status && rowData.status === 'missed' ?
                                  <Text style={[styles.orangeOfferListViewText, {color: iconColor}]}>Requested a test drive (PAST DUE)</Text>
                                : 
                                  null
                                }                                
                                { rowData && rowData.status && rowData.status === 'confirmed' ?
                                  <Text style={[styles.orangeOfferListViewText, {color: iconColor}]}>Location: {rowData.locationLandmark ? rowData.locationLandmark : rowData.locationAddress ? locationAddress : 'N/A'}</Text>
                                : 
                                  null
                                }
                                { rowData && rowData.status && rowData.status === 'completed' ?
                                  <Text style={[styles.orangeOfferListViewText, {color: iconColor}]}>Test drive completed</Text>
                                : 
                                  null
                                }
                                { rowData && rowData.status && rowData.status === 'current' ?
                                  <Text style={[styles.orangeOfferListViewText, {color: iconColor}]}>Test drive In progress</Text>
                                : 
                                  null
                                }
                                { rowData && rowData.status && rowData.status === 'canceled' ?
                                  <Text style={[styles.orangeOfferListViewText, {color: iconColor}]}>Canceled a test drive</Text>
                                : 
                                  null
                                }
                                {'\n'}
                                { rowData.startTime ?
                                  <Text style={[styles.greyOfferListViewTextSmall]}>on { moment(rowData.startTime).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z') }</Text>
                                :
                                  <Text>
                                    { rowData.rescheduled ?
                                      <Text style={[styles.greyOfferListViewTextSmall]}>on { moment(rowData.rescheduled).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z') }</Text>
                                    :
                                      <Text style={[styles.greyOfferListViewTextSmall]}>on { moment(rowData.updated).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z') }</Text>
                                    }
                                  </Text>
                                }
                              </Text>
                              {!rowData.rescheduled && rowData && rowData.status && rowData.status !== 'completed' ?
                                <Image style={[styles.nextImage, {marginLeft:5}, Platform.OS === 'android' ? {marginTop:9} : {marginTop:4}]} source={require('../../images/next-arrow.png')} />
                              : 
                                null
                              }
                            </View>
                            <View style={styles.separator} />
                          </View>
                        </TouchableHighlight>
                      }
                    } />
                :
                  <View>
                    {this.state.initialized ?
                      <Text style={styles.listViewError}>NO TEST DRIVES.</Text>
                    :
                      null
                    }
                  </View>                  
                }
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
});

module.exports = ListingTestDrivesTab;
