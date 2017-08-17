/**
 * TRED Vehicle Exterior Color Layout
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * January, 2016
 */
'use strict';

var React = require('react-native');
var {
  View,
  Text,
  Image,
  Platform,
  ListView,
  StyleSheet,
  TouchableHighlight,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../services/analytics.service');
var LocalStorage = require('../services/localStorage.service.js');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var VehicleExteriorColor = React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      return true;
    }});
    return {
      colors: [],
      dataSource: ds.cloneWithRows([]),
      styleId: null,
      hasColors: false,
      disabled: true,
      exterior_color_id: null,
    };
  },
  componentDidMount: function(){
    var component = this;
    analytics.visited('VehicleExteriorColor');
    LocalStorage.wip.listing.get().then(function(listing){
      component.setState({
        styleId: listing.style_id,
        exterior_color_id: listing.exterior_color_id,
      });

      if(listing && listing.details && listing.details.colors && listing.details.colors.exterior){
        var newArray = listing.details.colors.exterior.slice();
        var disabled = true;
        for(var i in newArray){
          if(component.state.exterior_color_id && component.state.exterior_color_id === newArray[i].id){
            newArray[i].isSelected = true;
            disabled = false;
          } else {
            newArray[i].isSelected = false;
          }
        }
        component.setState({
          hasColors: true,
          colors: newArray,
          dataSource: component.state.dataSource.cloneWithRows(newArray),
          disabled: disabled,
        });
      } else {
        component.setState({
          hasColors: true,
          disabled: false
        });        
      }
    });
  },
  pressRow: function(rowID){
    var newArray = this.state.colors.slice();
    for(var i in newArray){
      newArray[i].isSelected = false;
    }
    newArray[rowID].isSelected = true;
    var exterior_color_id = newArray[rowID].id;
    this.setState({
      exterior_color_id: exterior_color_id,
      dataSource: this.state.dataSource.cloneWithRows(newArray),
      colors: newArray,
      disabled: false,
    });
  },
  onConfirm: function(e) {
    var component = this;
    this.setState({disabled: true});
    return LocalStorage.wip.listing.update({
      exterior_color_id: component.state.exterior_color_id,
    }).then(function(){
      component.setState({disabled: false});
      component.props.navigator.push({
        id: 'VehicleInteriorColor',
        name: 'Vehicle Interior Color',
      });    
    });    
  },
  render: function() {
    return (
      <View style={[styles.main, {paddingBottom:48}]}>
        <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
          <Text style={styles.cameraTitle}>EXTERIOR COLOR</Text>
          <Text style={styles.subText}>Some colors are worth more than others. Select your exterior color to maximize your listing price.</Text>
          <View style={[styles.scroll, styles.listViewBackground]}>
            {this.state.hasColors ?
              <View style={{flex:1}}>
                {this.state.colors && this.state.colors.length > 0 ?
                  <ListView
                    dataSource={this.state.dataSource}
                    renderRow={(rowData, sectionID, rowID) => 
                      <TouchableHighlight onPress={() => this.pressRow(rowID)}>
                        <View>
                          <View style={styles.listViewRow}>
                            <Image 
                              source={require('../../images/color_swatch.png')}
                              style={[styles.swatch, {backgroundColor: rowData.colorChip}]} />
                            <Text style={[styles.listViewText, rowData.isSelected ? styles.selectedRowText : null]}>
                              {rowData.name}
                            </Text>
                            {Platform.OS === 'android' ? 
                              <Image 
                                source={require('../../images/check-android.png')}
                                style={[styles.listViewCheck, rowData.isSelected ? {opacity:1} : {opacity:0}]} />
                            :
                              <Image 
                                source={require('../../images/check-ios.png')}
                                style={[styles.listViewCheck, rowData.isSelected ? {opacity:1} : {opacity:0}]} />
                            }
                          </View>
                          <View style={styles.separator} />
                        </View>
                      </TouchableHighlight>
                    } />
                :
                  <View>
                    <Text style={styles.listViewError}>NO EXTERIOR COLORS FOUND.</Text>
                  </View>                  
                }
              </View>
            :
              <View>
                <Text style={styles.listViewError}>LOADING EXTERIOR COLORS...</Text>
              </View>
            }
          </View>
        </View>
        <View style={styles.bottom}>
          <View style={styles.stretch}>
            <View style={styles.formField}>
              <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText} isDisabled={this.state.disabled}>
                CONTINUE
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  },
});

module.exports = VehicleExteriorColor;
