/**
 * TRED Trim Picker Component
 * https://www.tred.com
 * Andrew Crowell (andrewcrowell@tred.com)
 * November 30, 2015
 */
'use strict';

var React = require('react-native');
var FMPicker = require('../components/BottomPicker');
var {
  View,
  Text,
  TouchableOpacity,
  Platform,
} = React;

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

if(Platform.OS === 'android'){
  var Dropdown = require('react-native-dropdown-android');
}

var TrimPicker = React.createClass({
  getInitialState() {
    return {
      selectedStyleId: null
    };
  },
  getDefaultProps() {
    return {
      vinInfo: null,
      selectedStyleId: null,
      onSelect: null
    };
  },
  componentWillMount() {
    this.setState({
      selectedStyleId: this.props.selectedStyleId
    });
  },
  onSelectTrim() {
    this.refs.trimPicker.show();
  },
  getLabelForStyleId(id) {
    var vinInfo = this.props.vinInfo;
    if (vinInfo && vinInfo.years && vinInfo.years.length > 0 && vinInfo.years[0].styles) {
      var style = vinInfo.years[0].styles.find((style) => {
        return style.id === id;
      });
      return style && style.name;
    } else {
      return null;
    }
  },
  getIndexForStyleId(id) {
    var vinInfo = this.props.vinInfo;
    if (vinInfo && vinInfo.years && vinInfo.years.length > 0 && vinInfo.years[0].styles) {
      var index = vinInfo.years[0].styles.findIndex((style) => {
        return style.id === id;
      });
      return index + 1;
    } else {
      return 0;
    }
  },
  render() {
    var component = this;
    var vinInfo = component.props.vinInfo;
    if(Platform.OS === 'android') {
      var dropdownOptions = vinInfo.years[0].styles.map((option, i) => {
        var label = option.name;
        return label;
      });
      dropdownOptions.unshift('SELECT TRIM');
    }
    var hasTrimOptions = vinInfo && vinInfo.years && vinInfo.years.length > 0 && vinInfo.years[0].styles && vinInfo.years[0].styles.length > 1;
    if (hasTrimOptions) {
      return (
        <View style={styles.tableCol70}>
          { Platform.OS === 'android' ?
            <View style={{marginLeft:-7}}>
              <Dropdown
                style={ styles.androidDropdown }
                values={dropdownOptions}
                selected={component.getIndexForStyleId(component.state.selectedStyleId) || 0}
                onChange={(option) => {
                  var styleId = option.selected > 0 ? vinInfo.years[0].styles[option.selected - 1].id : 0;
                  component.setState({selectedStyleId: styleId});
                  component.props.onSelect(styleId);
                }} />
            </View>
            :
            <View style={styles.tableCol70}>
              <View>
                <TouchableOpacity onPress={this.onSelectTrim} >
                  <Text
                    ref="trim"
                    style={[styles.tableText, component.props.selectedStyleId ? styles.tableLink : styles.tableLinkBold]}>
                    {component.getLabelForStyleId(component.state.selectedStyleId) || 'SELECT TRIM'}
                  </Text>
                </TouchableOpacity>
              </View>
              <FMPicker
                ref='trimPicker'
                options={vinInfo.years[0].styles}
                labels='name'
                onSubmit={(option) => {
                  component.setState({selectedStyleId: option.id});
                  component.props.onSelect(option.id);
                }} />
            </View>
          }
        </View>
      );
    } else {
      return (
        <View style={styles.tableCol70}>
          <Text style={[styles.tableText]}>{component.getLabelForStyleId(component.state.selectedStyleId) || 'N/A'}</Text>
        </View>
      );
    }
  }
});

module.exports = TrimPicker;