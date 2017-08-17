/**
 * TRED Sell How It Works Step One Screen Component
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
  ScrollView
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../services/analytics.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var SellHIWOne = React.createClass({
  componentDidMount: function() {
    analytics.visited('SellHIWOne');
  },
  onConfirm: function(){
    this.props.navigator.push({
      id: 'SellHIWTwo',
      name: 'Sell How It Works 2',
    });    
  },
  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.hiwTop}>
          <Text style={styles.hiwHeading}>SNAP SOME PICS</Text>
        </View>
        <ScrollView styles={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.hiw}>
              <View style={styles.hiwImageContainer}>
                <Image 
                  source={require('../../images/how_it_works/hiw01.gif')}
                  style={styles.hiwImage} />
              </View>
              <Text style={styles.hiwText}>Get thousands more for your vehicle than on Craigslist or at the dealer. First, take some pictures of your car. We use them to create beautiful web advertisements featuring your vehicle.
              </Text>
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

module.exports = SellHIWOne;
