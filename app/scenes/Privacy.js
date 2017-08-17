/**
 * TRED Privacy Layout
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
  WebView,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../services/analytics.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var Privacy = React.createClass({
  render: function() {
    var paddingTop = 48;
    if(Platform.OS === 'android'){
      paddingTop = 40;
    }
    return (
      <View style={[styles.main, {paddingTop:paddingTop, paddingBottom:48}]}>
        <View style={[styles.content, {flex:1, paddingHorizontal:0, backgroundColor: "#ffffff"}]}>
          <WebView source={{uri:"https://www.tred.com/privacy-policy-mobile"}} style={{flex:1}} startInLoadingState={true} loading={true} javaScriptEnabled={true} />
        </View>
        <View style={[styles.bottom]}>
          <View style={styles.stretch}>
            <View style={styles.formField}>
              <Button onPress={() => {this.props.navigator.pop();}} style={[styles.actionButton, {flex:1, marginLeft:15}]} textStyle={styles.cancelButtonText}>
                CLOSE
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }
});
module.exports = Privacy;
