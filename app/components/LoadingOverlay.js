var React = require('react-native');

var {
  View,
  Text,
  ActivityIndicatorIOS,
  StyleSheet,
  Platform
} = React;

if(Platform.OS === 'android'){
  var Overlay = require('./OverlayAndroid');
} else {
  var Overlay = require('react-native-overlay');
}

var LoadingOverlay = React.createClass({
  getDefaultProps(): StateObject {
    return {
      isVisible: false,
      text: null,
    }
  },

  render(): ReactElement {
    if(Platform.OS === 'android'){
      return (
        <Overlay isVisible={this.props.isVisible} Opacity={.7}>
          <View style={styles.background}>
            <Text style={styles.loadingText}>{this.props.text ? this.props.text : "THIS IS A TEST"}</Text>
          </View>
        </Overlay>
      );
    } else {
      return (
        <Overlay isVisible={this.props.isVisible}>
          <View style={styles.background}>
            <ActivityIndicatorIOS
              size="large"
              animating={true} />
            <Text style={styles.loadingText}>{this.props.text ? this.props.text : ""}</Text>
          </View>
        </Overlay>
      );  
    }
  }
});

var styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#000000',
    opacity: .9,
  },
  loadingText: {
    marginTop:15,
    marginHorizontal:15,
    fontSize: 22,
    color: '#ffffff',
    textAlign:'center'
  }
});

module.exports = LoadingOverlay;
