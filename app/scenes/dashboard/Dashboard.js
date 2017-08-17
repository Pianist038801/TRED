/**
 * TRED Dashboad Layout
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
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableHighlight,  
  TouchableOpacity,
} = React;
var Button = require('apsl-react-native-button');
var analytics = require('../../services/analytics.service');
var Listing = require('../../components/Listing');
var authService = require('../../services/auth.service');
var userService = require('../../services/user.service');
var navigationService = require('../../services/navigation.service');

var styles = Platform.OS === 'android' ?
  require('../../styles/baseStylesAndroid') : require('../../styles/baseStylesIOS');

var Dashboard = React.createClass({
  getInitialState: function(){
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      (r1, r2) => r1 != r2
    }});
    return {
      user: null,
      loggedIn: false,
      dataSource: ds.cloneWithRows([]),
      isRefreshing: false,      
    };
  },
  componentDidMount: function(){
    var component = this;
    authService.isLoggedIn().then(function(loggedInUser) {
      component.setState({
        loggedIn: !!loggedInUser,
      });
      if(!loggedInUser){
        navigationService.showLogin();
      } else {
        component.setUser().then(function(){
          component.forceUpdate();
        });        
      }
    });
  },
  refreshUser: function(){
    var component = this;
    this.setState({
      isRefreshing: true,
    });
    this.setUser().then(function(){
      component.setState({
        isRefreshing: false,
      });
      component.forceUpdate();
    });
  },
  setUser: function(){
    var component = this;
    return userService.get().then(function(user){
      var listings = user.listings;
      if(listings){
        listings = listings.filter(function(listing){
          return listing.status !== -1;
        });
      }
      component.setState({
        loggedIn: true,
        dataSource: component.state.dataSource.cloneWithRows(listings),
        user: user,
        listings:listings,
      });
    });
  },
  goHome: function(){
    this.props.navigator.push({
      id: 'Home',
      name: 'Home',
    });      
  },
  logout: async function() {
    try {
      await authService.logout();
      analytics.track('Logged Out');
      this.setState(this.getInitialState());
      this.props.navigator.push({
        id: 'Home',
        name: 'Home',
      });      
    } catch(err) {
      alert(err);
    }
  },
  pressRow: function(rowData){
    this.props.navigator.push({
      id: 'Listing',
      name: 'Listing',
      vin: rowData.vin,
      initialTab: 'stats',
    });    
  },
  render: function() {
    if(this.state.listings){
      var listings = this.state.listings;
      return (
        <View style={{flex:1}}>
          <View style={[styles.main, {paddingBottom:48}]}>
            <View style={[styles.content, {flex:1, paddingHorizontal:0, paddingBottom:0}]}>
              <Text style={styles.cameraTitle}>CARS YOU’RE SELLING</Text>
              <View style={[styles.scroll, styles.listViewBackground]}>
                <View style={{flex:1}}>
                  {listings && listings.length > 0 ?
                    <ListView
                      dataSource={this.state.dataSource}
                      refreshControl={
                        <RefreshControl
                          refreshing={this.state.isRefreshing}
                          onRefresh={this.refreshUser}
                          tintColor="#364347"
                          title="LOADING..."
                          colors={['#fff', '#fff', '#fff']}
                          progressBackgroundColor="#02BAF2"
                        />
                      }
                      renderRow={(rowData, sectionID, rowID) => 
                        {
                          //Image
                          var imgURI = null;
                          if(rowData && rowData.images){
                            var image = rowData.images.find(function(image){
                              return image.category !== 'vin';
                            });
                            imgURI = 'https://' + image.bucket + '.imgix.net/' + image.key + "?w=300"
                          }                            
                          return <TouchableHighlight onPress={() => this.pressRow(rowData)}>
                            <View>
                              <View style={styles.listViewRow}>
                                <Image style={styles.smallCarImage} source={{uri: imgURI}} />
                                <Text style={[styles.carListViewText]}>
                                  {rowData.year ?  rowData.year : ''} {rowData.make ?  rowData.make : ''} {rowData.model ?  rowData.model : ''}{"\n"}
                                  <Text style={[styles.trimListViewText]}>{rowData.trim ? rowData.trim : ''}</Text>
                                </Text>
                                <Image style={styles.nextImage} source={require('../../../images/next-arrow.png')} />
                              </View>
                              <View style={styles.separator} />
                            </View>
                          </TouchableHighlight>
                        }
                      } />
                  :
                    <View>
                      <Text style={styles.listViewError}>NO VEHICLES FOUND.</Text>
                      <Button onPress={this.goHome} style={[styles.actionButton]} textStyle={styles.actionButtonText}>GET STARTED</Button>
                    </View>                  
                  }
                </View>
              </View>
            </View>
            <View style={[styles.bottom]}>
              <View style={[styles.stretch]}>
                <View style={[styles.formField]}>
                  <Button onPress={this.logout} style={[styles.actionButton]} textStyle={[styles.actionButtonText]} isDisabled={this.state.disabled}>
                    SIGN OUT
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{flex:1}}>
          <View style={[styles.main, {paddingBottom:0}]}>
            <ScrollView styles={styles.scroll}>
              <View style={styles.content}>
                <Text style={[styles.pText, {marginTop:15, textAlign:'center'}]}>
                  Loading Listings...
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      );      
    }
  },
});
module.exports = Dashboard;
