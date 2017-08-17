/**
 * TRED Info Advice Screen Component
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

var InfoAdvice = React.createClass({
  componentDidMount: function() {
    analytics.visited('InfoAdvice');
  },
  onConfirm: function(e) {
    this.props.navigator.push({
      id: 'InfoPhotos',
      name: 'Info Photos',
    });    
  },
  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.hiwTop}>
          <Text style={styles.hiwHeading}>FIRST THINGS FIRST</Text>
        </View>
        <ScrollView styles={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.hiw}>
              <View style={[styles.hiwImageContainer, {marginVertical:0, marginBottom:25, marginTop:10}]}>
                <Image 
                  source={require('../../images/seller-advice.png')}
                  style={[styles.hiwImage]} />
              </View>
              <Text style={styles.hiwText}>Clean cars sell faster and for more money. We advise that you take some time to clean up your car before taking photos to maximize its value.</Text>
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

module.exports = InfoAdvice;
