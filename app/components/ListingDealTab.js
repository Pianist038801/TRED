/**
 * TRED Listing Deal Tab Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
 */
'use strict';

var React = require('react-native');
var {
  View,
  Text,
  Image,
  Platform,
  ListView,
  TouchableHighlight,
} = React;
var analytics = require('../services/analytics.service');
var utils = require('../services/utils');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var ListingDealTab = React.createClass({
  getDefaultProps: function(){
    return {
      listing: null,
    }
  },
  getInitialState: function(){
    return {
      listing: false,
    }
  },
  componentDidMount: function() {
    if(this.props.listing){
      this.setState({
        listing: this.props.listing
      });
    }
  },
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  render: function() {
    var listing = this.state.listing;
    return (
      <View style={{flex:1}}>
        <View style={[styles.main, {paddingBottom:0}]}>
          <View style={[styles.content, {flex:1, paddingHorizontal:0, paddingBottom:0}]}>
            <Text style={styles.cameraTitle}>PURCHASE DEAL</Text>
            <Text style={styles.subText}>{listing.year} {listing.make} {listing.model} - Asking {this.formatMoney(listing.price)} </Text>
            <View style={[styles.scroll, styles.listViewBackground]}>
              <View style={{flex:1}}>
                { this.state.testDrives && this.state.testDrives.length > 0 ?
                  <ListView
                    dataSource={this.state.testDrivesDataSource}
                    renderRow={(rowData, sectionID, rowID) => 
                      {
                        return <TouchableHighlight onPress={() => this.onTestDrivePress(rowData)}>
                          <View>
                            <View style={styles.listViewRow}>
                              <Text style={[styles.carListViewText]}>
                                Buyer # {parseInt(rowID) + 1} {'\n'}
                                <Text style={[styles.trimListViewText]}>Wants to Test Drive</Text>
                              </Text>
                              <Image style={styles.nextImage} source={require('../../images/next-arrow.png')} />
                            </View>
                            <View style={styles.separator} />
                          </View>
                        </TouchableHighlight>
                      }
                    } />
                :
                  <View>
                    <Text style={styles.listViewError}>NO DEAL YET.</Text>
                  </View>                  
                }
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
});

module.exports = ListingDealTab;
