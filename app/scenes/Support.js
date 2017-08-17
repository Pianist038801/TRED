/**
 * TRED Log In Screen Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
 */
'use strict';

var React = require('react-native');
var Button = require('apsl-react-native-button');
var {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  Linking
} = React;
var localStorage = require('../services/localStorage.service');
var Intercom = require('react-native-intercom');
var analytics = require('../services/analytics.service');
var authService = require('../services/auth.service');
var navigationService = require('../services/navigation.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var Support = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false,
    };
  },
  componentDidMount: function() {
    analytics.visited('Support');
    var component = this;
    authService.isLoggedIn().then(function(loggedInUser) {
      component.setState({
        loggedIn: !!loggedInUser,
      });
    });
  },
  onPhone: function(){
    var url = "tel:18557958733";
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
    });
  },
  onEmail: function(){
    var url = "mailto:help@tred.com";
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
    });
  },
  onIntercom: function(){
    if(Platform.OS === 'android'){
      Intercom.registerUnidentifiedUser();
    } 
    Intercom.displayMessageComposer();
  },
  showLogin: function(){
    navigationService.showLogin(this.onLogin);    
  },
  onLogin: function(){
    this.setState({
      loggedIn: true,
    });
  },
  logout: async function() {
    try {
      await authService.logout();
      analytics.track('Logged Out');
      this.setState(this.getInitialState());
      this.props.navigator.push({
        id: 'Home',
        name: 'Home',
      });      
    } catch(err) {
      alert(err);
    }
  },
  showTOS: function(){
    this.props.navigator.push({
      id: "TermsOfUse",
      name: "Terms Of Use",
    });
  },
  showPrivacy: function(){
    this.props.navigator.push({
      id: "Privacy",
      name: "Privacy Policy",
    });
  },
  showAbout: function(){
   this.props.navigator.push({
      id: "AboutTredApp",
      name: "About Tred App",
    });
  },
  render: function() {
    var component = this;
    return (
      <View style={{flex:1}}>
        <View style={[styles.main, {paddingBottom:0}]}>
          <ScrollView style={styles.scroll}>
            <View style={styles.content}>
              <Text style={styles.titleText}>SUPPORT</Text>
              <Text style={[styles.subText, {marginTop:0}]}>We&apos;re here to help.</Text>
              <View style={styles.innerContainer}>
                <Image 
                  source={require('../../images/support.gif')}
                  style={[styles.supportImage, {marginVertical:5}]} />
              </View>
              <View style={{marginHorizontal:15}}>
                <Button onPress={component.onPhone} style={[styles.actionButton, {marginVertical:5, marginTop:10}]} textStyle={styles.supportButtonText}>
                  PHONE - (855) 795-8733
                </Button>
                <Button onPress={component.onEmail} style={[styles.tertiaryButton, {marginVertical:5, marginTop:0}]} textStyle={styles.supportButtonText}>
                  EMAIL - HELP@TRED.COM
                </Button>
                <Button onPress={component.onIntercom} style={[styles.secondaryButton, {marginVertical:5,marginTop:0}]} textStyle={styles.supportButtonText}>
                  CHAT ONLINE NOW
                </Button>
                {this.state.loggedIn ?
                  <Button onPress={component.logout} style={[styles.darkBlueButton, {marginVertical:5,marginTop:0}]} textStyle={styles.supportButtonText}>
                    SIGN OUT OF TRED
                  </Button>
                :
                  <Button onPress={component.showLogin} style={[styles.darkBlueButton, {marginVertical:5,marginTop:0}]} textStyle={styles.supportButtonText}>
                    SIGN IN TO TRED
                  </Button>
                }
                <View style={{flex:1, flexDirection: "row", alignItems: "stretch", justifyContent:"center", marginBottom:30}}>
                  <TouchableOpacity onPress={component.showTOS}>           
                    <Text style={[styles.actionLinkSmall, {marginHorizontal:15, marginTop:15, textAlign:'center'}]}>
                      Terms of Use
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={component.showPrivacy}>           
                    <Text style={[styles.actionLinkSmall, {marginHorizontal:15, marginTop:15, textAlign:'center'}]}>
                      Privacy Policy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={component.showAbout}>
                    <Text style={[styles.actionLinkSmall, {marginHorizontal:15, marginTop:15, textAlign:'center'}]}>
                      About
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
});

module.exports = Support;
