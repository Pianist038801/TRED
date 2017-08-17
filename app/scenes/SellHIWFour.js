/**
 * TRED Sell How It Works Step Four Screen Component
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

var SellHIWFour = React.createClass({
  componentDidMount: function() {

    analytics.visited('SellHIWFour');
  },
  onConfirm: function(){
    this.props.navigator.push({
      id: 'AboutYou',
      name: 'About You',
    });            
  },
  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.hiwTop}>
          <Text style={styles.hiwHeading}>GET PAID</Text>
        </View>
        <ScrollView styles={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.hiw}>
              <View style={[styles.hiwImageContainer, {marginVertical:0}]}>
                <Image 
                  source={require('../../images/how_it_works/hiw04.gif')}
                  style={styles.hiwImage} />
              </View>
              <Text style={styles.hiwText}>We won&apos;t sell your car until you approve the final price. We wire the funds directly to your account and we handle all the paperwork so you don&apos;t have to. </Text>
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

module.exports = SellHIWFour;
