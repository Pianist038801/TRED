/**
 * TRED Listing Offers Tab Component
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
var talkService = require('../services/talk.service');
var analytics = require('../services/analytics.service');
var utils = require('../services/utils');
var moment = require('moment-timezone');
var Icon = require('react-native-vector-icons/FontAwesome');
var authService = require('../services/auth.service');
var userService = require('../services/user.service');
var navigationService = require('../services/navigation.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var ListingOffersTab = React.createClass({
  getDefaultProps: function(){
    return {
      listing: null,
    }
  },
  getInitialState: function(){
    var offersDS = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      (r1, r2) => r1 != r2
    }});
    return {
      listing: false,
      sellerThreads: null,
      offersDataSource: offersDS.cloneWithRows([]),  
      initialized: false,
      isRefreshing: false,   
    }
  },
  componentDidMount: function() {
    if(this.props.listing){
      this.setState({
        listing: this.props.listing
      });
    }
    var component = this;
    this.loadOffers().then(function(){
      component.forceUpdate();
    });
  },
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  refreshOffers: function(){
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
        component.loadOffers().then(function(){
          component.setState({
            isRefreshing: false,
          });
          component.forceUpdate();
        });
      }
    });
  },
  loadOffers: function(){
    var component = this;
    component.setState({
      initialized: false,
      offersDataSource: component.state.offersDataSource.cloneWithRows([])
    });
    return talkService.getOffers().then(function(threads){
      var sellerThreads = threads.filter(function(x){
        if(x.listing) { 
          return component.props.listing.user_id === x.listing.user_id && component.props.listing.vin === x.listing.vin; 
        } else { 
          return null;
        }
      });

      component.setState({
        initialized: true,
        sellerThreads: sellerThreads,
        offersDataSource: component.state.offersDataSource.cloneWithRows(sellerThreads),      
      });

      if(typeof component.props.onFocus === 'function'){
        component.props.onFocus();
      }
    });
  },
  onOfferPress: function(rowData, buyerNum){
    this.props.navigator.push({
      id: "Offer",
      name: "Offer",
      thread_id: rowData.id
    });
  },
  render: function() {
    var listing = this.state.listing;
    return (
      <View style={{flex:1}}>
        <View style={[styles.main, {paddingBottom:0}]}>
          <View style={[styles.content, {flex:1, paddingHorizontal:0, paddingBottom:0}]}>
            <Text style={styles.cameraTitle}>ALL BUYER OFFERS</Text>
            <Text style={styles.subText}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)} </Text>
            <View style={[styles.scroll, styles.listViewBackground]}>
              <View style={{flex:1}}>
                { this.state.sellerThreads && this.state.sellerThreads.length > 0 ?
                  <ListView
                    dataSource={this.state.offersDataSource}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this.refreshOffers}
                        tintColor="#364347"
                        title="LOADING..."
                        colors={['#fff', '#fff', '#fff']}
                        progressBackgroundColor="#02BAF2"
                      />
                    }
                    renderRow={(rowData, sectionID, rowID) => 
                      {
                        var latest_offer_amount;
                        var latest_offer_date;
                        for(var i = 0; i < rowData.messages.length; i++) {
                          if(rowData.messages[i].type === "offer") {
                            latest_offer_amount = parseInt(rowData.messages[i].versions[0].offer, 10);
                            latest_offer_date = rowData.messages[i].updated;
                            break;
                          }
                        }
                        var latest_counter_offer_amount;
                        var latest_counter_offer_date;
                        for(var i = 0; i < rowData.messages.length; i++) {
                          if(rowData.messages[i].type === "counter_offer") {
                            latest_counter_offer_amount = parseInt(rowData.messages[i].versions[0].offer, 10);
                            latest_counter_offer_date = rowData.messages[i].updated;
                            if(latest_offer_date){
                              if(latest_counter_offer_date > latest_offer_date){
                                latest_offer_amount = 0;
                              }
                            }
                            break;
                          }
                        }                        
                        var accepted_offer_amount;
                        var latest_accepted_offer_date;
                        for(var i = 0; i < rowData.messages.length; i++) {
                          if(rowData.messages[i].type === "accept_offer") {
                            accepted_offer_amount = parseInt(rowData.messages[i].versions[0].offer, 10);
                            latest_accepted_offer_date = rowData.messages[i].updated;
                            break;
                          }
                        }
                        var accepted_counter_offer_amount;
                        var latest_accepted_counter_offer_date;
                        for(var i = 0; i < rowData.messages.length; i++) {
                          if(rowData.messages[i].type === "accept_counter_offer") {
                            accepted_counter_offer_amount = parseInt(rowData.messages[i].versions[0].offer, 10);
                            latest_accepted_counter_offer_date = rowData.messages[i].updated;
                            break;
                          }
                        }
                        var deposit = null;
                        var deposit_date;
                        for(var i = 0; i < rowData.messages.length; i++) {
                          if(rowData.messages[i].type === "deposit") {
                            deposit = rowData.messages[i].versions[0].deposit_id, 10;
                            deposit_date = rowData.messages[i].updated;
                            break;
                          }
                        }

                        var buyerName = "# " + parseInt(rowID) + 1;
                        if(rowData.metadata && rowData.metadata.buyer_id && rowData.users && rowData.users[rowData.metadata.buyer_id]){
                          if(rowData.users[rowData.metadata.buyer_id].first_name){
                            buyerName = rowData.users[rowData.metadata.buyer_id].first_name;
                          }
                        }
                        buyerName = utils.capitalizeAllWords(buyerName);
                        var offerText = null;
                        var offerDate = null;
                        var offerTextStyle = styles.greyOfferListViewText;
                        var iconColor = "#364347";
                        var fontWeight = "normal";
                        var exclamation = false;
                        if(accepted_offer_amount) {
                          offerDate = moment(latest_accepted_offer_date).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z');
                          if(deposit){
                            offerText = "Placed a deposit";
                            offerTextStyle = styles.orangeOfferListViewText;
                            iconColor = "#E96300";
                          } else {
                            offerText = "You Accepted " + this.formatMoney(accepted_offer_amount);
                            offerTextStyle = styles.greenOfferListViewText;
                            iconColor = "#28948C";
                          }
                        } else if(accepted_counter_offer_amount) {
                          offerDate = moment(latest_accepted_counter_offer_date).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z');
                          if(deposit){
                            offerText = "Placed a deposit";
                            offerTextStyle = styles.orangeOfferListViewText;
                            iconColor = "#E96300";
                          } else {
                            offerText = "Accepted" + this.formatMoney(accepted_counter_offer_amount);
                            offerTextStyle = styles.orangeOfferListViewText;
                            iconColor = "#E96300";
                          }
                        } else if(latest_offer_amount > 0) {
                          offerDate = moment(latest_offer_date).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z');
                          offerText = "Offered " + this.formatMoney(latest_offer_amount);
                          offerTextStyle = styles.orangeOfferListViewText;
                          iconColor = "#E96300";
                          fontWeight = "bold";
                          var exclamation = true;
                        } else if(latest_counter_offer_amount > 0) {
                          offerDate = moment(latest_counter_offer_date).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z');
                          offerText = "You Counter-offered " + this.formatMoney(latest_counter_offer_amount);
                          offerTextStyle = styles.greenOfferListViewText;
                          iconColor = "#28948C";
                        } else if(deposit) {
                          offerDate = moment(deposit_date).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z');
                          offerText = "Buyer placed deposit.";
                          offerTextStyle = styles.orangeOfferListViewText;
                          iconColor = "#E96300";
                        } else {
                          offerDate = "";
                          offerText = "Details Not Available";
                        }

                        return <TouchableHighlight onPress={() => this.onOfferPress(rowData, parseInt(rowID) + 1)}>
                          <View>
                            <View style={styles.listViewRow}>
                              <Icon name="user" size={42} color={iconColor} style={[{paddingRight:15}, Platform.OS === 'android' ? {marginTop:9} : {marginTop:4}]} />
                              { exclamation ?
                                <Icon name="circle" size={8} color={"red"} style={[styles.listViewBadgeOffer]} />
                              :
                                null
                              }
                              <Text style={[styles.offerListViewText, {fontWeight: fontWeight}]}>
                                {buyerName} {'\n'}
                                <Text style={offerTextStyle}>{offerText}</Text>
                                {'\n'}
                                <Text style={styles.greyOfferListViewTextSmall}>on {offerDate}</Text>
                              </Text>
                              <Image style={[styles.nextImage, {marginLeft:5}, Platform.OS === 'android' ? {marginTop:9} : {marginTop:4}]} source={require('../../images/next-arrow.png')} />
                            </View>
                            <View style={styles.separator} />
                          </View>
                        </TouchableHighlight>
                      }
                    } />
                :
                  <View>
                    {this.state.initialized ?
                      <Text style={styles.listViewError}>NO OFFERS YET.</Text>
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

module.exports = ListingOffersTab;
