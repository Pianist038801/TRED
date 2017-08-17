'use strict';

var React = require('react-native');
var {
  Navigator,
} = React;

var navigationService = require('../services/navigation.service');

var NavigationBar = React.createClass({
  getInitialState() {
    return {
      show: true
    };
  },

  componentWillMount() {
    navigationService.registerNavBar(this);
  },

  show() {
    this.setState({
      show: true
    });
  },

  hide() {
    this.setState({
      show: false
    });
  },

  render() {
    if (this.state.show) {
      return <Navigator.NavigationBar {...this.props} />
    } else {
      return null;
    }
  }
});

module.exports = NavigationBar;