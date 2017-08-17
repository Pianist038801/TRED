/**
 * TRED About You Screen Component
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
} = React;
var Button = require('apsl-react-native-button');
var KeyboardHandler = require('../components/KeyboardHandler');
var InputAccessory = require('../components/InputAccessory');
var LocalStorage = require('../services/localStorage.service');
var ValidatorService = require('../services/validator.service');
var LoadingOverlay = require('../components/LoadingOverlay');
var authService = require('../services/auth.service');
var userService = require('../services/user.service');
var analytics = require('../services/analytics.service');
var permissions = require('../services/permission.service');
var constants = require('../services/constant.service');
var navigationService = require('../services/navigation.service');
var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var AboutYou = React.createClass({
  getInitialState: function(){
    return {
      first_name: null,
      last_name: null,
      email: null,
      phone: null,
      password: null,
      zip: null,
      disabled: false,
      creatingAccount: false,
      updatingAccount: false,
      loggedIn: false,      
    };
  },
  componentDidMount: function(){
    analytics.visited('AboutYou');
    var component = this;
    var listing = null;
    return LocalStorage.wip.listing.get()
      .then(function(_listing){
        listing = _listing;
        return LocalStorage.wip.user.get();
      })
      .then(function(user) {
        return authService.isLoggedIn()
          .then(function(loggedInUser) {
            component.setState({
              first_name: loggedInUser && loggedInUser.first_name ? loggedInUser.first_name : null,
              last_name: loggedInUser && loggedInUser.last_name ? loggedInUser.last_name : null,
              email: loggedInUser && loggedInUser.email ? loggedInUser.email : null,
              phone: loggedInUser && loggedInUser.phone ? loggedInUser.phone : null,
              password: null,
              loggedIn: !!loggedInUser,
              zip: (user && user.zip) || (loggedInUser && loggedInUser.zip),
            });
          });
      });
  },
  onChangePhone: function(value){
    if (value != null) {
      var deleting = false;
      if (this.state.phone != null && value.length < this.state.phone.length) {
        deleting = true;
      }
      value = value.toString();
      value = value.replace(/[^0-9]/g, '');
      var phone = value;
      if((value.length < 4 && deleting) || value.length < 3) {
        phone = ["(", value].join("");
      } else if((value.length < 7 && deleting) || value.length < 6) {
        phone = ["(", value.substr(0,3), ") ", value.substr(3,3)].join("");
      } else {
        phone = ["(", value.substr(0,3), ") ", value.substr(3,3), "-", value.substr(6,4)].join("");
      }
      this.setState({phone:phone});
    }
  },
  showLogin: function(){
    navigationService.showLogin(this.onLogin);
  },
  onLogin: function(user) {
    this.setState({
      loggedIn: true,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      zip: user.zip,
    });
  },
  logout: async function() {
    try {
      await authService.logout();
      analytics.track('Logged Out');
      this.setState(this.getInitialState());
    } catch(err) {
      alert(err);
    }
  },
  hasErrors: function(){
    var component = this;
    return new Promise(function(resolve, reject){
      var validEmail = false;
      if(!component.state.first_name){
        return resolve({msg:"You're missing your first name.", field:"first_name"});
      } else if (!component.state.last_name) {
        return resolve({msg:"You're missing your last name.", field:"last_name"});
      } else if (!component.state.email) {
        return resolve({msg:"You're missing your email address.", field:"email"});
      } else if (!component.state.phone) {
        return resolve({msg:"You're missing your phone number.", field:"phone"});
      } else if (!component.state.zip) {
        return resolve({msg:"You're missing your zip code.", field:"zip"});
      } else if (!component.state.loggedIn && !component.state.password) {
        return resolve({msg:"Please enter a password.", field:"password"});
      } else if (!component.state.loggedIn) {
        return ValidatorService.validateEmail(component.state.email).then(function(_validEmail){
          validEmail = _validEmail;
          return ValidatorService.validatePhone(component.state.phone);
        }).then(function(validPhone){
          if(!validEmail){
            return resolve({msg:"Your email looks like it's invalid. Please try again.", field:"email"});
          } else if(!validPhone){
            return resolve({msg:"Your phone number looks like it's invalid. Please try again.", field:"phone"});
          } else {
            return resolve(null);
          }
        });
      } else {
        return resolve(null);
      }
    });
  },
  onConfirm: async function(){
    var component = this;
    analytics.track('Pressed Submit');
    this.setState({disabled: true});
    var error = await this.hasErrors();
    if (error) {
      component.setState({disabled: false});
      Alert.alert("Uh Oh...", error.msg, [
        {text: "Fix", onPress: () => {
          setTimeout(() =>{
            component.setState({disabled: false});
            component.refs[error.field].focus();
          }, 250);
        }}
      ]);
    } else {
      permissions.setAllowed(constants.PERMISSION_NAVIGATE, false);
      await LocalStorage.wip.user.upsert({
        first_name: component.state.first_name,
        last_name: component.state.last_name,
        email: component.state.email,
        phone: component.state.phone,
        password: component.state.password,
        zip: component.state.zip,
      });

      try {
        var user_id;
        if (this.state.loggedIn) {
          component.setState({updatingAccount: true});
          var user = await userService.update({
            first_name: component.state.first_name,
            last_name: component.state.last_name,
            phone: component.state.phone,
            zip: component.state.zip,
          });
          user_id = user.id;
        } else {
          // create new user
          component.setState({creatingAccount: true});
          var newUser = await authService.signup();
          user_id = newUser.user_id;
          analytics.track('Signed Up');
          this.setState({loggedIn: true});
        }
        await LocalStorage.wip.listing.upsert({
          user_id: user_id
        });
        component.props.navigator.push({
          id: 'InfoAdvice',
          name: 'Info Advice',
        });
      } catch(e) {
        if (this.state.creatingAccount) {
          // TODO: Check for 409 error and prompt for login
          if (e.message === 'Conflict') {
            analytics.track('Signup Conflict');
            alert('It looks like you already have an account with TRED. Please sign in and try again.');
            component.showLogin();
          } else {
            alert('Sorry! We could not create your account at this time.');
          }
        } else {
          alert('Sorry! Something went wrong, please log out and try again.');
        }
      } finally {
        component.setState({disabled: false, creatingAccount: false, updatingAccount: false});
        permissions.setAllowed(constants.PERMISSION_NAVIGATE, true);
      }
    }
  },
  render: function() {
    var component = this;

    return (
      <View style={{flex:1}}>
        <View style={styles.main}>
          <KeyboardHandler ref='kh' offset={110}>
            <View style={[styles.content, {paddingHorizontal:0}]}>
              <Text style={styles.cameraTitle}>ABOUT YOU</Text>

              <View style={styles.formFieldHorizontal}>
                <Text style={[styles.label, styles.left]}>First Name</Text>
                <Text style={[styles.label, styles.right]}>Last Name</Text>
              </View>
              <View style={styles.formFieldHorizontal}>
                <TextInput
                  ref="first_name"
                  returnKeyType='next'
                  autoCapitalize='words'
                  enablesReturnKeyAutomatically={true}
                  selectTextOnFocus={true}
                  style={[styles.textInput, styles.left]}
                  onChangeText={(first_name) => this.setState({first_name})}
                  value={this.state.first_name}
                  onSubmitEditing={()=>{this.refs.last_name.focus()}}
                  onFocus={()=>this.refs['kh'].inputFocused(this,'first_name')} />
                <TextInput
                  ref="last_name"
                  returnKeyType='next'
                  autoCapitalize='words'
                  enablesReturnKeyAutomatically={true}
                  selectTextOnFocus={true}
                  style={[styles.textInput, styles.right]}
                  onChangeText={(last_name) => this.setState({last_name})}
                  value={this.state.last_name}
                  onSubmitEditing={()=>{this.refs.email && this.refs.email.focus()}}
                  onFocus={()=>this.refs['kh'].inputFocused(this,'last_name')} />
              </View>

              <View>
                <View style={styles.formField}>
                  <Text style={[styles.label]}>Email Address</Text>
                  { !component.state.loggedIn ?
                    <TextInput
                      ref="email"
                      returnKeyType='next'
                      enablesReturnKeyAutomatically={true}
                      selectTextOnFocus={true}
                      keyboardType="email-address"
                      autoCapitalize='none'
                      autoCorrect={false}
                      style={[styles.textInput]}
                      onChangeText={(email) => this.setState({email})}
                      value={this.state.email}
                      onSubmitEditing={()=>{this.refs.phone.focus()}}
                      onFocus={()=>this.refs['kh'].inputFocused(this,'email')}/>
                  :
                    <Text style={styles.textInputTextOnly}>
                      {this.state.email}
                    </Text>
                  }
                </View>

                <View style={styles.formFieldHorizontal}>
                  <Text style={[styles.label, styles.left]}>Phone Number</Text>
                  <Text style={[styles.label, styles.right]}>Zip Code</Text>
                </View>
                <View style={styles.formFieldHorizontal}>
                  <TextInput
                    ref="phone"
                    keyboardType={Platform.OS === 'android' ? "phone-pad" : "phone-pad"}
                    selectTextOnFocus={true}
                    style={[styles.textInput, styles.left]}
                    onChangeText={this.onChangePhone}
                    onSubmitEditing={()=>{this.refs.zip.focus()}}
                    value={this.state.phone}
                    onFocus={()=>{
                      this.setState({
                        enableInputAccessory: true,
                      });
                      this.refs['kh'].inputFocused(this,'phone');
                    }}
                    onBlur={()=>{
                      this.setState({
                        enableInputAccessory: false,
                      });
                    }} />
                  <TextInput
                    ref="zip"
                    keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                    enablesReturnKeyAutomatically={true}
                    selectTextOnFocus={true}
                    style={[styles.textInput, styles.right]}
                    onChangeText={(zip) => this.setState({zip})}
                    onSubmitEditing={()=>{this.refs.password && this.refs.password.focus()}}
                    value={this.state.zip}
                    maxLength={5}
                    onFocus={()=>{
                      this.setState({
                        currentZipField: 'zip',
                        enableInputAccessory: true,
                      });
                      this.refs['kh'].inputFocused(this,'zip');
                    }}
                    onBlur={()=>{
                      this.setState({
                        currentZipField: null,
                        enableInputAccessory: false,
                      });
                    }} />
                </View>
                <View style={styles.formField}>
                  { !component.state.loggedIn ?
                    <View>
                      <Text style={styles.label}>Create Password</Text>
                      <TextInput
                        ref="password"
                        returnKeyType='next'
                        enablesReturnKeyAutomatically={true}
                        selectTextOnFocus={true}
                        secureTextEntry={true}
                        style={styles.textInput}
                        onChangeText={(password) => this.setState({password})}
                        onSubmitEditing={()=>{this.refs.password.blur()}}
                        value={this.state.password}
                        onFocus={()=>this.refs['kh'].inputFocused(this,'password')}  />
                    </View>
                    :
                    null
                  }
                </View>
              </View>

              <View ref="extra" style={{height:30}}></View>
              { !component.state.loggedIn ?
                <View style={{flex:1, justifyContent: 'center'}}>
                  <Text style={styles.subText}>
                    Already have a TRED account?
                  </Text>
                  <TouchableOpacity onPress={this.showLogin}>
                    <Text style={[styles.subTextLink]}>SIGN IN</Text>
                  </TouchableOpacity>
                </View>
                :
                <View style={{flex:1, justifyContent: 'center'}}>
                  <Text style={styles.subText}>
                    You&apos;re logged in.&nbsp;&nbsp;
                  </Text>
                  <TouchableOpacity onPress={component.logout}>
                    <Text style={[styles.subTextLink]}>SIGN OUT</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>
          </KeyboardHandler>
          <View style={styles.bottom}>
            <View style={styles.stretch}>
              <View style={styles.formField}>
                <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText} isDisabled={this.state.disabled}>
                  CONTINUE
                </Button>
              </View>
            </View>
          </View>
        </View>
        <InputAccessory buttonText='Next' onPress={() => { this.state.currentZipField ? (this.refs.password ? this.refs.password.focus() : this.refs.zip.blur()) : this.refs.zip.focus() }} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory} />
        <LoadingOverlay
          isVisible={this.state.creatingAccount || this.state.updatingAccount}
          text={this.state.creatingAccount ? "Creating your account..." : "Updating your account..." } />
      </View>
    );
  },
});

module.exports = AboutYou;
