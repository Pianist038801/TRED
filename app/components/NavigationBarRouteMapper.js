/**
 * TRED Home Screen Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
 */
'use strict';

var React = require('react-native');
var Button = require('apsl-react-native-button');
var {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
} = React;
var permissions = require('../services/permission.service');
var constants = require('../services/constant.service');
var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var NavigationBarRouteMapper = function(leftText, rightText, leftRouteID, rightRouteID, title){
  return {
    LeftButton(route, navigator, index, navState) {
      if(!leftText){
        return null;
      }
      return ( 
        <View style={{flex:1, justifyContent: 'center'}}>
          { !leftRouteID ?
            <TouchableOpacity style={[styles.navButton]}
              onPress={() => {
                if (permissions.isAllowed(constants.PERMISSION_NAVIGATE)) {
                  navigator.pop();
                }
              }}>
                <View style={styles.backContainer}>
                  <Image 
                    source={require('../../images/back-arrow.png')}
                    style={styles.backArrow} />        
                  <Text style={styles.navText}>
                    {leftText}
                  </Text>
                </View>
            </TouchableOpacity>
          : 
            <TouchableOpacity style={styles.navButton}
              onPress={() => {
                if (permissions.isAllowed(constants.PERMISSION_NAVIGATE)) {
                  if(leftRouteID === "ListingToDashboard"){
                    navigator.resetTo({id: "Dashboard", name: "Dashboard"})
                  } else {
                    navigator.push({id: leftRouteID})
                  }
                }
              }}>
                {leftRouteID === "ListingToDashboard" ?
                  <View style={styles.backContainer}>
                    <Image 
                      source={require('../../images/back-arrow.png')}
                      style={styles.backArrow} />        
                    <Text style={styles.navText}>
                      {leftText}
                    </Text>
                  </View>
                :
                  <Text style={[styles.navText, {marginLeft: 10}]}>
                    {leftText}
                  </Text>              
                }
            </TouchableOpacity>
          }
        </View>
      );    
    },
    RightButton(route, navigator, index, navState) {
      if(!rightText){
        return null;
      }
      return (
        <TouchableOpacity style={[styles.navButton]}
            onPress={() => {
              if (permissions.isAllowed(constants.PERMISSION_NAVIGATE)) {
                navigator.push({id: rightRouteID})
              }
            }}>
          <Text style={styles.navText}>
            {rightText}
          </Text>
        </TouchableOpacity>
      );
    },
    Title(route, navigator, index, navState) {
      if(!title){
        return null;
      }
      return (
        <View style={[styles.navButton]}>
          <View style={styles.navTitle}>
            {/*
            <Text style={styles.navTitleText}>{ route.name }</Text>
            */}
              <Image 
                source={require('../../images/logo.png')}
                style={styles.navLogo} />        
          </View>
        </View>        
      );
    },    
  }
}
module.exports = NavigationBarRouteMapper;