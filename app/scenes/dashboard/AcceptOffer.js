/**
 * TRED Accept Offer Layout
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
  StyleSheet,
  Alert,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var userService = require('../../services/user.service');
var talkService = require('../../services/talk.service');
var listingService = require('../../services/listing.service');
var utils = require('../../services/utils');
var moment = require('moment-timezone');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var AcceptOffer = React.createClass({
  getDefaultProps: function(){
    return {
      thread_id: null,
    }
  },
  getInitialState: function(){
    return {
      thread_id: null,
      seller_id: null,
      user_id: null,
      initialized: false,    
      latest_offer_amount: null,
      price: null,
      listing: null,
    }
  },
  componentDidMount: function(){
    if(this.props.thread_id){
      this.setState({
        thread_id: this.props.thread_id
      });
    }
    var component = this;
    this.loadThread().then(function(){
      component.forceUpdate();
    });
  },
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  loadThread: function(){
    var component = this;
    component.setState({
      initialized: false,
    });
    var thread = null;
    return talkService.getOffer(component.props.thread_id, true).then(function(_thread){
      thread = _thread;
      return userService.get();
    }).then(function(user) {
      var seller_id = thread.listing ? thread.listing.user_id : null;

      var latest_offer_amount;
      for(var i = 0; i < thread.messages.length; i++) {
        if(thread.messages[i].type === "offer") {
          latest_offer_amount = parseInt(thread.messages[i].versions[0].offer, 10);
          break;
        }
      }

      var listing = (typeof thread.listing !== 'undefined' && thread.listing) ? thread.listing : null;
      
      var price = null;
      if(listing.price !== 'undefined' && listing.price){
        price = listing.price;
        if(listing.base_warranty && listing.base_warranty.adjusted_list_price){
          price = listing.base_warranty.adjusted_list_price;
        }
      }

      var buyerName = null;
      if(thread.metadata && thread.metadata.buyer_id && thread.users && thread.users[thread.metadata.buyer_id]){
        if(thread.users[thread.metadata.buyer_id].first_name){
          buyerName = thread.users[thread.metadata.buyer_id].first_name;
        }
      }

      component.setState({
        initialized: true,
        thread: thread,
        seller_id: seller_id,
        user_id: user.id,
        latest_offer_amount: latest_offer_amount,
        price: price,
        listing: listing,
        buyerName: buyerName,
      });
    });
  },
  onConfirm: function(){
    var component = this;
    var thread = this.state.thread;
    var listing = this.state.listing;
    var price = this.state.price;
    var latest_offer_amount = this.state.latest_offer_amount;

    if(listing && thread){
      if(listing.sold || listing.pending_transaction){
        Alert.alert("Notice", "This vehicle is already sold or is pending sale, therefore you cannot accept this offer. If you think this is an error, please contact us for help.", [
          {text: "OK"},
          {text: "Contact Us", onPress: () => {
              component.props.navigator.push({
                id: 'Support',
                name: 'Support',
              });
            }
          },
        ]);      
      } else {
        Alert.alert("Confirm Accepted Offer", "By accepting this offer of " + this.formatMoney(latest_offer_amount) + " you are agreeing to move forward with the sale of this vehicle and a bill of sale will be issued to you and your buyer.", [
          {text: "Yes, Accept Offer", onPress: () => {
              talkService.sendToThread(thread.id, "accept_offer", {offer: latest_offer_amount}).then(function(){
                Alert.alert("Offer Accepted!", "Your buyer has 24 hours to pay for your vehicle or place a $50 deposit to hold your vehicle at the accepted offer price while they arrange financing or a test drive. If they pay a deposit to hold your vehicle, they’ll have an additional 72 hours to pay for your vehicle. If they don’t close within the allotted timeframes, your car will be re-listed on our network. We’ll keep you posted every step of the way. 65% of our buyers close.", [
                  {text: "Ok", onPress: () => {
                      component.props.navigator.replacePrevious({
                        id: "Listing",
                        name: "Listing",
                        vin: component.state.listing.vin,
                        initialTab: "offers",
                      });
                      component.props.navigator.pop();                  
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
                Alert.alert("Uh Oh...", "An error occured sending your offer acceptance. Please try again later or contact us for help.", [
                  {text: "Ok"},
                  {text: "Contact Us", onPress: () => {
                      component.props.navigator.push({
                        id: 'Support',
                        name: 'Support',
                      });
                    }
                  },
                ]);
              });
            }
          },
          {text: "No, I'm Not Ready"},
        ]);
      }
    }
  },
  render: function() {
    if(this.state.thread && this.state.seller_id && this.state.user_id && this.state.seller_id === this.state.user_id){
      var thread = this.state.thread;
      var listing = this.state.listing;
      var price = this.state.price;
      var latest_offer_amount = this.state.latest_offer_amount;
      var buttonText = "ACCEPT " + this.formatMoney(latest_offer_amount);

      if(latest_offer_amount && price && listing){
        var offerFlex = Math.max(Math.round((latest_offer_amount * 100) / price) / 100, .65);
        var greatOffer = Math.ceil((price * .95)/100)*100;
        var goodOffer = Math.ceil((price * .80)/100)*100;
        return (
          <View style={[styles.main, {paddingBottom:48}]}>
            <ScrollView style={[styles.scroll]}>
              <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
                <Text style={styles.cameraTitle}>ACCEPT {this.state.buyerName ? this.state.buyerName.toUpperCase() + "'S" : "THIS"} OFFER</Text>
                <Text style={styles.subText}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)} </Text>
                  <View style={[styles.chart]}>
                    <View style={[styles.chartRow]}>
                      <View style={[styles.chartGreen, {flex: offerFlex}]}>
                        <View style={{flex:1, flexDirection:'row'}}>
                          <Text style={[styles.tableText, {flex:.75, color:'white'}]}>{this.state.buyerName ? this.state.buyerName + "'s" : "Buyer"} Latest Offer&nbsp;</Text>
                          <Text style={[styles.tableText, {flex:.25, fontWeight:'bold', color:'white', textAlign:'right'}]}>{this.formatMoney(latest_offer_amount)}</Text>
                        </View>
                      </View>
                      <View style={{flex: (1 - offerFlex)}}></View>
                    </View>
                    <View style={[styles.chartRow]}>
                      <View style={[styles.chartBlue, {flex:1}]}>
                        <View style={{flex:1, flexDirection:'row'}}>
                          <Text style={[styles.tableText, {flex:.75, color:'white'}]}>List Price&nbsp;</Text>
                          <Text style={[styles.tableText, {flex:.25, fontWeight:'bold', color:'white', textAlign:'right'}]}>{this.formatMoney(price)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.chartRow]}>
                      <View style={[styles.chartPurple, {flex: .95, marginBottom:2}]}>
                        <View style={{flex:1, flexDirection:'row'}}>
                          <Text style={[styles.tableText, {flex:.75, color:'white'}]}>Great Offer&nbsp;</Text>
                          <Text style={[styles.tableText, {flex:.25, fontWeight:'bold', color:'white', textAlign:'right'}]}>{this.formatMoney(greatOffer)}</Text>
                        </View>
                      </View>
                      <View style={{flex: (1 - .95)}}></View>
                    </View>
                    <View style={[styles.chartRow]}>
                      <View style={[styles.chartOrange, {flex: .80}]}>
                        <View style={{flex:1, flexDirection:'row'}}>
                          <Text style={[styles.tableText, {flex:.75, color:'white'}]}>Good Offer&nbsp;</Text>
                          <Text style={[styles.tableText, {flex:.25, fontWeight:'bold', color:'white', textAlign:'right'}]}>{this.formatMoney(goodOffer)}</Text>
                        </View>
                      </View>
                      <View style={{flex: (1 - .80)}}></View>
                    </View>
                    <Text style={[styles.pText, styles.smallerPrint, {paddingHorizontal:5, marginBottom:5}]}>
                      Most sellers accept "great" offers and respond to all offers.
                    </Text>
                  </View>
                  <Text style={[styles.pText, {marginTop:15}]}>
                    Does {this.state.buyerName ? this.state.buyerName + "'s" : "the potential buyer's"} offer of <Text style={{fontWeight: 'bold'}}>{this.formatMoney(latest_offer_amount)}</Text> look good to you? If so, click the ACCEPT button and we&apos;ll direct {this.state.buyerName ? this.state.buyerName : "the potential buyer"} to proceed to payment.
                  </Text>
              </View>
            </ScrollView>
            <View style={styles.bottom}>
              <View style={styles.stretch}>
                <View style={styles.formField}>
                  <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText}>
                    {buttonText}
                  </Button>
                </View>
              </View>
            </View>
          </View>
        );
      } else {
        return (
          <View style={{flex:1}}>
            <Text style={[styles.pText, {marginTop:15, textAlign:'center'}]}>We could not find the amount of the latest offer. Please contact us for help.</Text>
          </View>       
        );
      }
    } else {
      return (
        <View style={{flex:1}}>
          <Text style={[styles.pText, {marginTop:15, textAlign:'center'}]}>Something went wrong with this offer. Please contact us for help.</Text>
        </View>       
      );
    }
  }
});
module.exports = AcceptOffer;
