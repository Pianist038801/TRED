/**
 * TRED React Native App - DAshboard
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * January, 2016
 */
'use strict';

var React = require('react-native');
var {
  Text,
  View,
  Navigator,
  TouchableOpacity,
  Platform,
  BackAndroid,
} = React;

var styles = Platform.OS === 'android' ?
  require('./styles/baseStylesAndroid') : require('./styles/baseStylesIOS');

var orientationService = require('./services/orientation.service');
var NavigationBarRouteMapper = require('./components/NavigationBarRouteMapper.js');
var LocalStorage = require('./services/localStorage.service');
var permissions = require('./services/permission.service');
var constants = require('./services/constant.service');
var navigationService = require('./services/navigation.service');
var NavigationBar = require('./components/NavigationBar');
var notifications = require('./services/notification.service');

var BaseConfig = Navigator.SceneConfigs.FloatFromRight;
var CustomLeftToRightGesture = Object.assign({}, BaseConfig.gestures.pop, {
  // Make it snap back really quickly after canceling pop
  snapVelocity: 6,
});

var CustomSceneConfig = Object.assign({}, BaseConfig, {
  // A very tightly wound spring will make this transition fast
  springTension: 60,
  springFriction: 1,
  // Use our custom gesture defined above
  gestures: {
    pop: {},
  }
});

var homeRoute = {id:"Home", name: "Get Started"};
var step1Route = {id:"SellHIWOne", name: "Sell How It Works Step 1"};
var step2Route = {id:"SellHIWTwo", name: "Sell How It Works Step 2"};
var step3Route = {id:"SellHIWThree", name: "Sell How It Works Step 3"};
var step4Route = {id:"SellHIWFour", name: "Sell How It Works Step 4"};
var aboutYouRoute = {id:"AboutYou", name: "About You"};
var infoAdviceRoute = {id:"InfoAdvice", name: "Info Advice"};
var infoPhotosRoute = {id:"InfoPhotos", name: "Info Photos"};
var infoVinRoute = {id:"InfoVin", name: "Info VIN"};
var photoVinRoute = {id:"PhotoVin", name: "Photo VIN"};
var manualVinRoute = {id:"ManualVinEntry", name: "Manual VIN Entry"};
var photoFDCRoute = {id:"PhotoFrontDriverCorner", name: "Photo Front Driver Corner"};
var photoDSRoute = {id:"PhotoDriverSide", name: "Photo Driver Side"};
var photoRDCRoute = {id:"PhotoRearDriverCorner", name: "Photo Rear Driver Corner"};
var photoRRoute = {id:"PhotoRear", name: "Photo Rear"};
var photoRPCRoute = {id:"PhotoRearPassengerCorner", name: "Photo Rear Passenger Corner"};
var photoPSRoute = {id:"PhotoPassengerSide", name: "Photo Passenger Side"};
var photoFIRoute = {id:"PhotoFrontInterior", name: "Photo Front Interior"};
var photoFPCRoute = {id:"PhotoFrontPassengerCorner", name: "Photo Front Passenger Corner"};
var photoFRoute = {id:"PhotoFront", name: "Photo Front"};
var photoDRoute = {id:"PhotoDashboard", name: "Photo Dashboard"};
var vMileageRoute = {id:"VehicleMileage", name: "Vehicle Mileage"};
var photoCCRoute = {id:"PhotoConsole", name: "Photo Console"};
var infoQuestionsRoute = {id:"InfoQuestions", name: "Info Questions"};
var vExteriorColorRoute = {id:"VehicleExteriorColor", name: "Vehicle Exterior Color"};
var vInteriorColorRoute = {id:"VehicleInteriorColor", name: "Vehicle Interior Color"};
var vOptionsRoute = {id:"VehicleOptions", name: "Vehicle Options"};
var vInfoRoute = {id:"VehicleInfo", name: "Vehicle Info"};
var vLocationRoute = {id:"VehicleLocation", name: "Vehicle Location"};
var loanInfoRoute = {id:"LoanInfo", name: "Loan Info"};
var priceRoute = {id:"Price", name: "Price"};
var agreementsRoute = {id:"Agreements", name: "Agreements"};
var howHeardAboutRoute = {id: "HowHeardAboutTred", name: "How Heard About Tred"};
var dashboardRoute = {id:"Dashboard", name: "Dashboard"};
var listingRoute = {id:"Listing", name: "Listing"};
var viewListingsRoute = {id:"ViewListings", name: "View Listings"};
var editListingRoute = {id:"EditListing", name: "Edit Listing"};
var testDriveTimeRoute = {id:"TestDriveTime", name: "Test Drive Time"};
var testDriveLocationRoute = {id:"TestDriveLocation", name: "Test Drive Location"};
var testDriveNotesRoute = {id:"TestDriveNotes", name: "Test Drive Notes"};
var testDriveRoute = {id:"TestDrive", name: "Test Drive"};
var testDriveChecklistRoute = {id:"TestDriveChecklist", name: "Test Drive Checklist"};
var offerRoute = {id:"Offer", name: "Offer"};
var acceptOfferRoute = {id:"AcceptOffer", name: "Accept Offer"};
var counterOfferRoute = {id:"CounterOffer", name: "Counter Offer"};
var supportRoute = {id:"Support", name: "Support"};
var termsRoute = {id:"TermsOfUse", name: "Terms Of Use"};
var privacyRoute = {id:"Privacy", name: "Privacy Policy"};
var aboutRoute = {id:"AboutTredApp", name: "AboutTredApp"};
var loginRoute = {id:"Login", name:"Login"};

var routeStack = [homeRoute, step1Route, step2Route, step3Route, step4Route, aboutYouRoute, infoAdviceRoute, infoPhotosRoute, infoVinRoute, photoVinRoute, photoFDCRoute, photoDSRoute, photoRDCRoute, photoRRoute, photoRPCRoute, photoPSRoute, photoFIRoute, photoFPCRoute, photoFRoute, photoDRoute, photoCCRoute, vMileageRoute, infoQuestionsRoute, vExteriorColorRoute, vInteriorColorRoute, vOptionsRoute, vInfoRoute, vLocationRoute, loanInfoRoute, priceRoute, agreementsRoute, howHeardAboutRoute, dashboardRoute, listingRoute, viewListingsRoute, editListingRoute, testDriveTimeRoute, testDriveLocationRoute, testDriveNotesRoute, testDriveRoute, testDriveChecklistRoute, offerRoute, acceptOfferRoute, counterOfferRoute, supportRoute, termsRoute, privacyRoute, aboutRoute, loginRoute, manualVinRoute];

var Root = React.createClass({
  getInitialState: function(){
    return {
      isHome: true,
      isDashboard: false,
      routeMapper: NavigationBarRouteMapper(null, "Need Help?", null, 'Support', false),
      loaded:false,
    }
  },
  componentWillMount: function(){
    var component = this;

    LocalStorage.getObject('initialRoute').then(function(route){
      if(route){
        if(route.id !== 'Home'){
          component.setState({
            loaded: true,
          });
          if(route.id === 'Listing'){
            component.refs.nav.push(route);
            component.forceUpdate();          
          } else {
            var index = routeStack.findIndex((obj) => { return obj.id === route.id;});
            component.refs.nav.jumpTo(routeStack[index]);
            component.forceUpdate();
          }
        }
      }
    });
    BackAndroid.addEventListener('hardwareBackPress', function() {
      if (!component.onHome()) {
        if (!component.onDashboard()){
          component.goBack();
          return true;
        } else {
          component.goHome();
          return true;
        }
      }
      return false;
    });

  },
  onHome: function(){
    return this.state.isHome;
  },
  onDashboard: function(){
    return this.state.isDashboard;    
  },
  goHome: function(){
    if(this.refs.nav && permissions.isAllowed(constants.PERMISSION_NAVIGATE)){
      this.refs.nav.popToRoute(homeRoute);
    }
  },
  goBack: function(){
    if(this.refs.nav && permissions.isAllowed(constants.PERMISSION_NAVIGATE)){
      this.refs.nav.pop();
    }
  },
  initializeRoute: function(route, routeWithProps){
    if(routeWithProps &&
       route.id !== 'Support' &&
       route.id !== 'TermsOfUse' &&
       route.id !== 'Privacy' &&
       route.id !== 'AboutTredApp' &&
       route.id !== 'Login' &&
       route.id !== 'ManualVinEntry' &&
       route.id !== 'ViewListings' &&
       route.id !== 'EditListing' &&
       route.id !== 'TestDriveTime' &&
       route.id !== 'TestDriveLocation' &&
       route.id !== 'TestDriveNotes' &&
       route.id !== 'TestDrive' &&
       route.id !== 'TestDriveChecklist' &&
       route.id !== 'Offer' &&
       route.id !== 'AcceptOffer' &&
       route.id !== 'CounterOffer'){
      LocalStorage.setObject('initialRoute', routeWithProps);
    }    
    if(route.id === "Home"){
      this.setState({
        isHome:true,
        isDashboard: false,
        routeMapper: NavigationBarRouteMapper("My Dashboard", "Need Help?", "Dashboard", 'Support', false),
        navStyle: [styles.navBar, {backgroundColor: '#02BAF2'}],
        loaded: true,
      });
    } else if(route.id === "HowHeardAboutTred"){
      this.setState({
        isHome:false,
        isDashboard: true,
        routeMapper: NavigationBarRouteMapper(null, "Need Help?", null, 'Support', true),
        navStyle: [styles.navBar],
        loaded: true,
      });
    } else if(route.id === "Dashboard"){
      this.setState({
        isHome:false,
        isDashboard: true,
        routeMapper: NavigationBarRouteMapper("Sell More", "Need Help?", 'AboutYou', 'Support', true),
        navStyle: [styles.navBar],
        loaded: true,
      });
    } else if( route.id === "Listing"){
      this.setState({
        isHome:false,
        isDashboard: true,
        routeMapper: NavigationBarRouteMapper("Back", "Need Help?", 'ListingToDashboard', 'Support', true),
        navStyle: [styles.navBar],
        loaded: true,
      });        
    } else if(route.id === "TestDriveChecklist"){
      if(routeWithProps && routeWithProps.standAlone){
        this.setState({
          isHome:false,
          isDashboard: true,
          routeMapper: NavigationBarRouteMapper(null, "Need Help?", null, 'Support', true),
          navStyle: [styles.navBar],
          loaded: true,
        });
      } else {
        this.setState({
          isHome:false,
          isDashboard: true,
          routeMapper: NavigationBarRouteMapper('Back', "Need Help?", null, 'Support', true),
          navStyle: [styles.navBar],
          loaded: true,
        });        
      }      
    } else if (route.id === 'Support' || route.id === 'TermsOfUse' || route.id === 'Privacy' || route.id === "AboutTredApp"){
      this.setState({
        isHome:false,
        isDashboard: false,
        routeMapper: NavigationBarRouteMapper("Back", null, null, null, true),
        navStyle: styles.navBar,
        loaded: true,
      });
    } else {
      this.setState({
        isHome:false,
        isDashboard: false,
        routeMapper: NavigationBarRouteMapper('Back', 'Need Help?', null, 'Support', true),
        navStyle: styles.navBar,
        loaded: true,
      });        
    }
  },
  componentDidMount: function(){
    this.initializeRoute(homeRoute);
    orientationService.lockToPortrait();
    this.refs.nav.navigationContext.addListener('willfocus', (event) => {
      var route = event.data.route;
      var index = routeStack.findIndex((obj) => { return obj.id === route.id;});
      this.initializeRoute(routeStack[index], route);
    });
    navigationService.registerNavigator(this.refs.nav);
    notifications.initialize();
  },
  configureScene: function(route) {
    return CustomSceneConfig;
  },
  render: function(){
    return (
      <Navigator
        ref="nav"
        initialRoute={homeRoute}
        initialRouteStack={routeStack}
        renderScene={this.renderScene}
        configureScene={this.configureScene}
        navigationBar={
          <NavigationBar style={this.state.navStyle} routeMapper={this.state.routeMapper} />
        }
        sceneStyle={styles.scene} />
    );
  }, 
  renderScene: function(route, navigator){
    var routeId = route.id;
    navigationService.setCurrentRoute(route);
    if(this.state.loaded){
      if (routeId === 'Home') {
        var Home = require('./scenes/Home');
        return (
          <Home navigator={navigator} />
        );
      }
      if (routeId === 'SellHIWOne') {
        var SellHIWOne = require('./scenes/SellHIWOne');
        return (
          <SellHIWOne navigator={navigator} />
        );
      }
      if (routeId === 'SellHIWTwo') {
        var SellHIWTwo = require('./scenes/SellHIWTwo');
        return (
          <SellHIWTwo navigator={navigator} />
        );
      }
      if (routeId === 'SellHIWThree') {
        var SellHIWThree = require('./scenes/SellHIWThree');
        return (
          <SellHIWThree navigator={navigator} />
        );
      }
      if (routeId === 'SellHIWFour') {
        var SellHIWFour = require('./scenes/SellHIWFour');
        return (
          <SellHIWFour navigator={navigator} />
        );
      }
      if (routeId === 'AboutYou') {
        var AboutYou = require('./scenes/AboutYou');
        return (
          <AboutYou navigator={navigator} />
        );
      }
      if (routeId === 'InfoAdvice') {
        var InfoAdvice = require('./scenes/InfoAdvice');
        return (
          <InfoAdvice navigator={navigator} />
        );
      }
      if (routeId === 'InfoPhotos') {
        var InfoPhotos = require('./scenes/InfoPhotos');
        return (
          <InfoPhotos navigator={navigator} />
        );
      }
      if (routeId === 'InfoVin') {
        var InfoVin = require('./scenes/InfoVin');
        return (
          <InfoVin navigator={navigator} />
        );
      }    
      if (routeId === 'PhotoVin') {
        var PhotoVin = require('./scenes/PhotoVin');
        return (
          <PhotoVin navigator={navigator} vinInfo={route.vinInfo ? route.vinInfo : null} styleId={route.styleId ? route.styleId : null} />
        );
      }
      if (routeId === 'ManualVinEntry') {
        var ManualVinEntry = require('./scenes/ManualVinEntry');
        return (
          <ManualVinEntry navigator={navigator} />
        );
      }
      if (routeId === 'PhotoFrontDriverCorner') {
        var PhotoFrontDriverCorner = require('./scenes/PhotoFrontDriverCorner');
        return (
          <PhotoFrontDriverCorner navigator={navigator} />
        );
      }
      if (routeId === 'PhotoDriverSide') {
        var PhotoDriverSide = require('./scenes/PhotoDriverSide');
        return (
          <PhotoDriverSide navigator={navigator} />
        );
      }
      if (routeId === 'PhotoRearDriverCorner') {
        var PhotoRearDriverCorner = require('./scenes/PhotoRearDriverCorner');
        return (
          <PhotoRearDriverCorner navigator={navigator} />
        );
      }
      if (routeId === 'PhotoRear') {
        var PhotoRear = require('./scenes/PhotoRear');
        return (
          <PhotoRear navigator={navigator} />
        );
      }    
      if (routeId === 'PhotoRearPassengerCorner') {
        var PhotoRearPassengerCorner = require('./scenes/PhotoRearPassengerCorner');
        return (
          <PhotoRearPassengerCorner navigator={navigator} />
        );
      }
      if (routeId === 'PhotoPassengerSide') {
        var PhotoPassengerSide = require('./scenes/PhotoPassengerSide');
        return (
          <PhotoPassengerSide navigator={navigator} />
        );
      }    
      if (routeId === 'PhotoFrontInterior') {
        var PhotoFrontInterior = require('./scenes/PhotoFrontInterior');
        return (
          <PhotoFrontInterior navigator={navigator} />
        );
      }
      if (routeId === 'PhotoFrontPassengerCorner') {
        var PhotoFrontPassengerCorner = require('./scenes/PhotoFrontPassengerCorner');
        return (
          <PhotoFrontPassengerCorner navigator={navigator} />
        );
      }    
      if (routeId === 'PhotoFront') {
        var PhotoFront = require('./scenes/PhotoFront');
        return (
          <PhotoFront navigator={navigator} />
        );
      }
      if (routeId === 'PhotoConsole') {
        var PhotoConsole = require('./scenes/PhotoConsole');
        return (
          <PhotoConsole navigator={navigator} />
        );
      }
      if (routeId === 'PhotoDashboard') {
        var PhotoDashboard = require('./scenes/PhotoDashboard');
        return (
          <PhotoDashboard navigator={navigator} />
        );
      }
      if (routeId === 'VehicleMileage') {
        var VehicleMileage = require('./scenes/VehicleMileage');
        return (
          <VehicleMileage navigator={navigator} />
        );
      }
      if (routeId === 'InfoQuestions') {
        var InfoQuestions = require('./scenes/InfoQuestions');
        return (
          <InfoQuestions navigator={navigator} />
        );
      }
      if (routeId === 'VehicleExteriorColor') {
        var VehicleExteriorColor = require('./scenes/VehicleExteriorColor');
        return (
          <VehicleExteriorColor navigator={navigator} />
        );
      }
      if (routeId === 'VehicleInteriorColor') {
        var VehicleInteriorColor = require('./scenes/VehicleInteriorColor');
        return (
          <VehicleInteriorColor navigator={navigator} />
        );
      }
      if (routeId === 'VehicleOptions') {
        var VehicleOptions = require('./scenes/VehicleOptions');
        return (
          <VehicleOptions navigator={navigator} />
        );
      }            
      if (routeId === 'VehicleInfo') {
        var VehicleInfo = require('./scenes/VehicleInfo');
        return (
          <VehicleInfo navigator={navigator} />
        );
      }
      if (routeId === 'VehicleLocation') {
        var VehicleLocation = require('./scenes/VehicleLocation');
        return (
          <VehicleLocation navigator={navigator} />
        );
      }
      if (routeId === 'LoanInfo') {
        var LoanInfo = require('./scenes/LoanInfo');
        return (
          <LoanInfo navigator={navigator} />
        );
      }
      if (routeId === 'Price') {
        var Price = require('./scenes/Price');
        return (
          <Price navigator={navigator} />
        );
      }
      if (routeId === 'Agreements') {
        var Agreements = require('./scenes/Agreements');
        return (
          <Agreements navigator={navigator} />
        );
      }
      if (routeId === 'HowHeardAboutTred') {
        var HowHeardAboutTred = require('./scenes/HowHeardAboutTred');
        return (
          <HowHeardAboutTred navigator={navigator} />
        );
      }
      if (routeId === 'Dashboard') {
        var Dashboard = require('./scenes/dashboard/Dashboard');
        if(route.initialTab){
          return (
            <Dashboard navigator={navigator} initialTab={route.initialTab} />
          );
        } else {
          return (
            <Dashboard navigator={navigator} />
          );
        }
      }
      if (routeId === 'Listing') {
        var Listing = require('./scenes/dashboard/Listing');
        if(route.listing){
          return (
            <Listing navigator={navigator} vin={route.vin ? route.vin : null} listing={route.listing} initialTab={route.initialTab ? route.initialTab : "stats"} />
          );
        } else {
          return (
            <Listing navigator={navigator} vin={route.vin ? route.vin : null} listing={null} initialTab={route.initialTab ? route.initialTab : "stats"} />
          );
        }
      }
      if (routeId === 'ViewListings') {
        var ViewListings = require('./scenes/dashboard/ViewExternalListings');
        return (
          <ViewListings navigator={navigator} vin={route.vin ? route.vin : false} />
        );
      }
      if (routeId === 'EditListing') {
        var EditListing = require('./scenes/dashboard/EditListing');
        return (
          <EditListing navigator={navigator} listing={route.listing ? route.listing : false} />
        );
      }
      if (routeId === 'TestDriveTime') {
        var TestDriveTime = require('./scenes/dashboard/TestDriveTime');
        if(route.vin && route.test_drive_id){
          return (
            <TestDriveTime navigator={navigator} vin={route.vin} test_drive_id={route.test_drive_id} />
          );
        } else {
          return (
            <TestDriveTime navigator={navigator} vin={null} test_drive_id={null} />
          );
        }
      }
      if (routeId === 'TestDriveLocation') {
        var TestDriveLocation = require('./scenes/dashboard/TestDriveLocation');
        if(route.vin && route.test_drive_id){
          return (
            <TestDriveLocation navigator={navigator} vin={route.vin} test_drive_id={route.test_drive_id} />
          );
        } else {
          return (
            <TestDriveLocation navigator={navigator} vin={null} test_drive_id={null} />
          );
        }
      }
      if (routeId === 'TestDriveNotes') {
        var TestDriveNotes = require('./scenes/dashboard/TestDriveNotes');
        if(route.vin && route.test_drive_id){
          return (
            <TestDriveNotes navigator={navigator} vin={route.vin} test_drive_id={route.test_drive_id} />
          );
        } else {
          return (
            <TestDriveNotes navigator={navigator} vin={null} test_drive_id={null} />
          );
        }
      }
      if (routeId === 'TestDrive') {
        var TestDrive = require('./scenes/dashboard/TestDrive');
        if(route.vin && route.test_drive_id){
          return (
            <TestDrive navigator={navigator} vin={route.vin} test_drive_id={route.test_drive_id} />
          );
        } else {
          return (
            <TestDrive navigator={navigator} vin={null} test_drive_id={null} />
          );
        }
      }
      if (routeId === 'TestDriveChecklist') {
        var TestDriveChecklist = require('./scenes/dashboard/TestDriveChecklist');
        if(route.vin && route.test_drive_id){
          return (
            <TestDriveChecklist ref="checklist" navigator={navigator} vin={route.vin} test_drive_id={route.test_drive_id} standAlone={route.standAlone || false} />
          );
        } else {
          return (
            <TestDriveChecklist ref="checklist" navigator={navigator} vin={null} test_drive_id={null} standAlone={route.standAlone || false} />
          );
        }
      }      
      if (routeId === 'Offer') {
        var Offer = require('./scenes/dashboard/Offer');
        if(route.thread_id){
          return (
            <Offer navigator={navigator} thread_id={route.thread_id} />
          );
        } else {
          return (
            <Offer navigator={navigator} thread_id={null} />
          );
        }
      }
      if (routeId === 'AcceptOffer') {
        var AcceptOffer = require('./scenes/dashboard/AcceptOffer');
        if(route.thread_id){
          return (
            <AcceptOffer navigator={navigator} thread_id={route.thread_id} />
          );
        } else {
          return (
            <AcceptOffer navigator={navigator} thread_id={null} />
          );
        }
      }
      if (routeId === 'CounterOffer') {
        var CounterOffer = require('./scenes/dashboard/CounterOffer');
        if(route.thread_id){
          return (
            <CounterOffer navigator={navigator} thread_id={route.thread_id} />
          );
        } else {
          return (
            <CounterOffer navigator={navigator} thread_id={null} />
          );
        }
      }      
      if (routeId === 'Support') {
        var Support = require('./scenes/Support');
        return (
          <Support navigator={navigator} />
        );
      }
      if (routeId === 'TermsOfUse') {
        var TermsOfUse = require('./scenes/TermsOfUse');
        return (
          <TermsOfUse navigator={navigator} />
        );
      }
      if (routeId === 'Privacy') {
        var Privacy = require('./scenes/Privacy');
        return (
          <Privacy navigator={navigator} />
        );
      }
      if (routeId === 'AboutTredApp') {
        var AboutTredApp = require('./scenes/AboutTredApp');
        return (
          <AboutTredApp navigator={navigator} />
        );
      }
      if (routeId === 'Login') {
        var Login = require('./scenes/Login');
        return (
          <Login navigator={navigator} callbackRoute={route.callbackRoute ? route.callbackRoute : {id: "Home"}} onLogin={route.onLogin} goHome={route.goHome ? route.goHome : false}/>
        );
      }
      return this.noRoute(navigator);
    }
  },
  noRoute: function(navigator) {
    return (
      <View style={{flex:1}}>
        <View style={{flex:1, alignItems: 'stretch', justifyContent:'center'}}>
          <TouchableOpacity style={styles.container} onPress={() => navigator.pop()}>
            <Text style={styles.titleText}> OOPS! Go Back </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
});

module.exports = Root;
