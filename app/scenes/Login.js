/**
 * TRED Log In Screen Component
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
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} = React;
var Button = require('apsl-react-native-button');
var KeyboardHandler = require('../components/KeyboardHandler');
var localStorage = require('../services/localStorage.service');
var LoadingOverlay = require('../components/LoadingOverlay');
var authService = require('../services/auth.service');
var userService = require('../services/user.service');
var analytics = require('../services/analytics.service');
var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var LogIn = React.createClass({
  getInitialState: function(){
    return {
      loginModalVisible: false,
      isLoggingIn: false,
      isLoggedIn: false,
      email: null,
      login_password: null
    }
  },
  componentDidMount: function(){
    var component = this;
    localStorage.get('email')
      .then((email) => {
        if (email) {
          component.setState({
            email
          });
        }
      });
    userService.get()
      .then((user) => {
        component.setState({
          loggedIn: !!user.id
        });
      });
  },
  goHome: function(){
    this.props.navigator.push({
      id: 'Home',
      name: 'Home',
    });
  },
  goToRoute: function(){
    this.props.navigator.replacePrevious(this.props.callbackRoute);
    this.props.navigator.pop();
  },
  login: async function() {
    var component = this;
    this.setState({
      isLoggingIn: true
    });
    try {
      var user = await authService.login(this.state.email, this.state.login_password);
      this.setState({
        isLoggedIn: true,
        isLoggingIn: false
      });
      analytics.track('Logged In');
      if (this.props.onLogin) {
        this.props.onLogin(user);
      }
      this.goToRoute();
    } catch(err) {
      Alert.alert('Uh Oh', 'We were not able to sign you in. Check your email address and password and try again. Please contact us if you need help.', [
        {text: "OK"},
      ]);
      this.setState({
        isLoggedIn: false,
        isLoggingIn: false
      });
    }
  },
  onForgotPassword: function(){
    var url = 'https://www.tred.com/forgot';
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
    });
  },
  render: function() {
    var component = this;
    var paddingTop = 75;
    if(Platform.OS === 'android'){
      paddingTop = 55;
    }
    return (
      <View style={[styles.main, {paddingTop:paddingTop}]}>
        <KeyboardHandler ref='khModal' offset={125}>
          <View style={[styles.content, {paddingHorizontal:0}]}>
            <Text style={[styles.titleText]}>SIGN IN</Text>
            <Text style={[styles.subText, {marginTop:0} ]}>Sign in to your existing TRED account.</Text>
            <View style={[styles.hiwImageContainer, {marginVertical: 0}]}>
              <Image 
                source={require('../../images/key.png')}
                style={styles.hiwSmallImage} />
            </View>                    
            <View style={styles.formField}>
              <Text style={[styles.label]}>Email</Text>
              <TextInput
                ref="login_email"
                returnKeyType='next'
                style={[styles.textInput]}
                enablesReturnKeyAutomatically={true}
                selectTextOnFocus={true}
                autoFocus={true}
                onChangeText={(email) => this.setState({email})}
                value={this.state.email}
                keyboardType="email-address"
                autoCapitalize='none'
                autoCorrect={false} 
                onSubmitEditing={() => {this.refs.login_password.focus();}}
                onFocus={()=>this.refs['khModal'].inputFocused(this,'login_email')} />
              
              <Text style={[styles.label]}>Password</Text>
              <TextInput
                ref="login_password"
                returnKeyType='done'
                style={[styles.textInput]}
                enablesReturnKeyAutomatically={true}
                selectTextOnFocus={true}
                onChangeText={(login_password) => this.setState({login_password})}
                value={this.state.login_password}
                secureTextEntry={true}
                autoCapitalize='none'
                autoCorrect={false}
                onSubmitEditing={this.login}
                onFocus={()=>this.refs['khModal'].inputFocused(this,'login_password')} />
                <TouchableOpacity onPress={this.onForgotPassword} >
                  <Text style={[styles.actionLinkSmall, {marginTop:15, textAlign:'center'}]}>Forgot Your Password?</Text>
                </TouchableOpacity>
            </View>
          </View>
        </KeyboardHandler>
        <View style={[styles.bottom]}>
          <View style={styles.stretch}>
            <View style={styles.formFieldHorizontal}>
              { this.props.goHome ?
                <Button onPress={this.goHome} style={[styles.cancelButton, styles.left, {flex:1, marginLeft:15}]} textStyle={styles.cancelButtonText}>
                  CANCEL
                </Button>
              : 
                <Button onPress={() => {this.props.navigator.pop()}} style={[styles.cancelButton, styles.left, {flex:1, marginLeft:15}]} textStyle={styles.cancelButtonText}>
                  CANCEL
                </Button>
              }
              <Button style={[styles.actionButton, styles.right, {flex:1, marginRight:15}]} textStyle={styles.actionButtonText} onPress={this.login} isDisabled={!this.state.email || !this.state.login_password} isLoading={this.state.isLoggingIn}>
                LOG IN
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }
});

module.exports = LogIn;
