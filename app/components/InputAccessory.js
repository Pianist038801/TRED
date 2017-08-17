/**
 * TRED Input Accessory Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * December, 2015
 **/
'use strict';

var React=require('react-native');
var {
  View,
  Text,
  Platform,
  DeviceEventEmitter,
  LayoutAnimation,
}=React;

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');
var keyboardShowEvent = null;
var keyboardHideEvent = null;
var InputAccessory = React.createClass({
  getDefaultProps(){
    return {
      buttonText: 'Next',
    };
  },
  getInitialState(){
    keyboardShowEvent = DeviceEventEmitter.addListener('keyboardDidShow',(frames)=>{
      if (!frames.endCoordinates) return;
      if (this.isMounted()) {
        LayoutAnimation.easeInEaseOut();
        this.setState({setAccessoryBottom: frames.endCoordinates.height, height:50});
      }
    });
    keyboardHideEvent = DeviceEventEmitter.addListener('keyboardWillHide',(frames)=>{
      if (this.isMounted()) {
        this.setState({setAccessoryBottom:-60, height:0});
      }
    });
    return {
      setAccessoryBottom:-60,
      height:0
    };
  },
  componentWillUnmount(){
    keyboardShowEvent.remove();
    keyboardHideEvent.remove();
  },
  onPress(){
    LayoutAnimation.easeInEaseOut();
    this.setState({height:0});
    this.props.onPress();
  },
  render(){
    if(this.props.enabled){
      return (
        <View ref="this" style={[styles.inputAccessory, {bottom: this.state.setAccessoryBottom, height: this.state.height}]}>
          <View style={styles.inputAccessoryInner}>
            <Text style={styles.inputAccessoryText} onPress={this.onPress}>{this.props.buttonText}</Text>
          </View>
        </View>
      );
    } else {
      return <View />;
    }
  }
}); // InputAccessory

module.exports = InputAccessory;