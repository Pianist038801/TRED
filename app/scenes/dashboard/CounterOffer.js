/**
 * TRED Counter Offer Layout
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
  TextInput,
  StyleSheet,
  Alert,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var userService = require('../../services/user.service');
var talkService = require('../../services/talk.service');
var utils = require('../../services/utils');
var moment = require('moment-timezone');
var InputAccessory = require('../../components/InputAccessory.js');
var KeyboardHandler = require('../../components/KeyboardHandler.js');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var CounterOffer = React.createClass({
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
      counter_offer: null,
      latest_offer_amount: null,
      latest_counter_offer_amount: null,
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
  onChangeOffer: function(value){
    value = value.toString();
    value = value.replace(/[^0-9]/g, '');
    var num = value.replace(/,/gi, '');
    var num2 = num.replace(/\d(?=(?:\d{3})+$)/g, '$&,');
    this.setState({
      counter_offer: '$' + num2
    });
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

      var latest_offer_amount = null;
      for(var i = 0; i < thread.messages.length; i++) {
        if(thread.messages[i].type === "offer") {
          latest_offer_amount = parseInt(thread.messages[i].versions[0].offer, 10);
          break;
        }
      }

      var latest_counter_offer_amount = null;
      for(var i = 0; i < thread.messages.length; i++) {
        if(thread.messages[i].type === "counter_offer") {
          latest_counter_offer_amount = parseInt(thread.messages[i].versions[0].offer, 10);
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
      if (latest_counter_offer_amount){
        component.setState({
          counter_offer: component.formatMoney(latest_counter_offer_amount - 50),
        });
      } else if(price) {
        component.setState({
          counter_offer: component.formatMoney(price - 50),
        });
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
        latest_counter_offer_amount: latest_counter_offer_amount,
        price: price,
        listing: listing,
        buyerName: buyerName,
      });
    });
  },
  validateCounterOffer: function(){
    var thread = this.state.thread;
    var counter_offer = this.state.counter_offer ? parseFloat(this.state.counter_offer.replace("$", "").replace(",", ""), 10) : 0;
    var latest_counter_offer_amount = this.state.latest_counter_offer_amount;
    var listing = this.state.listing;
    var price = this.state.price;
    if(!counter_offer){
      return "You must enter an amount for your counter-offer.";
    }
    if (latest_counter_offer_amount){
      if(counter_offer && counter_offer > (latest_counter_offer_amount - 50)){
        this.setState({
          counter_offer: this.formatMoney(latest_counter_offer_amount - 50),
        });
        return "Your counter-offer must be at least $50 less than your previous counter-offer of " + this.formatMoney(latest_counter_offer_amount);
      }
    }
    if(counter_offer && counter_offer > price){
      this.setState({
        counter_offer: this.formatMoney(price),
      });
      return "The highest you can counter-offer is " + this.formatMoney(price) + ", the asking price for the vehicle.";
    }
    return false;
  },
  onConfirm: function(){
    var component = this;
    var thread = this.state.thread;
    var latest_offer_amount = this.state.latest_offer_amount;
    var listing = this.state.listing;
    var price = this.state.price;

    if(listing && thread){
      if(listing.sold || listing.pending_transaction){
        Alert.alert("Notice", "This vehicle is already sold or is pending sale, therefore you cannot counter-offer. If you think this is an error, please contact us for help.", [
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
        var error = this.validateCounterOffer();
        if(error){
          Alert.alert("Uh Oh...", error, [
            {text: "Fix", onPress: () => {
                setTimeout(() =>{
                  component.refs['counterOffer'].focus()
                }, 250);
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
        } else {
          Alert.alert("Confirm Counter-Offer", "This counter-offer of " + this.formatMoney(this.state.counter_offer) + " will be submitted immediately and not accepting responsibility for your counter-offer might block you from using TRED in the future.", [
            {text: "Yes, Counter-Offer", onPress: () => {
                var counter_offer = this.state.counter_offer ? parseFloat(this.state.counter_offer.replace("$", "").replace(",", ""), 10) : 0;
                talkService.sendToThread(thread.id, "counter_offer", {offer: counter_offer}).then(function(){
                  Alert.alert("Congrats", "Your counter-offer was sent successfully. We’ll notify you as soon as the potential buyer responds.", [
                    {text: "Ok", onPress: () => {
                      component.props.navigator.replacePrevious({
                        id: "Listing",
                        name: "Listing",
                        vin: component.state.listing.vin,
                        initialTab: "offers",
                      });
                      component.props.navigator.pop();                  
                    }}
                  ]);
                }, function(){
                  Alert.alert("Uh Oh...", "An error occured sending your counter-offer. Please try again later or contact us for help.", [
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
            {text: "No, Change It"},
          ]);
        }
      }
    }
  },
  render: function() {
    if(this.state.thread && this.state.seller_id && this.state.user_id && this.state.seller_id === this.state.user_id){
      var thread = this.state.thread;
      var latest_offer_amount = this.state.latest_offer_amount;
      var listing = this.state.listing;
      var price = this.state.price;

      if(latest_offer_amount && price && listing){
        return (
          <View style={[styles.main, {paddingBottom:48}]}>
            <KeyboardHandler ref='kh' offset={120}>
              <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
                <Text style={styles.cameraTitle}>MAKE A COUNTER-OFFER</Text>
                <Text style={styles.subText}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)} </Text>
                <Text style={[styles.pText, {marginTop:5}]}>
                  If you aren&apos;t satisfied with {this.state.buyerName ? this.state.buyerName + "'s" : "this buyer's"} offer of <Text style={{fontWeight: 'bold'}}>{this.formatMoney(latest_offer_amount)}</Text>, enter your counter-offer here and we’ll pass it along to them for their approval immediately. We’ll pass along their response the moment they share it with us.
                </Text>
                <Text style={[styles.pText, {marginTop:10}]}>
                  Note: even if this offer is far below your expectations, you should place a counter-offer because this buyer might increase their offer.
                </Text>
                <View ref="offerInput" style={[styles.formField, {marginTop:10}]}>
                  <Text style={[styles.label, {textAlign:  Platform.OS === 'android' ? null : 'center'}]}>Enter Your Counter-Offer</Text>
                  <TextInput
                    ref="counterOffer"
                    enablesReturnKeyAutomatically={true}
                    keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                    style={[styles.textInput, {textAlign: Platform.OS === 'android' ? null : 'center', fontSize:30, height:52}]}
                    onChangeText={this.onChangeOffer}
                    value={this.state.counter_offer}
                    onFocus={()=>{
                      this.setState({
                        enableInputAccessory: true,
                      });
                      this.refs['kh'].inputFocused(this,'counterOffer');
                    }}
                    onBlur={()=>{
                      this.setState({
                        enableInputAccessory: false,
                      });
                    }}
                    maxLength={8}
                    textAlign="center" />
                </View>
                <View ref="extra" style={{height:30}}></View>
              </View>
            </KeyboardHandler>
            <View style={styles.bottom}>
              <View style={styles.stretch}>
                <View style={styles.formField}>
                  <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText}>
                    COUNTER-OFFER
                  </Button>
                </View>
              </View>
            </View>
            <InputAccessory buttonText='Done' onPress={() => {this.refs.counterOffer.blur();}} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory}/>
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
module.exports = CounterOffer;
