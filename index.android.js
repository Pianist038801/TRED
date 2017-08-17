/**
 * TRED React Native App
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber 25th, 2015
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
} = React;

var Root = require('./app/Root');
AppRegistry.registerComponent('TredMobile', () => Root);
