/**
 * TRED Base Styles for IOS
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
 */
'use strict';

var React = require('react-native');
var {
  StyleSheet,
} = React;
var cssVar = require('./cssVar');
var Device = require('react-native-device');

if(Device.height === 480){ // iPhone 4s
  var cameraHeight = 240;
  var capturedImageHeight = 240;
  var overlayImageWidth = 320;
  var overlayImageHeight = 240;
  var overlayImageLandscapeWidth = 480;
  var overlayImageLandscapeHeight = 360;
  var cameraTitleFontSize = 16;
  var cameraTextFontSize = 14;
  var pTextFontSize = 16;
  var subTextFontSize = 16;
  var hiwTextFontSize = 18;
  var signUpImageWidth = 190;
  var signUpImageHeight = 105;
  var signUpTop = 60;
  var logoWidth = 230;
  var logoHeight = 54;
  var buttonHeight = 42;
  var buttonFontSize = 20;
  var linkFontSize = 16;
  var tableTextFontSize = 14;
  var supportImageWidth = 200;
  var supportImageHeight = 89;
  var hiwImageWidth = 260;
  var hiwImageHeight = 116;
  var hiwSmallImageWidth = 203;
  var hiwSmallImageHeight = 90;
  var hiwLargeImageWidth = 197;
  var hiwLargeImageHeight = 140;
  var hiwHeadingFontSize = 16;
  var hiwFontSize = 14;
  var inputHeight = 40;
  var inputFontSize = 16;
  var labelFontSize = 13;
  var inputMaskHeight = 26;
  var largeTextInputHeight = 60;
  var carTitleFontSize = 20;
} else if(Device.height === 568){ // iPhone 5/5s
  var cameraHeight = 240;
  var capturedImageHeight = 240;
  var overlayImageWidth = 320;
  var overlayImageHeight = 240;
  var overlayImageLandscapeWidth = 568;
  var overlayImageLandscapeHeight = 426;
  var cameraTitleFontSize = 16;
  var cameraTextFontSize = 16;
  var pTextFontSize = 16;
  var subTextFontSize = 16;
  var hiwTextFontSize = 18;
  var signUpImageWidth = 250;
  var signUpImageHeight = 139;
  var signUpTop = 60;
  var logoWidth = 280;
  var logoHeight = 66;
  var buttonHeight = 50;
  var buttonFontSize = 22;
  var linkFontSize = 18;
  var tableTextFontSize = 16;
  var supportImageWidth = 260;
  var supportImageHeight = 116;
  var hiwImageWidth = 300;
  var hiwImageHeight = 133;
  var hiwSmallImageWidth = 225;
  var hiwSmallImageHeight = 100;
  var hiwLargeImageWidth = 300;
  var hiwLargeImageHeight = 214;
  var hiwHeadingFontSize = 16;
  var hiwFontSize = 16;
  var inputHeight = 45;
  var inputFontSize = 18;
  var labelFontSize = 15;
  var inputMaskHeight = 30;
  var largeTextInputHeight = 135;
  var carTitleFontSize = 24;
} else if(Device.height === 667){ // iPhone 6/6s
  var cameraHeight = 280;
  var capturedImageHeight = 280;
  var overlayImageWidth = 373;
  var overlayImageHeight = 280;
  var overlayImageLandscapeWidth = 667;
  var overlayImageLandscapeHeight = 500;
  var cameraTitleFontSize = 20;
  var cameraTextFontSize = 18;
  var pTextFontSize = 18;
  var subTextFontSize = 16;
  var hiwTextFontSize = 18;
  var signUpImageWidth = 250;
  var signUpImageHeight = 139;
  var signUpTop = 90;
  var logoWidth = 280;
  var logoHeight = 66;
  var buttonHeight = 50;
  var buttonFontSize = 24;
  var linkFontSize = 20;
  var tableTextFontSize = 16;
  var supportImageWidth = 260;
  var supportImageHeight = 116;
  var hiwImageWidth = 300;
  var hiwImageHeight = 133;
  var hiwSmallImageWidth = 225;
  var hiwSmallImageHeight = 100;
  var hiwLargeImageWidth = 300;
  var hiwLargeImageHeight = 214;
  var hiwHeadingFontSize = 20;
  var hiwFontSize = 18;
  var inputHeight = 45;
  var inputFontSize = 18;
  var labelFontSize = 15;
  var inputMaskHeight = 30;
  var largeTextInputHeight = 135;
  var carTitleFontSize = 28;
} else if(Device.height === 736){ // iPhone 6+/6s+
  var cameraHeight = 280;
  var capturedImageHeight = 280;
  var overlayImageWidth = 412;
  var overlayImageHeight = 280;
  var overlayImageLandscapeWidth = 736;
  var overlayImageLandscapeHeight = 552;
  var cameraTitleFontSize = 20;
  var cameraTextFontSize = 18;
  var pTextFontSize = 18;
  var subTextFontSize = 16;
  var hiwTextFontSize = 18;
  var signUpImageWidth = 250;
  var signUpImageHeight = 139;
  var signUpTop = 90;
  var logoWidth = 280;
  var logoHeight = 66;
  var buttonHeight = 50;
  var buttonFontSize = 24;
  var linkFontSize = 20;
  var tableTextFontSize = 16;
  var supportImageWidth = 260;
  var supportImageHeight = 116;
  var hiwImageWidth = 300;
  var hiwImageHeight = 133;
  var hiwSmallImageWidth = 225;
  var hiwSmallImageHeight = 100;
  var hiwLargeImageWidth = 300;
  var hiwLargeImageHeight = 214;
  var hiwHeadingFontSize = 20;
  var hiwFontSize = 18;
  var inputHeight = 45;
  var inputFontSize = 18;
  var labelFontSize = 15;
  var inputMaskHeight = 30;
  var largeTextInputHeight = 135;
  var carTitleFontSize = 28;
}

var baseStylesIOS = StyleSheet.create({
  /***** LAYOUT *****/
  main: {
    flex:1,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingTop:60,
    paddingBottom:75,
  },
  scroll: {
    flex:1,
    //flexDirection: 'row',
  },
  content: {
    paddingHorizontal:15,
    paddingTop:15,
    paddingBottom:30,
  },
  stretch: {
    alignItems: 'stretch',
  },
  bottom: {
    flex:1,
    backgroundColor: cssVar('primaryDark'),
    position:'absolute',
    bottom:0,
    left:0,
    right:0,
    paddingBottom:3,
  },
  extraBottom: {
    marginBottom:0,
  },
  scene: {
    flex: 1,
    backgroundColor: cssVar('primary'),    
  },
  center: {
    alignItems:'center',
    justifyContent: 'center',
  },
  container: {
    flex:1,
    paddingTop:75,
  },
  home: {
    paddingTop:0,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: logoWidth,
    height: logoHeight,
    marginTop:signUpTop,
  },
  signupImage: {
    width: signUpImageWidth,
    height: signUpImageHeight,
    marginBottom:15,
  },
  modal: {
    flex:1,
    alignItems:'flex-start',
  },
  /***** NAVIGATION BAR *****/
  navBar: {
    backgroundColor: cssVar('primaryDark'),
  },
  navButton: {
  	flex:1,
    justifyContent: 'center',
  },
  navTitle: {
  	flex:1,
  	alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleText: {
    color: 'white',
    fontSize: 18,
    fontFamily: cssVar('fontTitleHeading'),        
  },
  navText: {
    color: '#ffffff',
    margin: 8,
    fontSize: 16,
    fontFamily: cssVar('fontNav'),
    marginLeft:3,
  },
  navLogo: {
    width: 111,
    height: 26,
  },
  backContainer: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  backArrow: {
    marginLeft: 3,
    width: 17,
    height: 24,    
  },

  /***** LISTVIEW *****/
  listViewBackground: {
   backgroundColor: cssVar('superLightGrey'),
  },
  listViewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: cssVar('superLightGrey'),
  },
  listViewMessagesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: cssVar('superLightGrey'),
  },
  listViewCheck: {
    width:20,
    height:20,
    marginTop:5,
    marginLeft:10,
  },
  listViewBadge: {
    position:'absolute',
    top:12,
    left:48,
    backgroundColor: "transparent",
  },
  listViewBadgeOffer: {
    position:'absolute',
    top:12,
    left:42,
    backgroundColor: "transparent",
  },  
  separator: {
    height: 1,
    backgroundColor: cssVar('kindaDarkGrey'),
  },
  section: {
    paddingVertical:5,
    paddingHorizontal:15,
    backgroundColor: cssVar('primaryDark'),
  },
  sectionText: {
    fontSize: 18,
    color: 'white',
  },
  listViewText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  checklistViewText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
  },
  selectedRowText: {
    fontWeight: 'bold',
  },
  listViewError: {
    flex: 1,
    fontSize: 16,
    lineHeight: 25,
    textAlign:'center',
    alignItems:'center',
    justifyContent:'center',
    paddingTop:15,
  },  
  swatch: {
    width:32,
    height:32,
    marginRight:10
  },

  /***** TEXT *****/
  titleText: {
    fontSize: 36,
    color: "white",
    fontFamily: cssVar('fontHeading'),
    textAlign:'center',
    marginBottom:0,
  },
  pText: {
    fontSize: pTextFontSize,
    lineHeight: pTextFontSize + 4,
    color: "white",
    fontFamily: cssVar('fontRegular'),
    textAlign:'center',
    marginTop: 0,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  priceText: {
    textAlign: 'center', 
    fontSize:42, 
    lineHeight:42, 
    fontWeight:'bold', 
    marginTop:5, 
    marginBottom:0,
  },
  finePrint: {
    marginTop:10,
    color:'black',
    fontSize:11,
    lineHeight:14,    
  },
  smallerPrint: {
    marginTop:10,
    color:'black',
    fontSize:12,
    lineHeight:16,
  },
  subText: {
    fontSize: subTextFontSize,
    lineHeight: subTextFontSize + 4,
    color: "white",
    fontFamily: cssVar('fontRegular'),
    textAlign:'center',
    marginTop: -11,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  subTextLink: {
    fontSize: subTextFontSize,
    lineHeight: subTextFontSize + 4,
    color: cssVar('linkBlue'),
    fontFamily: cssVar('fontRegular'),
    fontWeight: 'bold',
    textAlign:'center',
    marginTop: -11,
    marginLeft:-6,
    marginBottom: 15,
    paddingHorizontal: 15,
    textDecorationLine: 'underline',    
  },
  h3: {
    fontSize: 32,
    color: "white",
    fontFamily: cssVar('fontHeading'),
  },
  h4: {
    flex:1,
    textAlign: 'center',   
    fontSize: 16,
    color: "white",
    marginTop: 20,
    marginBottom: 5,
    fontFamily: cssVar('fontSubHeading'),
  },

  /***** Buttons *****/
  actionButton: {
    marginHorizontal:15,
    marginVertical:15,
    height: buttonHeight,
    backgroundColor: cssVar('action'),
    borderColor: cssVar('action'),
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: buttonFontSize,
    fontFamily: cssVar('fontButton'),
  },
  normalButton: {
    marginHorizontal:15,
    marginVertical:15,
    height: 36,
    backgroundColor: cssVar('primaryDark'),
    borderColor: cssVar('primaryDark'),
  },
  darkBlueButton: {
    marginHorizontal:15,
    marginVertical:15,
    height: buttonHeight,
    backgroundColor: cssVar('primaryDark'),
    borderColor: cssVar('primaryDark'),
  },
  normalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: cssVar('fontButton'),
  },  
  buttonTextSmall: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: cssVar('fontButton'),
  },
  supportButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: cssVar('fontButton'),
  },
  blueButton: {
    marginHorizontal:15,
    marginVertical:15,
    height: buttonHeight,
    backgroundColor: cssVar('primary'),
    borderColor: cssVar('primary'),
  },
  blueButtonText: {
    color: '#ffffff',
    fontSize: buttonFontSize,
    fontFamily: cssVar('fontButton'),
  },
  secondaryButton: {
    marginHorizontal:15,
    marginVertical:15,
    height: buttonHeight,
    backgroundColor: cssVar('secondary'),
    borderColor: cssVar('secondary'),
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: buttonFontSize,
    fontFamily: cssVar('fontButton'),
  },
  darkButton: {
    marginHorizontal:15,
    marginVertical:15,
    height: buttonHeight,
    backgroundColor: cssVar('secondaryDark'),
    borderColor: cssVar('secondaryDark'),
  },
  darkButtonText: {
    color: '#ffffff',
    fontSize: buttonFontSize,
    fontFamily: cssVar('fontButton'),
  },
  tertiaryButton: {
    marginHorizontal:15,
    marginVertical:15,
    height: buttonHeight,
    backgroundColor: cssVar('tertiary'),
    borderColor: cssVar('tertiary'),
  },
  tertiaryButtonText: {
    color: '#ffffff',
    fontSize: buttonFontSize,
    fontFamily: cssVar('fontButton'),
  },
  cancelButton: {
    marginHorizontal:15,
    marginVertical:15,
    height: buttonHeight,
    backgroundColor: cssVar('uhoh'),
    borderColor: cssVar('uhoh'),
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: buttonFontSize,
    fontFamily: cssVar('fontButton'),
  },
  actionLink: {
    color: '#ffffff',
    fontSize: linkFontSize,
    lineHeight: linkFontSize + 4,
    fontFamily: cssVar('fontRegular'),
    textDecorationLine: 'underline',    
  },
  actionLinkSmall: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: cssVar('fontRegular'),
    textDecorationLine: 'underline',    
  },
  buttonsBottom: {
    flex:1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    marginBottom:5
  },

  /***** Forms ******/
  formField: {
    alignItems:'stretch',
    flexDirection: 'column',
  },
  formFieldHorizontal: {
    alignItems:'stretch',
    flexDirection: 'row',
  },
  inputContainer: {
    flex:1,
    backgroundColor: '#E1EEF3',
    borderColor: '#009DCD',
    borderWidth: 2,
    borderRadius: 5,
    height:inputHeight,
    marginHorizontal:15,
    paddingHorizontal:10,
  },
  inputText: {
    paddingTop:10,
    color: '#364347',
    fontSize: inputFontSize,
    fontFamily: "SourceSansPro-Regular",
  },
  textInput: {
    flex:1,
    backgroundColor: '#E1EEF3',
    color: '#364347',
    borderColor: '#009DCD',
    borderWidth: 2,
    borderRadius: 5,
    height:inputHeight,
    marginHorizontal:15,
    paddingHorizontal:10,
    fontSize: inputFontSize,
    fontFamily: "SourceSansPro-Regular",
  },
  textInputTextOnly: {
    color: '#364347',
    marginVertical:5,
    marginHorizontal:15,
    paddingHorizontal:10,
    fontSize: inputFontSize,
    fontFamily: "SourceSansPro-Regular",
  },
  textInputMaskText: {
    lineHeight:inputMaskHeight,
    fontSize: inputFontSize,
    fontFamily: "SourceSansPro-Regular",
  },
  larger: {
    height:largeTextInputHeight,
  },
  left: {
    marginLeft:15,
    marginRight:5,
  },
  right: {
    marginRight:15,
    marginLeft:5,
  },
  city: {
    flex:.5,
    marginLeft:15,
    marginRight:5,
  },
  state: {
    flex: .2,
    marginRight:5,
    marginLeft:5,
  },
  zip: {
    flex: .3,
    marginRight:15,
    marginLeft:5,
  },
  label: {
    flex:1,
    fontSize: labelFontSize,
    lineHeight:20,
    fontFamily: "SourceSansPro-Regular",
    color: '#ffffff', 
    marginHorizontal:15,
    marginTop:2,
  },
  largeLabel: {
    flex:1,
    fontSize: 18,
    lineHeight:24,
    fontFamily: "SourceSansPro-Regular",
    color: '#ffffff', 
    marginHorizontal:15,
    marginTop:2,
  },
  /***** Camera *****/
  cameraScene: {
    flex: 1,
    backgroundColor: cssVar('primary'),
  },
  camera: {
    flex: 1,
    height: cameraHeight,
    borderTopColor: 'black',
    borderTopWidth: 1,
    borderBottomColor: cssVar('superLightGrey'),
    borderBottomWidth: 1,
  },
  cameraLandscape: {
    flex: 1,
    height: Device.width ,
    justifyContent: 'center',
    alignItems: 'center',
    width: Device.height,
    borderTopColor: 'black',
    borderTopWidth: 1,
    borderBottomColor: cssVar('superLightGrey'),
    borderBottomWidth: 1,
  },
  capturedImage: {
    flex: 1,
    height: capturedImageHeight,
  },
  cameraTitle: {
    fontSize:cameraTitleFontSize,
    fontFamily: cssVar('fontSubHeading'),
    color: '#ffffff',
    textAlign: 'center',
    marginBottom:10,
  },
  testDriveLarge: {
    fontSize:cameraTitleFontSize,
    fontFamily: cssVar('fontSubHeading'),
    color: '#ffffff',
    textAlign: 'center',
    marginBottom:0,
  },  
  cameraText: {
    fontSize:cameraTextFontSize,
    lineHeight: cameraTextFontSize + 4,
    fontFamily: cssVar('fontRegular'),
    color: '#ffffff',
    marginTop:15,
    textAlign: 'center',
    paddingHorizontal:15
  },
  overlayImage: {
    flex:1,
    alignItems: 'center',
    opacity: .7,
    backgroundColor: 'transparent',
    width:overlayImageWidth,
    height:overlayImageHeight,
  },
  overlayImageLandscape: {
    flex:1,
    alignItems: 'center',
    opacity: .7,
    backgroundColor: 'transparent',
    width:overlayImageLandscapeWidth,
    height:overlayImageLandscapeHeight,
  },

  /***** CHART & TABLE *****/
  chart: {
    marginHorizontal:15,
    backgroundColor: '#9ce6fd',
    padding:5,
    borderRadius:5,
  },
  chartRow: {
    flex:1,
    flexDirection: 'row',
  },
  chartGreen: {
    backgroundColor: cssVar('secondary'),
    paddingVertical:4,
    paddingHorizontal: 10,
    marginBottom:2,
  },
  chartBlue: {
    backgroundColor: cssVar('primaryDark'),
    paddingVertical:4,
    paddingHorizontal: 10,
    marginBottom:2,
  },
  chartPurple: {
    backgroundColor: cssVar('tertiary'),
    paddingVertical:4,
    paddingHorizontal: 10,
  },
  chartOrange: {
    backgroundColor: cssVar('actionDark'),
    paddingVertical:4,
    paddingHorizontal: 10,
  },
  table: {
    marginTop:15,
    marginHorizontal:15,
    backgroundColor: '#9ce6fd',
    borderRadius: 5,
    padding:5,
  },
  tableRow: {
    flex:1,
    flexDirection: 'row',
    paddingVertical:4,
    paddingHorizontal: 15,
    borderBottomColor: cssVar('kindaDarkGrey'),
    borderBottomWidth: 1,    
  },
  tableBottom: {
    borderBottomWidth: 0,    
  },
  tableCol65: {
    flex: .65,
  },
  tableCol35: {
    flex: .30,
  },
  tableCol70: {
    flex: .70,
  },
  tableCol30: {
    flex: .30,
  },
  tableCol75: {
    flex: .75,
  },
  tableCol25: {
    flex: .25,
  },
  tableCol10: {
    flex: .10,
  },
  tableCol60: {
    flex: .60,
  },
  tableCol40: {
    flex: .40,
  },
  tableCol90: {
    flex: .90,
  },
  tableText: {
    color: cssVar('superDarkGrey'),
    fontSize:tableTextFontSize,
    fontFamily: cssVar('fontRegular'),    
  },
  tableLink: {
    color: cssVar('linkBlue'),
    fontSize:16,
    fontFamily: cssVar('fontRegular'),
  },
  tableLinkBold: {
    color: cssVar('linkBlue'),
    fontSize:16,
    fontFamily: cssVar('fontTitleHeading'),
  },
  tableHead: {
    fontFamily: cssVar('fontHeading'),    
  },

  /***** SEGMENT *****/
  segment: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: cssVar('primaryDark'),
    marginHorizontal:15,
    borderRadius: 5,
    padding:10,
    marginBottom:5,
  },
  segmentText: {
    fontSize: labelFontSize,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  segmentLabel: {
    flex: .75
  },
  segmentControl: {
    flex: .25
  },

  /***** MODALS *****/
  modalContainer: {
    backgroundColor: cssVar('primary'),
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 30,
    padding: 0,
  },
  modalInnerContainer: {
    backgroundColor: cssVar('primary'),
    borderRadius: 0,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },  
  modalTitle: {
    marginTop:15,
    fontSize:24,
    fontFamily: cssVar('fontHeading'),
    color: '#ffffff',
    textAlign: 'center',
    marginBottom:10,
  },

  /***** How It Works *****/
  hiw: {
    marginVertical: 0,
    marginHorizontal: 0,
  },
  hiwTop: {
    backgroundColor: "#36cefd",
    width: window.width,
    paddingVertical: 10,
    marginTop: 4,
  },
  hiwTopWarning: {
    backgroundColor: cssVar('actionDark'),
  },
  hiwWarning: {
    backgroundColor: cssVar('action'),
  },
  hiwTopSuccess: {
    backgroundColor: cssVar('secondaryDark'),
  },
  hiwSuccess: {
    backgroundColor: cssVar('secondary'),
  },
  hiwHeading: {
    fontSize: hiwHeadingFontSize,
    color: 'white',
    fontFamily: cssVar('fontSubHeading'),
    textAlign:'center',
    marginBottom:0,
  },
  hiwMainTitle: {
    fontSize: 16,
    color: '#0190bc',
    fontFamily: cssVar('fontTitleHeading'),
    textAlign:'center',
  },
  hiwSubTitle: {
    fontSize: 22,
    color: 'white',
    fontFamily: cssVar('fontTitleHeading'),
    textAlign:'center',
  },
  hiwImageContainer: {
    flex:1, 
    alignItems: "center", 
    justifyContent: "center",
    marginTop:15,
    marginBottom:30,
  },
  hiwImageMargin: {
    marginVertical:0, 
    marginBottom:-30, 
    marginTop:0,    
  },
  hiwImage: {
    width: hiwImageWidth,
    height: hiwImageHeight
  },
  hiwSmallImage: {
    width: hiwSmallImageWidth,
    height: hiwSmallImageHeight,
  },
  hiwLargeImageContainer: {
    flex:1, 
    alignItems: "center", 
    justifyContent: "center",
    marginTop:5,
    marginBottom:15,
  },
  hiwLargeImage: {
    width: hiwLargeImageWidth,
    height: hiwLargeImageHeight,
  },
  hiwText: {
    fontSize: hiwFontSize,
    lineHeight: hiwFontSize + 5,
    color: 'white',
    fontFamily: cssVar('fontRegular'),
    textAlign:'center',
  },
  checklistText: {
    fontSize: subTextFontSize,
    lineHeight: subTextFontSize + 4,
    color: 'white',
    fontFamily: cssVar('fontRegular'),
    textAlign:'center',
    marginHorizontal: 15,
  },  
  supportImage: {
    width: supportImageWidth,
    height: supportImageHeight
  },

  /***** inputAccessory *****/
  inputAccessory: {
    position:'absolute', 
    width: Device.width,
  },
  inputAccessoryInner: {
    flex:1, 
    alignItems:'stretch', 
    justifyContent:"center", 
    backgroundColor: '#d8d7d3', 
    paddingVertical:15,
  },
  inputAccessoryText: {
    textAlign:'right', 
    fontSize:18,
    paddingRight:15, 
    color: "#007aff",
  },
  scrollView: {
    marginBottom:0,
  },

  /***** DashBoard ******/
  dashboardHeader: {
    position:'absolute',
    top: 0,
    left:0,
    right:0,
  },
  dashboardHeaderText: {
    fontSize: subTextFontSize,
    lineHeight: subTextFontSize + 4,
    color: "white",
    fontFamily: cssVar('fontRegular'),
    textAlign:'center',
    marginTop:12,
    marginBottom:6,
    fontWeight:'bold',
  },
  extraHeaderText: {
    textAlign:'left',
    marginTop:20,
    marginLeft:15,
  },
  carImage: {
    flex: 1,
    marginTop: 38,
    height: capturedImageHeight -60,
  },
  nextArrow: {
    width:17,
    height:24,
    marginTop:15,
    marginRight:5,
  },
  smallCarImage: {
    width:48,
    height:48,
    marginRight:10,
    borderRadius:5,
  },
  carListViewText: {
    marginTop:8,
    flex: 1,
    fontSize: 18,
    lineHeight: 18,
    fontWeight:'bold',
  },
  trimListViewText: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight:'normal',
    color: '#767676',
  },
  trimListViewTextDisabled: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight:'normal',
    color: '#B2C6CD',
  },
  carTitle: {
    fontSize:carTitleFontSize,
    lineHeight:carTitleFontSize + 4,
    fontFamily: cssVar('fontSubHeading'),
    color: '#ffffff',
    textAlign: 'left',
    marginBottom:10,    
  },
  carTrim: {
    fontSize: subTextFontSize,
    lineHeight: subTextFontSize + 4,
    fontFamily: cssVar('fontRegular'),
    textAlign:'left',
    marginTop: -10,
    marginBottom: 5,
    color: '#eeeeee',
  },
  priceArrow: {
    width: 32,
    height:32,
    marginTop:3,
    marginLeft:-10,
  },
  mainDashboard: {
    flex:1, 
  },
  logoRow: {
    flex:.5,
    flexDirection: "row",
    marginHorizontal:15,
  },
  externalButton: {
    flex:1,
    height:50,
    borderRadius:10,
    marginBottom:6,
  },
  externalLeft: {
    flex:.5,
    flexDirection: "row",
    marginRight:3,
  },
  externalRight: {
    flex:.5,
    flexDirection: "row",
    marginLeft:3,
  },
  buyText: {
    marginTop: 25,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  offerListViewText: {
    marginTop:0,
    flex: 1,
    fontSize: 18,
    lineHeight: 18,
    fontWeight:'bold',
  },
  offerListViewTextDisabled: {
    marginTop:0,
    flex: 1,
    fontSize: 18,
    lineHeight: 18,
    fontWeight:'bold',
    color: '#B2C6CD',
  },
  offerLargeFont: {
    fontSize: 18,
    lineHeight: 18,
    textAlign:'left',    
  },
  orangeOfferListViewText: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight:'bold',
    color: cssVar('actionDark'),
  },
  greenOfferListViewText: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight:'bold',
    color: cssVar('secondaryDark'),
  },
  greyOfferListViewText: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight:'bold',
    color: '#767676',
  },
  greyOfferListViewTextSmall: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight:'bold',
    color: '#767676',
  },  
  orangeMessageListViewText: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight:'bold',
    color: cssVar('actionDark'),
  },
  greenMessageListViewText: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight:'bold',
    color: cssVar('secondaryDark'),
  },
  greyMessageListViewText: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight:'bold',
    color: '#767676',
  },  
});
module.exports = baseStylesIOS;
