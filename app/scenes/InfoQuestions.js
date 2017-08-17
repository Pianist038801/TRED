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

var InfoQuestions = React.createClass({
  componentDidMount: function() {
    analytics.visited('InfoQuestions');
  },
  onConfirm: function(e) {
    this.props.navigator.push({
      id: 'VehicleExteriorColor',
      name: 'Vehicle Exterior Color',
    });    
  },
  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.hiwTop}>
          <Text style={styles.hiwHeading}>ANSWER SOME QUESTIONS</Text>
        </View>
        <ScrollView styles={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.hiw}>
              <View style={[styles.hiwLargeImageContainer, {marginTop:0, marginVertical:0}]}>
                <Image 
                  source={require('../../images/infoquestions.png')}
                  style={[styles.hiwImage, styles.hiwLargeImage]} />
              </View>
              <Text style={styles.hiwText}>Your photos look great! Now turn the engine off, answer a handful of questions and you’ll be ready for launch.</Text>
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

module.exports = InfoQuestions;
