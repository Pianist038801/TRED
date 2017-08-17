/**
 * TRED AboutTredApp Layout
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
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../services/analytics.service');
var version = require('../version/version.json');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var AboutTredApp = React.createClass({
  getInitialState: function(){
    return {
      commitish: version.commitish,
      packageVersion: version.packageVersion
    };
  },
  render: function() {
    return (
      <View style={[styles.main, {paddingTop:60}]}>
        <ScrollView style={styles.scroll}>
          <View style={[styles.content, {paddingHorizontal:0}]}>
            <View style={[styles.table]}>
              <View style={[styles.tableRow]}>
                <View style={styles.tableCol60}>
                  <Text style={[styles.tableText]}>VCS Version</Text>
                </View>
                <View style={styles.tableCol40}>
                  <Text style={[styles.tableText, {fontWeight:'bold', textAlign:'right'}]}>{this.state.commitish}</Text>
                </View>
              </View>
              <View style={[styles.tableRow]}>
                <View style={styles.tableCol60}>
                  <Text style={[styles.tableText]}>Copyright</Text>
                </View>
                <View style={styles.tableCol40}>
                  <Text style={[styles.tableText, {fontWeight:'bold', textAlign:'right'}]}>2015-2016</Text>
                </View>
              </View>
              <View style={[styles.tableRow, styles.tableBottom]}>
                <View style={styles.tableCol60}>
                  <Text style={[styles.tableText]}>Version</Text>
                </View>
                <View style={styles.tableCol40}>
                  <Text style={[styles.tableText, {fontWeight:'bold', textAlign:'right'}]}>{this.state.packageVersion}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottom}>
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
module.exports = AboutTredApp;
