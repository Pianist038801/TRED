/**
 * TRED Dashboard Listing Screen
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
  StyleSheet
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var Listing = require('../../components/Listing');
var authService = require('../../services/auth.service');
var userService = require('../../services/user.service');
var navigationService = require('../../services/navigation.service');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var ListingRoute = React.createClass({
  componentWillMount: function(){
    var component = this;
    authService.isLoggedIn().then(function(loggedInUser) {
      component.setState({
        loggedIn: !!loggedInUser,
      });
      if(!loggedInUser){
        navigationService.showLogin();
      } else {
        component.forceUpdate();
      }
    });
  },
  render: function() {
    return (
      <Listing vin={this.props.vin} listing={this.props.listing} navigator={this.props.navigator} initialTab={this.props.initialTab ? this.props.initialTab : 'stats'} />
    );
  }
});
module.exports = ListingRoute;
