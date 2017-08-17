/**
 * TRED Sell How It Works Step Three Screen Component
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

var SellHIWThree = React.createClass({
  componentDidMount: function() {
    analytics.visited('SellHIWThree');
  },
  onConfirm: function(){
    this.props.navigator.push({
      id: 'SellHIWFour',
      name: 'Sell How It Works 4',
    });    
  },
  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.hiwTop}>
          <Text style={styles.hiwHeading}>NO FLAKES ALLOWED</Text>
        </View>
        <ScrollView styles={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.hiw}>
              <View style={styles.hiwImageContainer}>
                <Image 
                  source={require('../../images/how_it_works/hiw03v2.png')}
                  style={styles.hiwImage} />
              </View>
              <Text style={styles.hiwText}>All prospective buyers pass through our criminal and financial screening process. You&apos;ll be safe, and you won&apos;t waste your time.</Text>
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

module.exports = SellHIWThree;
