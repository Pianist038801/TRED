/**
 * TRED Offer Layout
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
var talkService = require('../../services/talk.service');
var userService = require('../../services/user.service');
var utils = require('../../services/utils');
var moment = require('moment-timezone');
var Icon = require('react-native-vector-icons/FontAwesome');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var Offer = React.createClass({
  getDefaultProps: function(){
    return {
      thread_id: null,
    }
  },
  getInitialState: function(){
    var threadDS = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      (r1, r2) => r1 != r2
    }});
    return {
      thread_id: null,
      threadDataSource: threadDS.cloneWithRows([]),  
      initialized: false,    
      counterDisabled: false,
      acceptDisabled: false,
      isRefreshing: false,
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
    this.setState({isRefreshing: true});
    var component = this;
    component.setState({
      initialized: false,
      threadDataSource: component.state.threadDataSource.cloneWithRows([]),      
    });
    var thread = null;
    return talkService.getOffer(component.props.thread_id, true).then(function(_thread){
      thread = _thread;
      return userService.get();
    }).then(function(user) {
      var deposit_made = false;
      for(var i = 0; i < thread.messages.length; i++) {
        if(thread.messages[i].type === "deposit") {
          deposit_made = true;
          break;
        }
      }
      var accepted_offer_amount;
      for(var i = 0; i < thread.messages.length; i++) {
        if(thread.messages[i].type === "accept_offer") {
          accepted_offer_amount = parseInt(thread.messages[i].versions[0].offer, 10);
          break;
        }
      }
      var accepted_counter_offer_amount;
      for(var i = 0; i < thread.messages.length; i++) {
        if(thread.messages[i].type === "accept_counter_offer") {
          accepted_counter_offer_amount = parseInt(thread.messages[i].versions[0].offer, 10);
          break;
        }
      }
      if(deposit_made || accepted_offer_amount || accepted_counter_offer_amount){
        component.setState({
          acceptDisabled: true,
          counterDisabled: true,
        });      
      }
      component.setState({
        isRefreshing: false,
        initialized: true,
        thread: thread,
        threadDataSource: component.state.threadDataSource.cloneWithRows(thread.messages),      
      });
    });
  },
  onAcceptOffer: function(){
    var component = this;
    if(this.state.acceptDisabled || this.state.counterDisabled){
      Alert.alert("Whoops", "An offer was already accepted so you cannot accept this offer at this time. Contact us if you need help.", [
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
      if(this.props.thread_id){
        this.props.navigator.push({
          id: "AcceptOffer",
          name: "Accept Offer",
          thread_id: this.props.thread_id,
        });    
      } else {
        Alert.alert("Uh Oh...", "Somthing went wrong with this offer. Please contact us for help.", [
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
    }
  },
  onCounterOffer: function(){
    var component = this;
    if(this.state.acceptDisabled || this.state.counterDisabled){
      Alert.alert("Whoops", "An offer was already accepted so you cannot counter-offer at this time. Contact us if you need help.", [
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
      if(this.props.thread_id){
        this.props.navigator.push({
          id: "CounterOffer",
          name: "Counter Offer",
          thread_id: this.props.thread_id,
        });    
      } else {
        Alert.alert("Uh Oh...", "Somthing went wrong with this offer. Please contact us for help.", [
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
    }
  },
  render: function() {
    if(this.state.thread_id && this.state.thread){
      var thread = this.state.thread;
      var listing = (typeof thread.listing !== 'undefined' && thread.listing) ? thread.listing : null;
      var buyerName = null;
      if(thread.users && thread.metadata && thread.metadata.buyer_id && thread.users[thread.metadata.buyer_id] && thread.users[thread.metadata.buyer_id].first_name){
        buyerName = thread.users[thread.metadata.buyer_id].first_name.toUpperCase() + "'S";
      }
      return (
        <View style={[styles.main, {paddingBottom:48}]}>
          <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
            <Text style={styles.cameraTitle}>{buyerName ? buyerName : ""} OFFER HISTORY</Text>
            <Text style={[styles.subText, {marginBottom:10}]}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)}</Text>
            <Text style={[styles.subText, {marginTop:0}]}>View the history of offers and accept the latest offer or make a counter-offer. </Text>
            <View style={[styles.scroll, styles.listViewBackground]}>
              {this.state.thread ?
                <View style={{flex:1}}>
                  {this.state.thread.messages ?
                    <ListView
                      dataSource={this.state.threadDataSource}
                      renderScrollComponent={props => 
                        <ScrollView
                          style={styles.scroll}
                          refreshControl={
                            <RefreshControl
                              refreshing={this.state.isRefreshing}
                              onRefresh={this.loadThread}
                              tintColor="#364347"
                              title="LOADING OFFERS..."
                              colors={['#fff', '#fff', '#fff']}
                              progressBackgroundColor="#02BAF2"
                            />
                          } />
                      }

                      renderRow={(rowData, sectionID, rowID) => 
                        { 
                          var messageText = '';
                          var messageDate = moment(rowData.created).tz(moment.tz.guess()).format('MMM Do, YYYY h:mma z');
                          var messageDateHuman = moment(rowData.created).tz(moment.tz.guess()).fromNow();
                          var messageTextStyle = styles.greyMessageListViewText;
                          var version = rowData.versions[rowData.versions.length - 1];
                          var displayName = "Unknown";
                          var users = this.state.thread.users;
                          var self = this.state.thread.self;
                          var metadata = this.state.thread.metadata;
                          var sender = (typeof self !== "undefined" && (self.id === rowData.sender_id)) ? self : users[rowData.sender_id];

                          if(rowData.type === "offer" || rowData.type === "counter_offer" || rowData.type === "stick_offer" || rowData.type === "stick_counter_offer" || rowData.type === "accept_offer" || rowData.type === "accept_counter_offer"  || rowData.type === "deposit" ) {
                            displayName = "Other party";
                          }  
                          if(typeof self !== "undefined" && rowData.sender_id == self.id) { 
                            if(self.is_admin || self.is_dealer) {
                              displayName = self.displayName ? self.displayName : "You";
                              if(rowData.type === "offer" || rowData.type === "counter_offer" || rowData.type === "stick_offer" || rowData.type === "stick_counter_offer" || rowData.type === "accept_offer" || rowData.type === "accept_counter_offer" || rowData.type === "deposit" ) {
                                displayName = "You";
                              }  
                            } else {
                              displayName = self.first_name ? self.first_name : "You";
                              if(rowData.type === "offer" || rowData.type === "counter_offer" || rowData.type === "stick_offer" || rowData.type === "stick_counter_offer" || rowData.type === "accept_offer" || rowData.type === "accept_counter_offer" || rowData.type === "deposit" ) {
                                displayName = "You";
                              }  
                            }
                          } else {
                            if(users[rowData.sender_id]) {
                              displayName = users[rowData.sender_id].first_name ? users[rowData.sender_id].first_name : "Website Visitor";
                              if(rowData.type === "offer" || rowData.type === "stick_offer" || rowData.type === "accept_counter_offer" || rowData.type === "deposit" ) {
                                if(users && metadata && metadata.buyer_id && users[metadata.buyer_id] && users[metadata.buyer_id].first_name){
                                  displayName = users[metadata.buyer_id].first_name;
                                } else {
                                  displayName = "Buyer";
                                }
                              } else if(rowData.type === "counter_offer" || rowData.type === "stick_counter_offer" || rowData.type === "accept_offer" || rowData.type === "deposit" ){
                                displayName = "Seller";
                              } 
                            }
                          }
                          displayName = utils.capitalizeAllWords(displayName);                        

                          var iconColor = "#364347";
                          var iconName = "question-circle"
                          if(rowData.type === "offer") {
                            if(sender) {
                              messageText = displayName + ' offered ' + this.formatMoney(parseInt(version.offer, 10));
                              messageTextStyle = styles.orangeMessageListViewText;
                              iconColor = "#E96300";
                              iconName = "money";
                            }
                          } else if(rowData.type === "counter_offer") { 
                            if(sender) {
                              messageText = displayName + ' counter-offered ' + this.formatMoney(parseInt(version.offer, 10));
                              messageTextStyle = styles.greenMessageListViewText;
                              iconColor = "#28948C";
                              iconName = "money";
                            }
                          } else if(rowData.type === "stick_offer") {
                            if(sender) {
                              messageText = displayName + ' held at ' + this.formatMoney(parseInt(version.offer, 10));
                              messageTextStyle = styles.orangeMessageListViewText;
                              iconColor = "#E96300";
                              iconName = "money";
                            }
                          } else if(rowData.type === "stick_counter_offer") {
                            if(sender) {
                              messageText = displayName + ' held at ' + this.formatMoney(parseInt(version.offer, 10));
                              messageTextStyle = styles.greenMessageListViewText;
                              iconColor = "#28948C";
                              iconName = "money";
                            }
                          } else if(rowData.type === "accept_offer") {
                            if(sender) {
                              messageText = displayName + '  accepted the offer of ' + this.formatMoney(parseInt(version.offer, 10));
                              messageTextStyle = styles.greenMessageListViewText;
                              iconColor = "#28948C";
                              iconName = "check-circle";
                            }
                          } else if(rowData.type === "accept_counter_offer") {
                            if(sender) {
                              messageText = displayName + '  accepted the counter-offer of ' + this.formatMoney(parseInt(version.offer, 10));
                              messageTextStyle = styles.orangeMessageListViewText;
                              iconColor = "#E96300";
                              iconName = "check-circle";
                          }
                          } else if(rowData.type === "deposit") {
                            if(sender) {
                              messageText = displayName + ' placed a deposit.';
                              messageTextStyle = styles.orangeMessageListViewText;
                              iconColor = "#E96300";
                              iconName = "lock";
                            }
                          } else {
                            messageText = "Oops, offer not available."
                          }

                          return <View>
                            <View style={[styles.listViewRow, {justifyContent: 'flex-start'}]}>
                              <Icon name={iconName} size={32} color={iconColor} style={{paddingRight:15}} />
                              <Text style={styles.offerListViewText, messageTextStyle}>
                                {messageText}
                                {'\n'}
                                <Text style={styles.greyOfferListViewTextSmall}>{messageDate} ({messageDateHuman})</Text>
                              </Text>
                            </View>
                            <View style={styles.separator} />
                          </View>;
                      }
                    } />
                  :
                    <View>
                      <Text style={styles.listViewError}>NO OFFERS FOUND FOR THIS BUYER.</Text>
                    </View>                  
                  }
                </View>
              :
                <View>
                  <Text style={styles.listViewError}>LOADING OFFERS...</Text>
                </View>              
              }
            </View>
          </View>
          <View style={styles.bottom}>
            <View style={styles.stretch}>
              <View style={styles.formFieldHorizontal}>
                <Button onPress={this.onAcceptOffer} style={[styles.secondaryButton, styles.left, {flex:1, marginLeft:15}]} textStyle={styles.buttonTextSmall}>
                  ACCEPT OFFER
                </Button>
                <Button style={[styles.actionButton, styles.right, {flex:1, marginRight:15}]} textStyle={styles.buttonTextSmall} onPress={this.onCounterOffer}>
                  COUNTER-OFFER
                </Button>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{flex:1}}>
          <Text style={[styles.pText, {marginTop:15, textAlign:'center'}]}>This offer was not found.</Text>
        </View>
      );      
    }
  }
});
module.exports = Offer;
