/**
 * TRED How Heard About Tred Layout
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
var userService = require('../services/user.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var HowHeardAboutTred = React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      return true;
    }});
    return {
      items: [],
      dataSource: ds.cloneWithRows([]),
      disabled: true,
    };
  },
  componentDidMount: function(){
    var component = this;
    analytics.visited('HowHeardAboutTred');

    var itemsArray = [
      {name: "Received a call from TRED"},
      {name: "App Store search"},
      {name: "Google search"},
      {name: "Facebook"},
      {name: "Instagram"},
      {name: "Saw ad in another native app"},
      {name: "YouTube"},
      {name: "Twitter"},
      {name: "Saw display ad on the web"},
      {name: "Learned of TRED while car shopping"},
      {name: "Came across the TRED blog"},
      {name: "Press coverage"},
      {name: "Corporate offer"},
      {name: "Radio ad"},
      {name: "TV ad"},
      {name: "Magazine ad"},
      {name: "Yelp"},
      {name: "Offline Event"},
      {name: "Referral from mechanic / dealer / Tesla"},
      {name: "Referral from someone word of mouth"}
    ];

    var disabled = true;
    for(var i in itemsArray){
      itemsArray[i].isSelected = false;
    }
    component.setState({
      items: itemsArray,
      dataSource: component.state.dataSource.cloneWithRows(itemsArray),
      disabled: disabled,
    });
  },
  pressRow: function(rowID){
    var newArray = this.state.items.slice();
    newArray[rowID].isSelected = !newArray[rowID].isSelected;
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newArray),
      items: newArray,
      disabled: false,
    });
  },
  onConfirm: async function(){
    var component = this;
    this.setState({disabled: true});
    var selectedItems = [];
    for(var i in this.state.items){
      if(this.state.items[i].isSelected){
        selectedItems.push(this.state.items[i].name);
      }
    }
    var user = await userService.update({
      how_heard_about_tred: selectedItems,
    });    
    this.props.navigator.push({
      id: 'Dashboard',
      name: 'Dashboard',
    });
  },
  render: function() {
    return (
      <View style={[styles.main, {paddingBottom:48}]}>
        <View style={[styles.content, {flex:1, paddingHorizontal:0}]}>
          <Text style={styles.cameraTitle}>HOW DID YOU HEAR ABOUT TRED?</Text>
          <Text style={styles.subText}>Select all that apply.</Text>
          <View style={[styles.scroll, styles.listViewBackground]}>
            <View style={{flex:1}}>
              <ListView
                dataSource={this.state.dataSource}
                renderRow={(rowData, sectionID, rowID) => 
                  <TouchableHighlight onPress={() => this.pressRow(rowID)}>
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
            </View>
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

module.exports = HowHeardAboutTred;
