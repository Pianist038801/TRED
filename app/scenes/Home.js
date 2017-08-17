/**
 * TRED Home Screen Component
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
  TextInput,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
  Linking,
} = React;
var Button = require('apsl-react-native-button');
var localStorage = require('../services/localStorage.service.js');
var KeyboardHandler = require('../components/KeyboardHandler.js');
var InputAccessory = require('../components/InputAccessory.js');
var analytics = require('../services/analytics.service');
var notifications = require('../services/notification.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var zips = ["98001","98002","98003","98004","98005","98006","98007","98008","98009","98011","98012","98015","98020","98021","98023","98024","98026","98027","98028","98029","98030","98031","98032","98033","98034","98036","98037","98038","98039","98040","98041","98043","98047","98052","98053","98054","98055","98056","98057","98058","98059","98062","98065","98068","98072","98073","98074","98075","98077","98083","98087","98101","98102","98103","98104","98105","98106","98107","98108","98109","98111","98112","98114","98115","98116","98117","98118","98119","98121","98122","98124","98125","98126","98131","98132","98133","98134","98136","98138","98144","98145","98146","98148","98154","98155","98158","98160","98161","98164","98166","98168","98171","98174","98177","98178","98188","98198","98199","98201","98203","98204","98208","98205","98258","98270","98275","98290","98296","98354","98372","98421","98422","98424"];

var Home = React.createClass({
  getInitialState: function(){
    return {
      zip: null,
      enableInputAccessory: false,
    };
  },
  componentDidMount: function(){
    analytics.visited('Home');
    return localStorage.wip.user.get().then((user) => {
      if (user && user.zip) {
        this.setState({
          zip: user.zip
        });
      }
    });
  },
  gotoBuy: function(){
    analytics.track('Clicked Buy Cars');
    var url = "https://www.tred.com/buy";
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
    });
  },
  validateZip: function(zip){
    if(typeof zip !== 'undefined' && zip && zip.length > 0 && zips.indexOf(zip) == -1) {
      return false;
    }
    return true;
  },
  onConfirm: function(e) {
    var component = this;
    this.setState({
      enableInputAccessory: false,
    });
    component.refs['zip'].blur();

    if(!this.state.zip || this.state.zip.length < 5){
      Alert.alert("Uh Oh...", 'Please enter a valid zip code to continue.', [
        {text: "Fix", onPress: () => {
            setTimeout(() =>{
              component.refs['zip'].focus();
            }, 250);
          }
        }
      ]);
       return;
    }
    if(this.validateZip(this.state.zip)){
      localStorage.wip.user.upsert({ zip: this.state.zip }).then(() => {
        notifications.scheduleSellReminder();
        component.props.navigator.push({
          id: 'SellHIWOne',
          name: 'Sell How It Works 1',
        });
      });
    } else {
      Alert.alert("Don't Hate Us...", "Sorry, we're not serving your area quite yet, but we're coming soon!", [
        {text: "OK", onPress: () => {
            setTimeout(() =>{
              component.refs['zip'].focus();
            }, 50);
          }
        },
        {text: "Contact Us", onPress: () => {
            component.refs['zip'].focus();
            component.props.navigator.push({
              id: 'Support',
              name: 'Support',
            });
          }
        },
      ]);
    }
  },
  render: function() {
    return (
      <View style={[styles.main, styles.home]}>
        <KeyboardHandler ref='kh' offset={60} style={styles.scroll}>
          <View style={[styles.content, styles.home]}>
            <View style={styles.center}>
              <Image 
                source={require('../../images/logo.png')}
                style={styles.logo} />
              <Text style={[styles.pText, {fontSize:22, lineHeight:28}]}>Sell my car for more.</Text>
              <Image 
                source={require('../../images/home.png')}
                style={[styles.hiwImage, {marginVertical:20}]} />
            </View>
            <View style={[styles.formField, {marginTop: 10}]}>
               <Text style={[styles.label, {textAlign:  Platform.OS === 'android' ? null : 'center'}]}>Enter Your Zip Code</Text>
              <TextInput
                ref="zip"
                enablesReturnKeyAutomatically={true}
                keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                style={[styles.textInput, {textAlign: Platform.OS === 'android' ? null : 'center', fontSize:30, height:52}]}
                onChangeText={(zip) => this.setState({zip})}
                value={this.state.zip}
                onFocus={()=>{
                  this.setState({
                    enableInputAccessory: true,
                  });
                  this.refs['kh'].inputFocused(this,'zip');
                }}
                onBlur={()=>{
                  this.setState({
                    enableInputAccessory: false,
                  });
                }}
                maxLength={5}
                textAlign="center" />
                <TouchableOpacity onPress={this.gotoBuy}>
                  <Text style={[styles.buyText, {textAlign:'center'}]}>Looking for cars to buy? Click here.</Text>
                </TouchableOpacity>
            </View>
          </View>
        </KeyboardHandler>
        <View style={styles.bottom}>
          <View style={styles.stretch}>
            <View style={styles.formField}>
              <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText}>
                LET&apos;S GO
              </Button>
            </View>
          </View>
        </View>

        <InputAccessory buttonText="Let's Go" onPress={this.onConfirm} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory}/>
      </View>
    );
  }
});

module.exports = Home;
