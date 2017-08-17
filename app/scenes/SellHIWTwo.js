/**
 * TRED Sell How It Works Step Two Screen Component
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

var SellHIWTwo = React.createClass({
  componentDidMount: function() {
    analytics.visited('SellHIWTwo');
  },
  onConfirm: function(){
    this.props.navigator.push({
      id: 'SellHIWThree',
      name: 'Sell How It Works 3',
    });    
  },
  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.hiwTop}>
          <Text style={styles.hiwHeading}>LAUNCH YOUR LISTING</Text>
        </View>
        <ScrollView styles={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.hiw}>
              <View style={[styles.hiwImageContainer, {marginTop:25}]}>
                <Image 
                  source={require('../../images/how_it_works/hiw02.gif')}
                  style={styles.hiwImage} />
              </View>
              <Text style={styles.hiwText}>With the push of a button, we&apos;ll list your vehicle for sale on all major car websites. You&apos;ll be able to control your list price and track your page views.</Text>
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

module.exports = SellHIWTwo;
