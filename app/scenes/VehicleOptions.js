/**
 * TRED Vehicle Options Layout
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
var edmunds = require('../services/edmunds.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var VehicleOptions = React.createClass({
  getInitialState: function() {
    var getSectionData = (dataBlob, sectionID) => {
      return dataBlob[sectionID];
    }
    var getRowData = (dataBlob, sectionID, rowID) => {
      return dataBlob[sectionID + ':' + rowID];
    }
    return {
      styleId: null,
      hasOptions: false,
      option_ids: [],
      disabled: false, 
      vehicleOptions: [],   
      dataSource : new ListView.DataSource({
          getSectionData          : getSectionData,
          getRowData              : getRowData,
          rowHasChanged           : (row1, row2) => {
            return true;
          },
          sectionHeaderHasChanged : (s1, s2) => s1 !== s2
      })
    }
  },
  buildSectionsAndRows: function(vehicleOptions){
    var length = vehicleOptions.length,
        dataBlob = {},
        sectionIDs = [],
        rowIDs = [],
        category,
        options,
        optionLength,
        option,
        i,
        j;
    for (i = 0; i < length; i++) {
      category = vehicleOptions[i];
      sectionIDs.push(category.categoryName);
      dataBlob[category.categoryName] = category.categoryName;
      options = category.options;
      optionLength = options.length;
      rowIDs[i] = [];
      for(j = 0; j < optionLength; j++) {
        option = options[j];
        rowIDs[i].push(option.id);
        dataBlob[category.categoryName + ':' + option.id] = option;
      }
    }
    this.setState({
      vehicleOptions: vehicleOptions,
      dataSource : this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
      hasOptions: true,
    });
  },
  componentDidMount: function(){
    var component = this;
    analytics.visited('VehicleOptions');
    LocalStorage.wip.listing.get().then(function(listing){
      component.setState({
        styleId: listing.style_id,
        option_ids: listing.option_ids || [],
      });
      if(listing && listing.options && listing.options.options){
        //Get Categories and format array for list view
        var skipCategories = ["Additional Fees"];
        var objCategories = {};
        listing.options.options.forEach(function(option){
          if(skipCategories.indexOf(option.category) !== -1 ) {
            return;
          } 
          objCategories[option.category] = objCategories[option.category] || [];
          objCategories[option.category].push({id:option.id, name:option.manufactureOptionName, desc:option.description, avail: option.availability});
        });
        var sortedCats = Object.keys(objCategories).map((cat) => {
          return cat;
        })
        sortedCats = sortedCats.sort((a,b) => {
          if(a === 'Package'){
            return -1;
          } else if(b === 'Package'){
            return 0;
          } else {
            return (a > b) - (a < b);
          }
        });
        var categories = sortedCats.map(function(category){
          for (var i in objCategories[category]){
            if(component.state.option_ids.indexOf(objCategories[category][i].id) > -1){
              objCategories[category][i].isSelected = true;
            } else {
              objCategories[category][i].isSelected = false;
            }
          }
          return { categoryName: category, options: objCategories[category]};
        });
        component.buildSectionsAndRows(categories);
      } else {
        component.setState({
          hasOptions: true,
        });
      }
    });
  },
  pressRow: function(sectionID, rowID){
    var option_ids = this.state.option_ids;
    var newArray = this.state.vehicleOptions.slice();
    for(var t = 0; t < newArray.length; t++){
      if(newArray[t].categoryName === sectionID){
        for(var p = 0; p < newArray[t].options.length; p++){
          if(newArray[t].options[p].id === rowID){
            newArray[t].options[p].isSelected = !newArray[t].options[p].isSelected;
            if(newArray[t].options[p].isSelected){
              option_ids.push(rowID);
            } else {
              var index = option_ids.indexOf(rowID);
              option_ids.splice(index,1);
            }
            break;
          }
        }
        break;
      }
    }
    this.setState({
      option_ids: option_ids,
    });
    this.buildSectionsAndRows(newArray);
  },
  onConfirm: function(e) {
    var component = this;
    this.setState({disabled: true});
    return LocalStorage.wip.listing.update({
      option_ids: component.state.option_ids,
    }).then(function(){
      component.setState({disabled: false});
      component.props.navigator.push({
        id: 'VehicleInfo',
        name: 'Vehicle Info',
      });    
    });
  },
  render: function() {
    return (
      <View style={[styles.main, {paddingBottom:48}]}>
        <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
          <Text style={styles.cameraTitle}>OPTIONS</Text>
          <Text style={styles.subText}>Select any options on your car to maximize your listing price.</Text>
          <View style={[styles.scroll, styles.listViewBackground]}>
            { this.state.hasOptions ?
              <View style={{flex:1}}>
                {this.state.vehicleOptions && this.state.vehicleOptions.length > 0 ?
                  <ListView
                    dataSource={this.state.dataSource}
                    renderSectionHeader={(sectionData, sectionID) =>
                      <View style={styles.section}>
                        <Text style={styles.sectionText}>{sectionData}</Text>
                      </View>
                    }
                    renderRow={(rowData, sectionID, rowID) => 
                      <TouchableHighlight onPress={() => this.pressRow(sectionID, rowID)}>
                        <View>
                          <View style={styles.listViewRow}>
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
                    <Text style={styles.listViewError}>NO OPTIONS FOUND.</Text>
                  </View>
                }                
              </View>
            :
              <View>
                <Text style={styles.listViewError}>LOADING OPTIONS...</Text>
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

module.exports = VehicleOptions;
