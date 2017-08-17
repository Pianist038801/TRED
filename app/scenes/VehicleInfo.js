/**
 * TRED Vehicle Information Screen Component
 * https://www.tred.com
 * Sean Jackson (seanjackson@tred.com)
 * Novemeber, 2015
 */
'use strict';

var React = require('react-native');
var {
  View,
  Text,
  Platform,
  TextInput,
  SegmentedControlIOS,
  Alert,
} = React;

var Button = require('apsl-react-native-button');
var KeyboardHandler = require('../components/KeyboardHandler.js');
var LocalStorage = require('../services/localStorage.service.js');
var InputAccessory = require('../components/InputAccessory.js');
var analytics = require('../services/analytics.service');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var VehicleInfo = React.createClass({
  getInitialState: function(){
    return {
      has_dog: null,
      has_smoked: null,
      modifications: null,
      disabled: false,
      enableInputAccessory: false,
    };
  },
  componentDidMount: function(){
    var component = this;
    analytics.visited('VehicleInfo');
    LocalStorage.wip.listing.get().then(function(listing){
      component.setState({
        has_dog: typeof listing.has_dog !== 'undefined' && listing.has_dog !== null ? listing.has_dog : false,
        has_smoked: typeof listing.has_smoked !== 'undefined' && listing.has_smoked !== null ? listing.has_smoked : false,
        modifications: listing.modifications
      });
    });
  },
  onConfirm: function(){
    var component = this;
    this.setState({disabled: true});
    return LocalStorage.wip.listing.update({
      has_dog: this.state.has_dog,
      has_smoked: this.state.has_smoked,
      modifications: this.state.modifications 
    }).then(function(){
      component.setState({disabled: false});
      component.props.navigator.push({
        id: 'VehicleLocation',
        name: 'Vehicle Location',
      });    
    });
  },
  render: function() {
    var component = this;
    return (
      <View style={styles.main}>
        <KeyboardHandler ref='kh' offset={110}>
          <View style={[styles.content, {paddingHorizontal:0}]}>
            <Text style={styles.cameraTitle}>VEHICLE INFO</Text>
            <Text style={styles.subText}>We&apos;d like to get to know your car.</Text>
            
            {Platform.OS === 'android' ?
              <View>
                <View style={styles.segment}>
                  <View style={styles.segmentLabel}>
                    <Text style={styles.segmentText}>
                      Has a dog regularly been in it?
                    </Text>
                  </View>
                  <View style={styles.segmentControl}>
                    <Button style={[styles.segmentAndroid, this.state.has_dog ? null : styles.segmentActive ]}
                      children="No"
                      onPress={() => {component.setState({has_dog:false});}}
                      textStyle={[styles.segmentAndroidText, this.state.has_dog ? null : styles.segmentActiveText]} />
                    <Button style={[styles.segmentAndroid, this.state.has_dog ? styles.segmentActive: null]}
                      children="Yes"
                      onPress={() => {component.setState({has_dog:true});}}
                      textStyle={[styles.segmentAndroidText, this.state.has_dog ? styles.segmentActiveText: null]} />
                  </View>
                </View>
                
                <View style={styles.segment}>
                  <View style={styles.segmentLabel}>
                    <Text style={styles.segmentText}>
                     Has it been smoked in?
                    </Text>
                  </View>
                  <View style={styles.segmentControl}>
                    <Button style={[styles.segmentAndroid, this.state.has_smoked ? null : styles.segmentActive ]}
                      children="No"
                      onPress={() => {component.setState({has_smoked:false});}}
                      textStyle={[styles.segmentAndroidText, this.state.has_smoked ? null : styles.segmentActiveText]} />
                    <Button style={[styles.segmentAndroid, this.state.has_smoked ? styles.segmentActive: null]}
                      children="Yes"
                      onPress={() => {component.setState({has_smoked:true});}}
                      textStyle={[styles.segmentAndroidText, this.state.has_smoked ? styles.segmentActiveText: null]} />
                  </View>
                </View>
              </View>
            :
              <View>
                <View style={styles.segment}>
                  <View style={styles.segmentLabel}>
                    <Text style={styles.segmentText}>
                      Has a dog regularly been in it?
                    </Text>
                  </View>
                  <View style={styles.segmentControl}>
                    <SegmentedControlIOS 
                      tintColor='#ffffff'
                      values={['No', 'Yes']}
                      onValueChange={(value) => this.setState({has_dog: value === "Yes" ? true : false})}
                      selectedIndex={this.state.has_dog ? 1 : 0} />
                  </View>
                </View>
                
                <View style={styles.segment}>
                  <View style={styles.segmentLabel}>
                    <Text style={styles.segmentText}>
                     Has it been smoked in?
                    </Text>
                  </View>
                  <View style={styles.segmentControl}>
                    <SegmentedControlIOS 
                      tintColor='#ffffff'
                      values={['No', 'Yes']}
                      onValueChange={(value) => this.setState({has_smoked: value === "Yes" ? true : false})}
                      selectedIndex={this.state.has_smoked ? 1 : 0} />
                  </View>
                </View>
              </View>
            }

            <View style={styles.formField}>
              <Text style={[styles.label]}>Describe any modifications to your vehicle.</Text>
              <TextInput
                ref="modifications"
                placeholder="(Optional) Ex: Bilstein shocks, Asanti Grill"
                placeholderTextColor="#aaaaaa"
                textAlign="left"
                multiline={true}
                selectTextOnFocus={true}
                numberOfLines={3}
                blurOnSubmit={true}
                style={[styles.textInput, styles.larger]}
                onChangeText={(modifications) => this.setState({modifications})}
                value={this.state.modifications}
                onFocus={()=>this.refs['kh'].inputFocused(this,'modifications')} />
            </View>
          </View>
        </KeyboardHandler>
        <View style={styles.bottom}>
          <View style={styles.stretch}>
            <View style={styles.formField}>
              <Button onPress={this.onConfirm} style={[styles.actionButton, {marginHorizontal:15}]} textStyle={styles.actionButtonText} isDisabled={this.state.disabled}>
                CONTINUE
              </Button>
            </View>
          </View>
        </View>
        <InputAccessory buttonText='Next' onPress={()=>{this.refs.modifications.focus()}} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory}/>
      </View>
    );
  },
});

module.exports = VehicleInfo;
