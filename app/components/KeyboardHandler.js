/**
 * TRED Bottom Picker Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * November, 2015
 *
 * Usage:
 *    <KeyboardHandler ref='kh' offset={50}>
 *      <View>
 *        ...
 *        <TextInput ref='username'
 *          onFocus={()=>this.refs.kh.inputFocused(this,'username')}/>
 *        ...
 *      </View>
 *    </KeyboardHandler>
 * 
 *  offset is optional and defaults to 34
 *  Any other specified props will be passed on to ScrollView
 */
'use strict';

var React=require('react-native');
var {
  ScrollView,
  View,
  DeviceEventEmitter,
  Platform,
}=React;

var myprops={ 
  offset:34,
}
var keyboardShowEvent = null;
var keyboardHideEvent = null;

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var KeyboardHandler=React.createClass({
  propTypes:{
    offset: React.PropTypes.number,
  },
  getDefaultProps(){
    return myprops;
  },
  getInitialState(){
    keyboardShowEvent = DeviceEventEmitter.addListener('keyboardDidShow',(frames)=>{
      if (!frames.endCoordinates) return;
      if (this.isMounted()) {
        this.setState({keyboardSpace: frames.endCoordinates.height});
      }
    });
    keyboardHideEvent = DeviceEventEmitter.addListener('keyboardWillHide',(frames)=>{
      if (this.isMounted()) {
        this.setState({keyboardSpace:0});
      }
    });

    this.scrollviewProps={
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle:200,
    };
    // pass on any props we don't own to ScrollView
    Object.keys(this.props).filter((n)=>{return n!='children'})
    .forEach((e)=>{if(!myprops[e])this.scrollviewProps[e]=this.props[e]});

    return {
      keyboardSpace:0,
    };
  },
  componentWillUnmount(){
    keyboardShowEvent.remove();
    keyboardHideEvent.remove();
  },
  render(){
    return (
      <ScrollView ref='scrollView' {...this.scrollviewProps} keyboardDismissMode={Platform.OS === 'android' ? 'none' : 'on-drag'} style={styles.scroll}>
        {this.props.children}
        <View ref="extra" style={Platform.OS === 'android' ? {height:0} : {height:this.state.keyboardSpace}}></View>
      </ScrollView>
    );
  },
  inputFocused(_this,refName){
    setTimeout(()=>{
      let scrollResponder=this.refs.scrollView.getScrollResponder();
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        React.findNodeHandle(_this.refs[refName]),
        this.props.offset, //additionalOffset
        true
      );
    }, 250);
  }
}) // KeyboardHandler

module.exports=KeyboardHandler;