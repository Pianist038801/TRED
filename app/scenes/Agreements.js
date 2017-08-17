/**
 * TRED Info Agreements Screen Component
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
  ScrollView,
  TouchableOpacity,
} = React;
var Button = require('apsl-react-native-button');
var LoadingOverlay = require('../components/LoadingOverlay');
var analytics = require('../services/analytics.service');
var LocalStorage = require('../services/localStorage.service.js');
var utils = require('../services/utils');
var listingService = require('../services/listing.service');
var userService = require('../services/user.service');
var permissions = require('../services/permission.service');
var constants = require('../services/constant.service');
var notifications = require('../services/notification.service');
var imageService = require('../services/image.service');
var sentry = require('../services/sentry.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var LOAN_AGREEMENT_THRESHOLD = 0.85;

var InfoAgreements = React.createClass({
  getInitialState: function(){
    return {
      tosModalVisible: false,
      disabled: true,
      model: null,
      price: null,
      loanAmount: null,
      suggestedStartingPrice: null,
      creatingListing: false,
      uploadingPhotos: false,
      submittingListing: false,
      listing: {},
      photosRemaining: null,
      user: null,
    }
  },  
  formatMoney: function(value) {
    return utils.formatMoney(value);
  },
  componentDidMount: function() {
    var component = this;
    analytics.visited('Agreements');
    LocalStorage.wip.listing.get().then(function(listing){
      component.setState({
        model: listing.model,
        price: component.formatMoney(listing.price),
        loanAmount: component.formatMoney(listing.loan_amount),
        suggestedStartingPrice: component.formatMoney(listing.suggested_starting_price),
        listing: listing,
      });
      if(listing.price <= listing.suggested_starting_price &&
         listing.loan_amount <= (LOAN_AGREEMENT_THRESHOLD * listing.suggested_starting_price)){
        component.setState({
          disabled: false,
        });
      }
      component.setUser();
    });
  },
  showTOS: function(){
    this.props.navigator.push({
      id: "TermsOfUse",
      name: "Terms Of Use",
    });
  },
  setUser: async function(){
    var user = await userService.get();
    var listings = user.listings;
    this.setState({
      user: user,
    });
  },  
  onConfirm: async function(e) {
    var component = this;
    var listing;
    try {
      // Create listing
      permissions.setAllowed(constants.PERMISSION_NAVIGATE, false);
      component.setState({creatingListing: true, uploadingPhotos: false, submittingListing: false});
      try {
        listing = await listingService.create();
        analytics.track('Created Listing');
      } catch(e) {
        if (e.error && e.error.statusCode === 409) {
          // The listing already exists for this user, so they may be trying to upload pictures again
          listing = await listingService.get();
          analytics.track('Fetched Existing Listing');
        } else {
          throw e;
        }
      }
      component.setState({creatingListing: false, uploadingPhotos: true, submittingListing: false});
      await imageService.uploadImages(listing.vin, (images) => {
        var pending = 0;
        if (images) {
          Object.keys(images).forEach(function(key) {
            if (!images[key].uploaded) {
              pending++;
            }
          });
        }
        component.setState({ photosRemaining: pending });
      });
      analytics.track('Uploaded Images');
      component.setState({creatingListing: false, uploadingPhotos: false, submittingListing: true});
      await listingService.review();
      analytics.track('Listing Submitted For Review');
      //alert('done');
      //await imageService.resetUploaded();
      await LocalStorage.clear();
      if (this.state.user && this.state.user.how_heard_about_tred && this.state.user.how_heard_about_tred.length > 0) {
        this.props.navigator.push({
          id: 'Dashboard',
          name: 'Dashboard',
        });
      } else {
        this.props.navigator.push({
          id: 'HowHeardAboutTred',
          name: 'HowHeardAboutTred',
        });
      }
    } catch(e) {
      sentry.captureException(e, {vin: listing && listing.vin, style_id: listing && listing.style_id});
      if (e && e.error && e.error.message && e.error.message.indexOf('VIN already exists') > -1) {
        alert('Sorry! It looks like a vehicle with this VIN is already in our system. Please contact us for assistance.');
      } else if (this.state.creatingListing) {
        alert('Sorry! We could not create your listing at this time. ' + (e && e.error && e.error.message ? e.error.message : ''));
      } else if (this.state.uploadingPhotos) {
        alert('Sorry! We could not finish uploading your photos. Please try again.');
      } else {
        alert('Sorry! We could not submit your listing for review at this time.');
      }
    } finally {
      component.setState({disabled: false, creatingListing: false, uploadingPhotos: false, submittingListing: false});
      permissions.setAllowed(constants.PERMISSION_NAVIGATE, true);
    }
  },
  enableAgreement: function(){
    this.setState({
      disabled: false,
    });
  },
  render: function() {
    return (
      <View style={{flex:1}}>
        <View style={[styles.main, styles.hiwWarning]}>
          <View style={[styles.hiwTop, styles.hiwTopWarning]}>
            <Text style={styles.hiwHeading}>PLEASE READ CAREFULLY!</Text>
          </View>        
          <ScrollView styles={[styles.scroll]} onScroll={this.enableAgreement} showsVerticalScrollIndicator={true}>
            <View style={[styles.content, styles.hiwWarning]}>
              <View style={styles.hiw}>
                <Text style={[styles.hiwHeading]}>
                  YOU AGREE TO:
                </Text>
                { (this.state.listing.has_loan && !this.state.listing.suggested_starting_price) || (this.state.listing.has_loan && this.state.listing.loan_amount > LOAN_AGREEMENT_THRESHOLD * this.state.listing.suggested_starting_price) ?
                  <View>
                    <View style={[styles.hiwImageContainer, styles.hiwImageMargin]}>
                      <Image
                        source={require('../../images/bank.png')}
                        style={[styles.hiwImage]} />
                    </View>
                    <Text style={[styles.hiwText, {marginBottom: 15}]}>
                      Your loan amount is {this.state.loanAmount}{this.state.listing.suggested_starting_price ? " and our recommended list price for your vehicle is " + this.state.suggestedStartingPrice : ""}. It’s possible that your car will sell for a price that will not cover both your loan and the $499 cost of our service.  <Text style={{fontWeight:'bold'}}>Before proceeding, if need be, you agree to come out of pocket to repay these monies owed.</Text>
                    </Text>
                  </View>
                  :
                  null
                }
                { this.state.listing.price > this.state.listing.suggested_starting_price ?
                  <View>
                    <View style={[styles.hiwImageContainer, styles.hiwImageMargin]}>
                      <Image
                        source={require('../../images/price_adjust.png')}
                        style={[styles.hiwImage]} />
                    </View>
                    <Text style={[styles.hiwText, {marginBottom: 15}]}>
                      If it’s possible to sell your {this.state.model} for {this.state.price}, we’re the team to help you do it, and our data says that it will happen within 10 days. If your {this.state.model} doesn’t sell within 10 days, then we will adjust your list price to {this.state.listing.suggested_starting_price ? this.state.suggestedStartingPrice : "our recommended starting price"} to promote buyer engagement. But no matter what happens, you control the price at which your car sells and you can remove your listing at any time at no cost. <Text style={{fontWeight:'bold'}}>Before proceeding, you agree to adhere to this potential price adjustment.</Text>
                    </Text>
                  </View>
                  :
                  null
                }
                <View>
                  <View style={[styles.hiwImageContainer, styles.hiwImageMargin]}>
                    <Image 
                      source={require('../../images/remove_existing.png')}
                      style={[styles.hiwImage]} />
                  </View>
                  <Text style={[styles.hiwText, {marginBottom: 15}]}>
                    Don’t be a scammy seller. If your car is posted twice in the same place you risk losing buyers. <Text style={{fontWeight:'bold'}}>Before proceeding, you agree that all existing ads for your car have been taken down.</Text>
                  </Text>
                </View>
                <View style={{marginTop:15}}>
                  <TouchableOpacity onPress={this.showTOS}>           
                    <Text style={[styles.actionLinkSmall, {marginHorizontal:15, marginTop:15, textAlign:'center'}]}>
                      Read the full Terms of Use
                    </Text>                
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={[styles.bottom, styles.hiwTopWarning]}>
            <View style={styles.stretch}>
              <View style={styles.formField}>
                <Button onPress={this.onConfirm} style={[styles.darkButton, {marginHorizontal:15}]} textStyle={styles.darkButtonText} isDisabled={this.state.disabled}>
                  I AGREE
                </Button>
              </View>
            </View>
          </View>
        </View>
        <LoadingOverlay
          isVisible={this.state.creatingListing || this.state.uploadingPhotos || this.state.submittingListing}
          text={this.state.creatingListing ? "Creating your listing..." : this.state.uploadingPhotos ? "Uploading your photos...\n" + (this.state.photosRemaining ? "(" + this.state.photosRemaining + " remaining)" : "") : "Submitting your listing for review..." } />
      </View>
    );
  }
});

module.exports = InfoAgreements;
