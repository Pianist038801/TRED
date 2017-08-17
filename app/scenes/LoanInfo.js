/**
 * TRED Loan Information Screen Component
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
var utils = require('../services/utils');

var styles = Platform.OS === 'android' ?
  require('../styles/baseStylesAndroid') : require('../styles/baseStylesIOS');

var LoanInfo = React.createClass({
  getInitialState: function(){
    return {
      registered_owner: null,
      has_loan: null,
      loan_amount: null,
      bank_name: null,
      loan_account_number: null,
      loan_ssn: null,
      disabled:false,
      enableInputAccessory: false,
    };
  },
  componentDidMount: function(){
    analytics.visited('LoanInfo');
    var component = this;
    LocalStorage.wip.listing.get().then(function(listing){
      component.setState({
        registered_owner: typeof listing.registered_owner !== 'undefined' && listing.registered_owner !== null ? listing.registered_owner : true,
        has_loan: typeof listing.has_loan !== 'undefined' && listing.has_loan !== null ? listing.has_loan : false,
        loan_amount: utils.formatMoney(listing.loan_amount) !== 'N/A' ? utils.formatMoney(listing.loan_amount) : "",
        bank_name: listing.bank_name,
        loan_account_number: listing.loan_account_number,
        loan_ssn: listing.loan_ssn,
      });
    });
  },
  onHasLoan: function(value){
    this.setState({
      has_loan: value === "Yes" ? true : false
    });
    if(this.refs['loan_amount']){
      this.refs['loan_amount'].focus();
    }
  },
  onChangeLoanAmount: function(value){
    value = value.toString();
    value = value.replace(/[^0-9]/g, '');
    var num = value.replace(/,/gi, '');
    var num2 = num.replace(/\d(?=(?:\d{3})+$)/g, '$&,');
    this.setState({
      loan_amount: '$' + num2
    });
  },
  hasErrors: function(){
    var error = null;
    if(this.state.has_loan){
      if(!utils.moneyToInt(this.state.loan_amount)) {
        error = {msg:"You're missing your loan amount.", field:"loan_amount"};
      } else if (!this.state.bank_name) {
        error = {msg:"You're missing your bank name.", field:"bank_name"};
      }
    }
    return error;
  },
  onConfirm: function(){
    var component = this;    
    this.setState({disabled: true});
    var error = this.hasErrors();
    if(!error){
      LocalStorage.wip.listing.update({ 
        registered_owner: this.state.registered_owner,
        has_loan: this.state.has_loan,
        loan_amount: utils.moneyToInt(this.state.loan_amount),
        bank_name: this.state.bank_name,
        loan_account_number: this.state.loan_account_number,
        loan_ssn: this.state.loan_ssn,
      }).then(function(){
        component.setState({disabled: false});
        component.props.navigator.push({
          id: 'Price',
          name: 'Price',
        });    
      });
    } else {
      component.setState({disabled: false});
      Alert.alert("Uh Oh...", error.msg, [
        {text: "Fix", onPress: () => {
            setTimeout(() =>{
              component.refs[error.field].focus()
            }, 250);
          }
        }
      ]);      
    }
  },
  render: function() {
    var component = this;
    return (
      <View style={styles.main}>
        <KeyboardHandler ref='kh' offset={110}>
          <View style={[styles.content, {paddingHorizontal:0}]}>
            <Text style={styles.cameraTitle}>LOAN INFORMATION</Text>
            <Text style={styles.subText}>We&apos;d like to help you repay your loan.</Text>

            {Platform.OS === 'android' ?
              <View style={styles.segment}>
                <View style={styles.segmentLabel}>
                  <Text style={styles.segmentText}>
                   Are you the registered owner?
                  </Text>
                </View>
                <View style={styles.segmentControl}>
                  <Button style={[styles.segmentAndroid, this.state.registered_owner ? null : styles.segmentActive ]}
                    children="No"
                    onPress={() => {component.setState({registered_owner:false});}}
                    textStyle={[styles.segmentAndroidText, this.state.registered_owner ? null : styles.segmentActiveText]} />
                  <Button style={[styles.segmentAndroid, this.state.registered_owner ? styles.segmentActive: null]}
                    children="Yes"
                    onPress={() => {component.setState({registered_owner:true});}}
                    textStyle={[styles.segmentAndroidText, this.state.registered_owner ? styles.segmentActiveText: null]} />
                </View>
              </View>
            :
              <View style={styles.segment}>
                <View style={styles.segmentLabel}>
                  <Text style={styles.segmentText}>
                   Are you the registered owner?
                  </Text>
                </View>
                <View style={styles.segmentControl}>
                  <SegmentedControlIOS 
                    tintColor='#ffffff'
                    values={['No', 'Yes']}
                    selectedIndex={this.state.registered_owner ? 1 : 0}
                    onValueChange={(value) => this.setState({registered_owner: value === "Yes" ? true : false})} />
                </View>
              </View>
            }

            { Platform.OS === 'android' ?
              <View style={styles.segment}>
                <View style={styles.segmentLabel}>
                  <Text style={styles.segmentText}>
                   Is there a loan on the vehicle?
                  </Text>
                </View>
                <View style={styles.segmentControl}>
                  <Button style={[styles.segmentAndroid, this.state.has_loan ? null : styles.segmentActive ]}
                    children="No"
                    onPress={() => {component.setState({has_loan:false});}}
                    textStyle={[styles.segmentAndroidText, this.state.has_loan ? null : styles.segmentActiveText]} />
                  <Button style={[styles.segmentAndroid, this.state.has_loan ? styles.segmentActive: null]}
                    children="Yes"
                    onPress={() => {component.setState({has_loan:true});}}
                    textStyle={[styles.segmentAndroidText, this.state.has_loan ? styles.segmentActiveText: null]} />
                </View>
              </View>
            :
              <View style={styles.segment}>
                <View style={styles.segmentLabel}>
                  <Text style={styles.segmentText}>
                   Is there a loan on the vehicle?
                  </Text>
                </View>
                <View style={styles.segmentControl}>
                  <SegmentedControlIOS 
                    tintColor='#ffffff'
                    values={['No', 'Yes']}
                    selectedIndex={this.state.has_loan ? 1 : 0}
                    onValueChange={this.onHasLoan} />
                </View>
              </View>
            }

            {this.state.has_loan ?
              <View>
                <View style={styles.formField}>
                  <Text style={[styles.label]}>Estimate how much is owed on the loan?</Text>
                  <TextInput
                    ref="loan_amount"
                    keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                    style={[styles.textInput]}
                    selectTextOnFocus={true}
                    onChangeText={this.onChangeLoanAmount}
                    value={this.state.loan_amount}
                    onFocus={()=>{
                      this.setState({
                        enableInputAccessory: true,
                      });
                      this.refs['kh'].inputFocused(this,'loan_amount');
                    }}
                    onBlur={()=>{
                      this.setState({
                        enableInputAccessory: false,
                      });
                    }} />
                </View>
                <View style={styles.formField}>
                  <Text style={[styles.label]}>What is the name of the bank carrying your loan?</Text>
                  <TextInput
                    ref="bank_name"
                    returnKeyType='done'
                    enablesReturnKeyAutomatically={true}
                    selectTextOnFocus={true}
                    style={[styles.textInput]}
                    onChangeText={(bank_name) => this.setState({bank_name})}
                    value={this.state.bank_name} 
                    onSubmitEditing={() => {this.refs.loan_account_number.focus();}}
                    onFocus={()=>this.refs['kh'].inputFocused(this,'bank_name')} />
                </View>
                <View style={styles.formField}>
                  <Text style={[styles.label]}>What is the account number of your loan/lease?</Text>
                  <TextInput
                    ref="loan_account_number"
                    returnKeyType='done'
                    enablesReturnKeyAutomatically={true}
                    selectTextOnFocus={true}
                    style={[styles.textInput]}
                    onChangeText={(loan_account_number) => this.setState({loan_account_number})}
                    value={this.state.loan_account_number} 
                    onSubmitEditing={() => {this.refs.loan_ssn.focus();}}
                    onFocus={()=>this.refs['kh'].inputFocused(this,'loan_account_number')} />
                </View>
                <View style={styles.formField}>
                  <Text style={[styles.label]}>Enter the last four digits of your SSN.</Text>
                  <TextInput
                    ref="loan_ssn"
                    returnKeyType='done'
                    enablesReturnKeyAutomatically={true}
                    selectTextOnFocus={true}
                    style={[styles.textInput]}
                    onChangeText={(loan_ssn) => this.setState({loan_ssn})}
                    value={this.state.loan_ssn} 
                    onSubmitEditing={() => {this.refs.loan_ssn.blur();}}
                    maxLength={4}
                    onFocus={()=>this.refs['kh'].inputFocused(this,'loan_ssn')} />
                </View>                
              </View>
            :
              null
            }
            <View ref="extra" style={{height:30}}></View>
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
        <InputAccessory buttonText='Next' onPress={() => {this.refs.bank_name.focus();}} enabled={Platform.OS === 'android' ? false : this.state.enableInputAccessory}/>
      </View>
    );
  },
});

module.exports = LoanInfo;
