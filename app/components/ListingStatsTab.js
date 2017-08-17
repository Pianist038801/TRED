/**
 * TRED Listing About and Stats Tab Component
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
  ScrollView,
  RefreshControl,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../services/analytics.service');
var listingService = require('../services/listing.service');
var utils = require('../services/utils');
var authService = require('../services/auth.service');
var userService = require('../services/user.service');
var navigationService = require('../services/navigation.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var AboutStatsView = React.createClass({
  getDefaultProps: function(){
    return {
      listing: null,
    }
  },
  getInitialState: function(){
    return {
      listing: false,
      isRefreshing: false
    }
  },
  onRefresh: function(){
    this.setState({isRefreshing: true});
    var component = this;
    authService.isLoggedIn().then(function(loggedInUser) {
      component.setState({
        loggedIn: !!loggedInUser,
      });
      if(!loggedInUser){
        navigationService.showLogin();
      } else {
        listingService.get(component.state.listing.vin).then(function(_listing){
          component.setState({
            listing: _listing,
            isRefreshing: false
          })
          component.forceUpdate();
        });
      }
    });
  },
  componentDidMount: function(){
    if(this.props.listing){
      this.setState({
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
  treatAsUTC: function(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  },
  daysBetween: function(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.round((this.treatAsUTC(endDate) - this.treatAsUTC(startDate)) / millisecondsPerDay);
  },
  showListings: function(){
    this.props.navigator.push({
      id: "ViewListings",
      name: "View Listings",
      vin: this.state.listing.vin,
    });
  },
  showEdit: function(){
    this.props.navigator.push({
      id: "EditListing",
      name: "Edit Listing",
      listing: this.state.listing,
    });
  },
  render: function() {
    var listing = this.state.listing;
    var imgURI = null;
    var statusText = null;
    var bgColor = '#027fa5';
    var showViewListings = false;
    //Status
    if(listing.status > 0){
      bgColor = '#E96300';
      statusText ="Your vehicle is pending review.";
    } else if(listing.status === 0){
      if(listing.sold){
        bgColor = '#28948C';
        statusText ="Your vehicle has sold.";
      } else if(listing.pending_transaction){
        bgColor = '#9175BD';
        statusText = "Your vehicle is pending sale.";
      } else {
        statusText = "Your vehicle is for sale.";
        showViewListings = true;
      }
    } else if(listing.status < 0){
      bgColor = '#CC0000';      
      statusText = "Your vehicle has been removed.";
    }

    //Image
    if(listing && listing.images){
      var image = listing.images.find(function(image){
        return image.category !== 'vin';
      });
      imgURI = 'https://' + image.bucket + '.imgix.net/' + image.key + "?w=300"
    }

    //Price
    var priceText = '';
    var priceColor = '#28948C';
    var priceStatus = null;
    if(listing.price && listing.suggested_starting_price){
      var price = listing.price;
      var suggested = listing.suggested_starting_price;
      var diff = price - suggested;
      var diffPercent = Math.round(((price / suggested) * 100));

      if(diffPercent > 0){
        if(diffPercent > 110){
          priceText = 'OVERPRICED - ' + this.formatMoney(diff) + ' ABOVE MARKET';
          priceColor = '#CC0000';
          priceStatus = 1;
        } else if (diffPercent > 100){
          priceText = 'HIGH PRICE - ' + this.formatMoney(diff) + ' ABOVE MARKET';
          priceColor = '#F84545';
          priceStatus = 2;          
        } else if (diffPercent > 98){
          if(price === suggested){
            priceText = 'FAIR PRICE - AT MARKET VALUE';
          } else {
            priceText = 'FAIR PRICE - ' + this.formatMoney(-diff) + ' BELOW MARKET';
          }
          priceColor = '#b0aa0c';
          priceStatus = 3;          
        } else if (diffPercent > 92){
          priceText = 'GOOD PRICE - ' + this.formatMoney(-diff) + ' BELOW MARKET';
          priceColor = '#3EB5AC';
          priceStatus = 4;          
        } else {
          priceText = 'GREAT PRICE - ' + this.formatMoney(-diff) + ' BELOW MARKET';
          priceColor = '#28948C';
          priceStatus = 5;          
        }
      }
    }

    //Stats
    var pageViews = listing.analytics && listing.analytics.page_views && listing.analytics.relative_page_views ? Math.round((listing.analytics.page_views * 10) + listing.analytics.page_views) : 0;
    var timeOnPage = listing.analytics && listing.analytics.average_time_on_page ? parseFloat(listing.analytics.average_time_on_page / 60, 10).toFixed(1) : '0';
    var published = listing.published ? listing.published : new Date();
    var daysListed = this.daysBetween(published, new Date());      

    return (
      <View style={{flex: 1}}>
        <View style={[styles.main, {paddingBottom:0}]}>
          <View style={[styles.content, {flex:1, paddingHorizontal:0, paddingTop:0, paddingBottom:0}]}>
            <ScrollView styles={styles.scroll}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.isRefreshing}
                  onRefresh={this.onRefresh}
                  tintColor="#364347"
                  title="LOADING..."
                  colors={['#fff', '#fff', '#fff']}
                  progressBackgroundColor="#02BAF2"
                />
              }
            >
              <View style={{flex:1}}>
                <Image style={styles.carImage} source={{uri: imgURI}} />
                <View style={{paddingHorizontal:15}}>
                  <Text style={[styles.carTitle, {marginTop:10, textAlign:'left'}]}>
                    {listing.year ? listing.year : ''} {listing.make ? listing.make : ''} {listing.model ? listing.model : ''}
                  </Text>
                  <Text style={[styles.carTrim]}>{listing.trim ? listing.trim : ''} - {this.formatNumber(listing.mileage) + ' miles'}</Text>

                  <View style={[styles.table, {marginHorizontal:0, marginTop:0}]}>
                    <View style={[styles.tableRow, styles.tableBottom, {paddingVertical:4}]}>
                      {priceStatus ?
                        <View style={styles.tableCol10}>
                          {priceStatus === 1 ?
                            <Image 
                              source={require('../../images/arrows/overpriced.png')}
                              style={[styles.priceArrow]} /> : null
                          }
                          {priceStatus === 2 ?
                            <Image 
                              source={require('../../images/arrows/high-price.png')}
                              style={[styles.priceArrow]} /> : null
                          }
                          {priceStatus === 3 ?
                            <Image 
                              source={require('../../images/arrows/fair-price.png')}
                              style={[styles.priceArrow]} /> : null
                          }
                          {priceStatus === 4 ?
                            <Image 
                              source={require('../../images/arrows/good-price.png')}
                              style={[styles.priceArrow]} /> : null
                          }
                          {priceStatus === 5 ?
                            <Image 
                              source={require('../../images/arrows/great-price.png')}
                              style={[styles.priceArrow]} /> : null
                          }                            
                        </View> : null
                      }
                      <View style={styles.tableCol90}>
                        <View style={[styles.table, {padding:0, marginHorizontal:0, marginTop:0}]}>
                          <View style={[styles.tableRow, styles.tableBottom, {paddingVertical:0, paddingHorizontal:0}]}>
                            <View style={styles.tableCol60}>
                              <Text style={[styles.tableText, styles.tableHead]}>
                                ASKING PRICE&nbsp; 
                              </Text>
                            </View>
                            <View style={styles.tableCol40}>
                              <Text style={[styles.tableText, styles.tableHead, {fontWeight: 'bold', textAlign:'right'}]}>
                                {this.formatMoney(listing.price)}
                              </Text>
                            </View>                              
                          </View>
                          <View style={[styles.tableRow, styles.tableBottom, {paddingVertical:0, paddingHorizontal:0}]}>
                            <View style={styles.tableCol90}>
                              <Text style={[styles.tableText, {color: priceColor, fontSize: 13, fontWeight:'bold'}]}>{priceText}</Text>
                            </View>                              
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.formFieldHorizontal]}>
                    <Button onPress={this.showEdit} style={[styles.actionButton, {flex:1, height:30, marginHorizontal:0}]} textStyle={[styles.normalButtonText, {lineHeight:22}]} isDisabled={this.state.disabled}>
                      CHANGE PRICE / MILEAGE
                    </Button>
                  </View>
                  <View style={[styles.table, {marginHorizontal:0, marginTop:5}]}>
                    <View style={[styles.tableRow, styles.tableTop, {paddingVertical:3}]}>
                      <View style={styles.tableCol70}>
                        <Text style={[styles.tableText, styles.tableHead]}>EST. TOTAL VIEWS</Text>
                      </View>
                      <View style={styles.tableCol30}>
                        <Text style={[styles.tableText, styles.tableHead, {fontWeight: 'bold', textAlign:'right'}]}>
                          {pageViews}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.tableRow, {paddingVertical:3}]}>
                      <View style={styles.tableCol70}>
                        <Text style={[styles.tableText, styles.tableHead]}>AVG. TIME ON PAGE</Text>
                      </View>
                      <View style={styles.tableCol30}>
                        <Text style={[styles.tableText, styles.tableHead, {fontWeight: 'bold', textAlign:'right'}]}>
                          {timeOnPage} mins.
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.tableRow, styles.tableBottom, {paddingVertical:3}]}>
                      <View style={styles.tableCol70}>
                        <Text style={[styles.tableText, styles.tableHead]}>NUM. OF DAYS LISTED</Text>
                      </View>
                      <View style={styles.tableCol30}>
                        <Text style={[styles.tableText, styles.tableHead, {fontWeight: 'bold', textAlign:'right'}]}>
                          {daysListed}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={[styles.dashboardHeader, {backgroundColor: bgColor}]}>
                  { showViewListings ?
                    <View style={{flex:1, flexDirection: 'row'}}>
                      <View style={{flex:.7}}>
                        <Text style={[styles.dashboardHeaderText, styles.extraHeaderText]}>
                          {statusText}
                        </Text>
                      </View>
                      <View style={{flex:.3}}>
                        <Button onPress={this.showListings} style={[styles.actionButton, {flex:1, height:30}]} textStyle={[styles.normalButtonText, {lineHeight:22}]}>VIEW</Button>
                      </View>
                    </View>
                  :
                    <Text style={[styles.dashboardHeaderText]}>
                      {statusText}
                    </Text>
                  }
                </View>
              </View>
              <View ref="extra" style={{height:60}}></View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }
});

module.exports = AboutStatsView;
