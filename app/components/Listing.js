/**
 * TRED Listing Component
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
} = React;
var analytics = require('../services/analytics.service');
var listingService = require('../services/listing.service');
var talkService = require('../services/talk.service');
var LocalStorage = require('../services/localStorage.service');
var authService = require('../services/auth.service');
var userService = require('../services/user.service');
var navigationService = require('../services/navigation.service');

var ListingStatsTab = require('./ListingStatsTab');
var ListingTestDrivesTab = require('./ListingTestDrivesTab');
var ListingOffersTab = require('./ListingOffersTab');
var ListingDealTab = require('./ListingDealTab');
var Icon = require('react-native-vector-icons/FontAwesome');
var moment = require('moment-timezone');
import TabNavigator from 'react-native-tab-navigator';

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var Listing = React.createClass({
  getDefaultProps: function(){
    return {
      vin: null,
      listing: null,
      initialTab: "stats",
    }
  },
  getInitialState: function(){
    return {
      listing: false,
      selectedTab: this.props.initialTab || 'stats',
      statsBadgeNum: 0,
      testDrivesBadgeNum: 0,
      offersBadgeNum: 0,
      dealBadgeNum: 0,
    }
  },
  setTestDriveBadgeNum: function(){
    var listing = this.state.listing;
    if(listing){
      var testDrives = listing.test_drives ? listing.test_drives : [];
      var pendingTestDrives = [];
      testDrives.forEach(function(testDrive){
        if(testDrive.status === 'pending'){
          var isPast = 0;
          if(testDrive.proposedTimes){
            testDrive.proposedTimes.forEach(function(time){
              isPast = moment(time.start).isBefore(moment()) ? isPast + 1: isPast;  
            });
          }
          if(isPast !== 3 && !testDrive.rescheduled){
            pendingTestDrives.push(testDrive);
          }
        }
      });
      this.setState({
        testDrivesBadgeNum: pendingTestDrives.length,
      });
      this.forceUpdate();
    }
  },
  setOffersBadgeNum: function(){
    var component = this;
    talkService.getOffers().then(function(threads){
      var pendingOffers = [];
      threads.forEach(function(thread){
        talkService.getOffer(thread.id, false).then(function(fullThread){
          if(fullThread.messages && fullThread.messages[0].type && fullThread.messages[0].type === "offer"){
            pendingOffers.push(fullThread.messages[0]);
          };
          component.setState({
            offersBadgeNum: pendingOffers.length,
          });
          component.forceUpdate();
        });
      });
    });
  },
  loadBadges: function(){
    var component = this;
    listingService.get(this.props.vin).then(function(_listing){
      component.setState({
        listing: _listing
      });          
      component.setTestDriveBadgeNum();
    });
    this.setOffersBadgeNum();
  },
  componentWillMount: function(){
    var component = this;
    authService.isLoggedIn().then(function(loggedInUser) {
      component.setState({
        loggedIn: !!loggedInUser,
      });
      if(!loggedInUser){
        navigationService.showLogin();
      } else {
        if(component.props.vin){
          listingService.get(component.props.vin).then(function(_listing){
            component.loadBadges();
          });
        }
        component.forceUpdate();
      }
    });
  },
  onPressTab: function(tab){
    var component = this;
    authService.isLoggedIn().then(function(loggedInUser) {
      component.setState({
        loggedIn: !!loggedInUser,
      });
      if(!loggedInUser){
        navigationService.showLogin();
      } else {
        component.setState({ selectedTab: tab }); 
        LocalStorage.setObject('initialRoute', {id: 'Listing', name:'Listing', vin: component.state.listing.vin, initialTab: tab});
        component.forceUpdate();
      }
    });
  },
  render: function(){
    var listing = this.state.listing;
    if(listing){
      return (
        <View style={styles.mainDashboard}>
          <TabNavigator tabBarStyle={{backgroundColor:"#009DCD", overflow: 'hidden'}}>
            <TabNavigator.Item
              selected={this.state.selectedTab === 'stats'}
              title="About/Stats"
              titleStyle={{color: '#364347', fontSize:12, marginTop:-1, marginBottom:2}}
              selectedTitleStyle={{color:'#ffffff', fontSize:12, marginTop:-1, marginBottom:2}}
              renderIcon={() => <Icon name="bar-chart" size={22} color={'#364347'} />}
              renderSelectedIcon={() => <Icon name="bar-chart" size={22} color={'#ffffff'} />}
              renderBadge={() =>
                this.state.statsBadgeNum === 0 ? null:
                <View style={{alignItems:'center',backgroundColor:'red', width:16, borderRadius: 100, borderColor: '#d6d7da'}}>
                  <Text style={{color: '#fff',fontSize:12}}>{this.state.statsBadgeNum}</Text>
                </View>
              }
              onPress={() => {
                this.onPressTab('stats'); 
              }}>
                <ListingStatsTab listing={listing} navigator={this.props.navigator} />
            </TabNavigator.Item>

            <TabNavigator.Item
              selected={this.state.selectedTab === 'testDrives'}
              title="Test Drives"
              titleStyle={{color: '#364347', fontSize:12, marginTop:-1, marginBottom:2}}
              selectedTitleStyle={{color:'#ffffff', fontSize:12, marginTop:-1, marginBottom:2}}
              renderIcon={() => <Icon name="car" size={22} color={'#364347'} />}
              renderSelectedIcon={() => <Icon name="car" size={22} color={'#ffffff'} />}
              renderBadge={() =>
                this.state.testDrivesBadgeNum === 0 ? null:
                <View style={{alignItems:'center',backgroundColor:'red', width:16, borderRadius: 100, borderColor: '#d6d7da'}}>
                  <Text style={{color: '#fff',fontSize:12}}>{this.state.testDrivesBadgeNum}</Text>
                </View>
              }
              onPress={() => {
                this.onPressTab('testDrives'); 
              }}>
                <ListingTestDrivesTab listing={listing} navigator={this.props.navigator} onFocus={this.loadBadges} />
            </TabNavigator.Item>

            <TabNavigator.Item
              selected={this.state.selectedTab === 'offers'}
              title="Offers"
              titleStyle={{color: '#364347', fontSize:12, marginTop:-1, marginBottom:2}}
              selectedTitleStyle={{color:'#ffffff', fontSize:12, marginTop:-1, marginBottom:2}}
              renderIcon={() => <Icon name="usd" size={22} color={'#364347'} />}
              renderSelectedIcon={() => <Icon name="usd" size={22} color={'#ffffff'} />}
              renderBadge={() =>
                this.state.offersBadgeNum === 0 ? null:
                <View style={{alignItems:'center',backgroundColor:'red', width:16, borderRadius: 100, borderColor: '#d6d7da'}}>
                  <Text style={{color: '#fff',fontSize:12}}>{this.state.offersBadgeNum}</Text>
                </View>
              }
              onPress={() => {
                this.onPressTab('offers'); 
              }}>
                <ListingOffersTab listing={listing} navigator={this.props.navigator} onFocus={this.loadBadges} />
            </TabNavigator.Item>            
            {/*}
            <TabNavigator.Item
              selected={this.state.selectedTab === 'deal'}
              title="Deal"
              titleStyle={{color: '#364347', fontSize:12, marginTop:-2, marginBottom:2}}
              selectedTitleStyle={{color:'#ffffff', fontSize:12, marginTop:-1, marginBottom:2}}
              renderIcon={() => <Icon name="shopping-cart" size={22} color={'#364347'} />}
              renderSelectedIcon={() => <Icon name="shopping-cart" size={22} color={'#ffffff'} />}
              renderBadge={() =>
                this.state.dealBadgeNum === 0 ? null:
                <View style={{alignItems:'center',backgroundColor:'red', width:16, borderRadius: 100, borderColor: '#d6d7da'}}>
                  <Text style={{color: '#fff',fontSize:12}}>{this.state.dealBadgeNum}</Text>
                </View>
              }
              onPress={() => {
                this.onPressTab('deal'); 
              }}>
                <ListingDealTab listing={listing} navigator={this.props.navigator} />
            </TabNavigator.Item>
            */}            
          </TabNavigator>
        </View>
      );
    } else {
      return (
        <View style={{flex:1}}>
          <Text style={[styles.pText, {marginTop:15, textAlign:'center'}]}>This listing was not found.</Text>
        </View>
      );
    }
  },
});

module.exports = Listing;
