'use strict';

var React = require('react-native');

var {
  View,
  TouchableWithoutFeedback,
  PropTypes,
} = React;
var StyleSheet = require('react-native').StyleSheet;
var noop = () => {};


var Overlay = React.createClass({
	
  propTypes: {
    onPressBackdrop: PropTypes.func,
    isVisible: PropTypes.bool,
  },
    
  getDefaultProps() {
    return {
      isVisible: false,
      onClose: noop,
      onPressBackdrop: noop,
    };
  },

  render() {
    var {
    	onPressBackdrop,
    	isVisible,
    	Opacity
    } = this.props;
    
    if (!isVisible) {
      return (<View/>);
    }

    return (<TouchableWithoutFeedback onPress={onPressBackdrop}>
            <View style={[styles.backdrop,{opacity:Opacity}]}>
              {this.props.children}
            </View>
          </TouchableWithoutFeedback>)
  }
});


var styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
  }
});

module.exports = Overlay;

