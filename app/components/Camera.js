/**
 * TRED Camera Component
 * https://www.tred.com
 * Andrew Crowell (andrewcrowell@tred.com)
 * November 30, 2015
 */
'use strict';

var React = require('react-native');
var Button = require('apsl-react-native-button');
var RCTCamera = require('react-native-camera');
var cropTool = require('react-native-crop-tool');
var LoadingOverlay = require('../components/LoadingOverlay.js');
var analytics = require('../services/analytics.service');
var navigationService = require('../services/navigation.service');
var orientationService = require('../services/orientation.service');
var edmunds = require('../services/edmunds.service');
var TrimPicker = require('./TrimPicker');

var {
  View,
  Text,
  Image,
  Platform,
  ScrollView,
  CameraRoll,
  InteractionManager,
} = React;

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var Camera = React.createClass({
  getInitialState() {
    return {
      orientation: 'portrait',
      ready: false,
      capturing: true,
      lastCaptureUri: null,
      fetchingVinInfo: false,
      errorFetchingVin: null,
      vinInfo: null,
      vin: null,
      selectedStyleId: null,
      shooting: false,
    };
  },
  getDefaultProps() {
    return {
      title: null,
      instructions: null,
      confirmation: null,
      overlayImage: null,
      hideOverlayLandscape: false,
      vinInfo: null,
      lastCaptureUri: null,
    }
  },
  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({
        ready: true
      });
    });
    if (this.props.lastCaptureUri || (this.props.vinRead && this.props.vinInfo)) {
      // This picture was already taken, show the review panel
      this.setState({
        capturing: false,
        lastCaptureUri: this.props.lastCaptureUri,
        vinInfo: this.props.vinInfo,
        selectedStyleId: this.props.styleId,
        vin: this.props.vinInfo ? this.props.vinInfo.vin : null,
      });
    }
  },
  componentWillUnmount() {
    orientationService.lockToPortrait();
  },
  capture() {
    var component = this;
    return new Promise(function(resolve, reject) {
      component.refs.cam.capture(function (err, data) {
        if (err) {
          reject(err);
        } else {
          if (component.state.orientation === 'portrait') {
            return cropTool.crop(data, .45, 1)
              .then(() => {
                resolve(data);
              });
          } else {
            resolve(data);
          }
        }
      });
    });
  },
  hasTrimOptions(vinInfo) {
    return vinInfo && vinInfo.years && vinInfo.years.length > 0 && vinInfo.years[0].styles && vinInfo.years[0].styles.length > 1;
  },
  getVinInfo(vin) {
    var component = this;
    return edmunds.vin(vin)
      .then(function (res) {
        res.vin = vin;
        var styleId;
        if (!component.hasTrimOptions(res)) {
          styleId = res.years[0].styles[0].id;
        }
        component.setState({
          capturing: false,
          fetchingVinInfo: false,
          errorFetchingVin: null,
          vinInfo: res,
          selectedStyleId: styleId,
        });
      })
      .catch(function (err) {
        component.setState({
          capturing: false,
          fetchingVinInfo: false,
          errorFetchingVin: err,
          vinInfo: null,
          selectedStyleId: null,
        });
      });
  },
  onBarCodeRead(e) {
    var self = this;
    if (this.props.vinRead && !this.state.fetchingVinInfo) {
      analytics.track('VIN Barcode Scanned');
      self.setState({
        fetchingVinInfo: true,
      });
      return self.capture()
        .then((imageUri) => {
          self.setState({
            lastCaptureUri: imageUri
          });
          var vin = e.data;
          if (e.data.length === 18) {
            // sometimes the barcode includes a leading character not part of the VIN
            vin = e.data.slice(1);
          }
          return self.getVinInfo(vin);
        });
    }
  },
  retake() {
    this.setState({
      capturing: true,
      shooting: false,
      fetchingVinInfo: false,
      errorFetchingVin: null,
    });
  },
  takePicture() {
    this.setState({
      shooting:true,
    });
    return this.capture()
      .then((imageUri) => {
        this.setState({
          capturing: false,
          lastCaptureUri: imageUri,
          shooting:false,
        });
      });
  },
  manualEntry() {
    this.props.navigator.push({
      id: "ManualVinEntry",
      name: "Manual Vin Entry"
    });
  },
  saveToCameraRoll(uriPath) {
    CameraRoll.saveImageWithTag(uriPath);
  },
  onOrientationChanged(data) {
    var self = this;
    if (!self.props.vinRead) {
      if (data.orientation == "portrait") {
        orientationService.lockToPortrait();
      } else if (data.orientation == "landscape_right") {
        orientationService.lockToLandscapeRight();
      } else if (data.orientation == "landscape_left") {
        orientationService.lockToLandscapeLeft();
      }

      if (data.orientation == 'portrait') {
        navigationService.showNavBar();
      } else {
        navigationService.hideNavBar();
      }

      self.setState({
        orientation: data.orientation,
      });
    }
  },
  onConfirm() {
    var component = this;
    component.props.onConfirm({vinInfo: component.state.vinInfo, styleId: component.state.selectedStyleId, imageUri: component.state.lastCaptureUri});
    if (!component.props.vinRead) {
      this.saveToCameraRoll(component.state.lastCaptureUri);
    }
  },
  render() {
    if (this.state.capturing) {
      return this.renderCamera();
    } else {
      return this.renderReview();
    }
  },
  renderCamera() {
    var component = this;
    var vinRead = component.props.vinRead;

    if (this.state.orientation === 'portrait') {
      return (
        <View style={{flex:1}}>
          <View style={styles.main}>
            <ScrollView styles={styles.scroll}>
              <View style={[styles.content, {paddingHorizontal:0}]}>
                <View>
                  <Text style={styles.cameraTitle}>{component.props.title}</Text>
                </View>
                { component.state.ready ?
                  <View style={styles.camera}>
                    {Platform.OS === 'android' ?
                      <RCTCamera style={styles.camera}
                                 ref="cam"
                                 onBarCodeRead={component.onBarCodeRead}
                                 onOrientationChanged={component.onOrientationChanged}
                                 torchMode={vinRead ? true : false}>
                        <Image
                          source={component.props.overlayImage}
                          style={styles.overlayImage}/>
                      </RCTCamera>
                      :
                      <RCTCamera style={styles.camera}
                                 ref="cam"
                                 onBarCodeRead={component.onBarCodeRead}
                                 onOrientationChanged={component.onOrientationChanged}
                                 torchMode={vinRead ? true : false}
                                 type={RCTCamera.constants.Type.back}
                                 captureTarget={RCTCamera.constants.CaptureTarget.disk}
                                 captureAudio={false}>
                        <Image
                          source={component.props.overlayImage}
                          style={styles.overlayImage}/>
                      </RCTCamera>
                    }
                  </View>
                  :
                  null
                }
                <View style={{flex:1}}>
                  { component.state.fetchingVinInfo ?
                    null
                    :
                    <Text style={styles.cameraText}>{component.props.instructions}</Text>
                  }
                </View>
              </View>
            </ScrollView>
            <View style={styles.bottom}>
              <View style={styles.stretch}>
                { component.props.vinRead ?
                  <View style={styles.formField}>
                    <Button onPress={this.manualEntry} style={[styles.secondaryButton, {marginHorizontal:15}]}
                            textStyle={styles.secondaryButtonText}>
                      OR TYPE IT
                    </Button>
                  </View>
                  :
                  <View style={styles.formField}>
                    <Button onPress={component.takePicture} style={[styles.actionButton, {marginHorizontal:15}]}
                            textStyle={styles.actionButtonText} isDisabled={this.state.shooting}>
                      {this.state.shooting ? (Platform.OS === 'android' ? 'HOLD STILL...' : 'SHOOTING...') : 'SHOOT'}
                    </Button>
                  </View>
                }
              </View>
            </View>
          </View>
          <LoadingOverlay isVisible={component.state.fetchingVinInfo} text="Looking up your vehicle..."/>
        </View>
      );
    } else {
      return (
      <View style={{flex:1}}>
        { component.state.ready ?
          <View style={styles.cameraLandscape}>
            {Platform.OS === 'android' ?
              <RCTCamera style={styles.cameraLandscape}
                         ref="cam"
                         onBarCodeRead={component.onBarCodeRead}
                         onOrientationChanged={component.onOrientationChanged}
                         torchMode={vinRead ? true : false}>
                { component.props.hideOverlayLandscape ?
                  <Image
                    source={component.props.overlayImage}
                    style={[styles.overlayImageLandscape, {opacity: 0}]}/>
                  :
                  <Image
                    source={component.props.overlayImage}
                    style={styles.overlayImageLandscape}/>
                }
                <Button onPress={component.takePicture} style={[styles.actionButton, {marginHorizontal:15}]}
                        textStyle={styles.actionButtonText} isDisabled={this.state.shooting}>
                  {this.state.shooting ? (Platform.OS === 'android' ? 'HOLD STILL...' : 'SHOOTING...') : 'SHOOT'}
                </Button>
              </RCTCamera>
              :
              <RCTCamera style={styles.cameraLandscape}
                         ref="cam" onBarCodeRead={component.onBarCodeRead}
                         onOrientationChanged={component.onOrientationChanged}
                         type={RCTCamera.constants.Type.back}
                         captureTarget={RCTCamera.constants.CaptureTarget.disk}
                         torchMode={vinRead ? true : false}>
                { component.props.hideOverlayLandscape ?
                  <Image
                    source={component.props.overlayImage}
                    style={[styles.overlayImageLandscape, {opacity: 0}]}/>
                  :
                  <Image
                    source={component.props.overlayImage}
                    style={styles.overlayImageLandscape}/>
                }
                <Button onPress={component.takePicture} style={[styles.actionButton, {marginHorizontal:15}]}
                        textStyle={styles.actionButtonText} isDisabled={this.state.shooting}>
                  {this.state.shooting ? (Platform.OS === 'android' ? 'HOLD STILL...' : 'SHOOTING...') : 'SHOOT'}
                </Button>
              </RCTCamera>
            }
          </View>
          :
          null
        }
      </View>
      );
    }
  },
  renderReview() {
    var component = this;
    var vinInfo = component.state.vinInfo;
    var vinRead = component.props.vinRead;
    orientationService.lockToPortrait();
    navigationService.showNavBar();
    return (
      <View style={styles.main}>
        <ScrollView styles={styles.scroll}>
          <View style={[styles.content, {paddingHorizontal:0}]}>
            <View>
              <Text style={styles.cameraTitle}>{component.props.title}</Text>
            </View>
            { vinRead ?
              <View>
                { vinInfo ?
                  <View>
                    { component.hasTrimOptions(vinInfo) ?
                      <Text style={[styles.cameraText, {marginTop:5}]}>Nice ride! Select your trim below to continue.</Text>
                    :
                      <Text style={[styles.cameraText, {marginTop:5}]}>Nice ride! Is this your vehicle?</Text>
                    }
                    <View style={[styles.table]}>
                      <View style={[styles.tableRow, styles.tableTop, {paddingVertical:8}]}>
                        <View style={styles.tableCol30}>
                          <Text style={[styles.tableText, styles.tableHead]}>VEHICLE</Text>
                        </View>
                        <View style={styles.tableCol70}>
                          <Text style={[styles.tableText]}>{(vinInfo.years && vinInfo.years.length > 0 ? vinInfo.years[0].year + ' ' : '') + (vinInfo.make ? vinInfo.make.name + ' ' : '') + (vinInfo.model ? vinInfo.model.name : '')}</Text>
                        </View>
                      </View>
                      <View style={[styles.tableRow, {paddingVertical:8}]}>
                        <View style={styles.tableCol30}>
                          <Text style={[styles.tableText, styles.tableHead]}>TRIM</Text>
                        </View>
                        <TrimPicker vinInfo={vinInfo} selectedStyleId={component.state.selectedStyleId} onSelect={(styleId) => { component.setState({ selectedStyleId: styleId }); }} />
                      </View>
                      <View style={[styles.tableRow, styles.tableBottom, {paddingVertical:8}]}>
                        <View style={styles.tableCol30}>
                          <Text style={[styles.tableText, styles.tableHead]}>VIN</Text>
                        </View>
                        <View style={styles.tableCol70}>
                          <Text style={[styles.tableText]}>{(vinInfo && vinInfo.vin ? vinInfo.vin  : '')}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                :
                  <View>
                    <Text style={styles.cameraText}>Sorry! We couldn&apos;t find any information about your vehicle using the VIN provided. Please contact us for assistance.</Text>
                  </View>
                }
              </View>
            :
              <View>
                <Image style={styles.capturedImage} source={{uri: this.state.lastCaptureUri}}/>
                <Text style={styles.cameraText}>{this.props.confirmation}</Text>
              </View>
            }
          </View>
        </ScrollView>
        <View style={styles.bottom}>
          <View style={styles.stretch}>
            <View style={styles.formFieldHorizontal}>
              <Button onPress={this.retake} style={[styles.secondaryButton, styles.left, {flex:1, marginLeft:15}]} textStyle={styles.actionButtonText}>
                { vinRead ? (vinInfo ? 'CHANGE' : 'RETRY') : 'RESHOOT' }
              </Button>
              <Button style={[styles.actionButton, styles.right, {flex:1, marginRight:15}]} textStyle={styles.actionButtonText} isDisabled={(vinRead && (!vinInfo || !this.state.selectedStyleId)) || (!vinRead && !this.state.lastCaptureUri)} onPress={component.onConfirm}>
                { vinRead ? 'CONFIRM' : 'ACCEPT' }
              </Button>
            </View>
          </View>
        </View>
      </View>
    )
  }
});

module.exports = Camera;