/**
 * TRED Info Photos Screen Component
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
  ScrollView,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../services/analytics.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var InfoPhotos = React.createClass({
  componentDidMount: function() {
    analytics.visited('InfoPhotos');
  },
  onConfirm: function(e) {
    this.props.navigator.push({
      id: 'InfoVin',
      name: 'Info Vin',
    });    
  },
  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.hiwTop}>
          <Text style={styles.hiwHeading}>TAKING PHOTOS</Text>
        </View>
        <ScrollView styles={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.hiw}>
              <View style={[styles.hiwLargeImageContainer]}>
                <Image 
                  source={require('../../images/infophotos.png')}
                  style={[styles.hiwImage, styles.hiwLargeImage]} />
              </View>
              <Text style={styles.hiwText}>Move your vehicle to a location where you have plenty of space. You’ll need room to get great photos.</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottom}>
          <View style={styles.stretch}>
            <View style={styles.formField}>
              <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText}>
                CONTINUE
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }
});

module.exports = InfoPhotos;
