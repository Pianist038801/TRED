/**
 * TRED Info Vin Screen Component
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

var InfoVin = React.createClass({
  componentDidMount: function() {
    analytics.visited('InfoVin');
  },
  onConfirm: function(e) {
    this.props.navigator.push({
      id: 'PhotoVin',
      name: 'Photo Vin',
    });    
  },
  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.hiwTop}>
          <Text style={styles.hiwHeading}>START WITH VIN</Text>
        </View>
        <ScrollView styles={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.hiw}>
              <View style={[styles.hiwLargeImageContainer, {marginVertical:0, marginBottom:15}]}>
                <Image 
                  source={require('../../images/infovin.png')}
                  style={[styles.hiwImage, styles.hiwLargeImage]} />
              </View>
              <Text style={styles.hiwText}>The first pic is to scan your vehicle’s VIN barcode which is located on the body of the car when you open the driver door or in the corner of your windshield.</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottom}>
          <View style={styles.stretch}>
            <View style={styles.formField}>
              <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText}>
                I&apos;M READY
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }
});

module.exports = InfoVin;
