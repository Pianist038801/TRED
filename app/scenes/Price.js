/**
 * TRED Price Screen Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
 */
'use strict';

var React = require('react-native');
var {
  View,
  Text,
  TextInput,
  Platform,
  Alert,
} = React;
var Button = require('apsl-react-native-button');
var KeyboardHandler = require('../components/KeyboardHandler.js');
var InputAccessory = require('../components/InputAccessory.js');
var LoadingOverlay = require('../components/LoadingOverlay');
var LocalStorage = require('../services/localStorage.service.js');
var analytics = require('../services/analytics.service');
var priceService = require('../services/price.service');
var utils = require('../services/utils');
var sentry = require('../services/sentry.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var NextSteps = React.createClass({
  getInitialState: function(){
    return {
      disabled: false,
      enableInputAccessory: false,
      price: null,
      suggestedStartingPrice: null,
      privatePartyPrice: null,
      tradeInPrice: null,
      showInput: false,
      priceError: false,
      loading:true,
    }
  },
  componentDidMount: function(){
    analytics.visited('Price');
    var listing;
    return LocalStorage.wip.listing.get()
      .then((_listing) => {
        listing = _listing;
        return priceService.get(listing.vin, listing.style_id, listing.day_zip || '98122', parseInt(listing.mileage ? listing.mileage.replace(',', '') : 0), listing.option_ids || []);
      })
      .then((result) => {
        var values = result.values;
        if (!values.tred.suggestedStarting) {
          throw new Error('Suggested Starting Price could not be calculated.');
        }
        var start = values.tred.suggestedStarting;
        var privateParty = values.kbb.privatePartyGood || (values.edmunds && values.edmunds.usedPrivateParty);
        var trade = values.kbb.tradeInFair || values.kbb.auctionFair || (values.edmunds && values.edmunds.usedTradeIn);
        var privateFlex = Math.max(Math.round((((privateParty * 100) / start) / 100) * 100) / 100, .90);
        var tradeFlex = Math.max(Math.round((((trade * 100) / start) / 100) * 100) / 100, .80);

        this.setState({
          priceError: false,
          price: this.formatMoney(start),
          suggestedStartingPrice: this.formatMoney(start),
          privatePartyPrice: this.formatMoney(privateParty),
          tradeInPrice: this.formatMoney(trade),
          privateFlex: privateFlex,
          tradeFlex: tradeFlex,
        });
      })
      .catch((e) => {
        alert('Sorry! We couldn\'t get any pricing data for your vehicle at this time. Go ahead and set your starting price and we\'ll be in touch.');
        sentry.captureException(e, {vin: listing && listing.vin, style_id: listing && listing.style_id});
        this.setState({
          priceError: true,
          showInput: true,
        });
      })
      .finally((e) => {
        this.setState({'loading': false});
      })
    ;
  },
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  onChangePrice: function(value){
    value = value.toString();
    value = value.replace(/[^0-9]/g, '');
    var num = value.replace(/,/gi, '');
    var num2 = num.replace(/\d(?=(?:\d{3})+$)/g, '$&,');
    this.setState({
      price: '$' + num2
    });
  },
  showInputForm: function(){
    this.setState({
      showInput: true,
    });
    this.refs.price.focus();
  },
  setRecommendedPrice: function(){
    this.setState({
      showInput: false,
      price: this.state.suggestedStartingPrice
    });    
  },
  hasErrors: function(){
    var error = null;
    if(!utils.moneyToInt(this.state.price)) {
      error = {msg:"You're missing your starting list price.", field:"price"};
    }
    return error;
  },
  onConfirm: function(){
    var component = this;
    this.setState({disabled: true});
    var error = this.hasErrors();
    if (!error) {
      return LocalStorage.wip.listing.update({
        price: utils.moneyToInt(component.state.price),
        suggested_starting_price: utils.moneyToInt(component.state.suggestedStartingPrice),
      }).then(function(){
        component.setState({disabled: false});
        component.props.navigator.push({
          id: 'Agreements',
          name: 'Agreements',
        });
      });
    } else {
      component.setState({disabled: false});
      Alert.alert("Uh Oh...", error.msg, [
        {text: "Fix", onPress: () => {
          setTimeout(() =>{
            component.refs[error.field].focus()
          }, 250);
        }
        }
      ]);
    }
  },
  render: function() {
    if(this.state.loading){
      return (
        <View style={styles.main}>
          <KeyboardHandler ref='kh' offset={120}>
            <View style={[styles.content, {paddingHorizontal:0}]}>
              <Text style={{color:"white", textAlign:'center'}}>Retrieving pricing data...</Text>              
            </View>
          </KeyboardHandler>
        </View>
      );
    } else {
      return (
        <View style={styles.main}>
          <KeyboardHandler ref='kh' offset={120}>
            <View style={[styles.content, {paddingHorizontal:0}]}>
              { this.state.suggestedStartingPrice ? 
                <View>
                  <Text style={[styles.cameraTitle]}>RECOMMENDED PRICE</Text>
                  <View style={[styles.chart]}>
                    <View style={[styles.chartRow]}>
                      <View style={[styles.chartGreen, {flex:1}]}>
                        <View style={{flex:1, flexDirection:'row'}}>
                          <Text style={[styles.tableText, {flex:.75, color:'white'}]}>TRED Recommended Price&nbsp;</Text>
                          <Text style={[styles.tableText, {flex:.25, fontWeight:'bold', color:'white', textAlign:'right'}]}>{this.state.suggestedStartingPrice}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.chartRow]}>
                      <View style={[styles.chartBlue, {flex:this.state.privateFlex}]}>
                        <View style={{flex:1, flexDirection:'row'}}>
                          <Text style={[styles.tableText, {flex:.75, color:'white'}]}>Craigslist Private Party Price&nbsp;</Text>
                          <Text style={[styles.tableText, {flex:.25, fontWeight:'bold', color:'white', textAlign:'right'}]}>{this.state.privatePartyPrice}</Text>
                        </View>
                      </View>
                      <View style={{flex: (1 - this.state.privateFlex)}}></View>
                    </View>
                    <View style={[styles.chartRow]}>
                      <View style={[styles.chartPurple, {flex:this.state.tradeFlex}]}>
                        <View style={{flex:1, flexDirection:'row'}}>
                          <Text style={[styles.tableText, {flex:.75, color:'white'}]}>Dealer Trade In Price&nbsp;</Text>
                          <Text style={[styles.tableText, {flex:.25, fontWeight:'bold', color:'white', textAlign:'right'}]}>{this.state.tradeInPrice}</Text>
                        </View>
                      </View>
                      <View style={{flex: (1 - this.state.tradeFlex)}}></View>
                    </View>
                    <Text style={[styles.pText, styles.finePrint, {paddingHorizontal:5, marginBottom:5}]}>
                      Based on local pricing data powered by TRED, KBB and CarGurus.
                    </Text>
                  </View>

                  <View style={[styles.table, {marginTop:5}]}>
                    <View style={[styles.tableRow]}>
                      <View style={styles.tableCol75}>
                        <Text style={[styles.tableText]}>Estimated Time To Sell</Text>
                      </View>
                      <View style={styles.tableCol25}>
                        <Text style={[styles.tableText, {fontWeight:'bold', textAlign:'right'}]}>16 days</Text>
                      </View>
                    </View>
                    <View style={[styles.tableRow, styles.tableBottom]}>
                      <View style={styles.tableCol75}>
                        <Text style={[styles.tableText]}>Estimated Test Drives</Text>
                      </View>
                      <View style={styles.tableCol25}>
                        <Text style={[styles.tableText, {fontWeight:'bold', textAlign:'right'}]}>1.2</Text>
                      </View>
                    </View>
                  </View>
                </View>
              : 
                null
              }
              <View>
                <Text style={[styles.cameraTitle, {marginTop:25, marginBottom:0}]}>YOUR STARTING LIST PRICE</Text>
                { !this.state.showInput ?
                  <View>
                    <Text style={[styles.pText, styles.priceText]}>
                      {this.state.suggestedStartingPrice}
                    </Text>
                    <Text style={[styles.pText, {fontSize:16, lineHeight:16, marginTop:0, marginBottom:15}]}> (Recommended)</Text>
                  </View> : null
                }
                { this.state.showInput ?
                  <View ref="priceInput" style={[styles.formField]}>
                    <TextInput
                      ref="price"
                      enablesReturnKeyAutomatically={true}
                      keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                      style={[styles.textInput, {textAlign: Platform.OS === 'android' ? null : 'center', fontSize:30, height:52}]}
                      onChangeText={this.onChangePrice}
                      value={this.state.price}
                      placeholder={this.state.suggestedStartingPrice}
                      onFocus={()=>{
                        this.setState({
                          enableInputAccessory: true,
                        });
                        this.refs['kh'].inputFocused(this,'price');
                      }}
                      onBlur={()=>{
                        this.setState({
                          enableInputAccessory: false,
                        });
                      }}
                      maxLength={8}
                      textAlign="center" />
                  </View> : null
                }
              </View> 
              { !this.state.showInput ?
                <Button onPress={this.showInputForm} style={[styles.normalButton, {marginTop:0}]} textStyle={styles.normalButtonText} isDisabled={this.state.disabled}>
                  SET A HIGHER PRICE
                </Button> : null
              }
              { this.state.showInput && !this.state.priceError ?
                <Button onPress={this.setRecommendedPrice} style={[styles.normalButton, {marginTop:10}]} textStyle={styles.normalButtonText} isDisabled={this.state.disabled}>
                  USE TRED RECOMMENDED PRICE
                </Button> : null
              }
              <View ref="extra" style={{height:60}}></View>
            </View>
          </KeyboardHandler>
          <View style={styles.bottom}>
            <View style={styles.stretch}>
              <View style={styles.formField}>
                <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText} isDisabled={this.state.disabled}>
                  SUBMIT
                </Button>
              </View>
            </View>
          </View>
          <InputAccessory buttonText='Done' onPress={() => {this.refs.price.blur();}} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory}/>
        </View>
      );
    }
  },
});

module.exports = NextSteps;
