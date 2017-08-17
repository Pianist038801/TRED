/**
 * TRED Bottom Picker Component
 * https://www.tred.com
 * Andrew Crowell (andrewcrowell@tred.com)
 * November 30, 2015
 */
'use strict';

var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    PickerIOS,
    Dimensions,
    Platform
} = React;
var SCREEN_WIDTH = Dimensions.get('window').width;
var cssVar = require('../styles/cssVar');

if(Platform.OS !== 'android'){
  var Modal = require('react-native').Modal;
  var PickerItemIOS = PickerIOS.Item;
}

var BottomPicker = React.createClass({
    show: function(){
        this.setState({modalVisible: true});
    },
    getInitialState: function(){
        return {
            options: this.props.options,
            color: this.props.color || '#007AFF',
            modalVisible: false,
            selectedIndex: 0,
            selectedOption: this.props.options[0]
        };
    },
    getLabel(option) {
        if (this.props.labels && typeof this.props.labels === 'string') {
            return option[this.props.labels];
        } else if (this.props.labels && typeof this.props.labels === 'function') {
            return this.props.labels(option);
        } else {
            return option;
        }
    },
    render: function() {
        return (<View>
            {Platform.OS === 'android' ?
                null
            :
                <Modal
                    animated={true}
                    transparent={true}
                    visible={this.state.modalVisible}>
                    <View style={styles.basicContainer}>
                        <View style={styles.modalContainer}>
                            <View style={styles.buttonView}>
                                <TouchableOpacity onPress={() => {
                                        this.setState({modalVisible: false});
                                    }}>
                                    <Text style={{color:this.state.color, fontSize:18}}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                        if(this.props.onSubmit) this.props.onSubmit(this.state.selectedOption);
                                        this.setState({modalVisible: false});
                                    }}>
                                    <Text style={{color:this.state.color, fontSize:18}}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.mainBox}>
                                {/*Modal body*/}
                                <PickerIOS
                                    ref={'picker'}
                                    style={styles.bottomPicker}
                                    selectedValue={this.state.selectedIndex}
                                    onValueChange={(i) => {
                                      this.setState({selectedOption: this.props.options[i], selectedIndex: i});
                                    }}
                                    >
                                    {this.state.options.map((option, i) => {
                                        var label = this.getLabel(option);
                                        return (
                                            <PickerItemIOS
                                                key={i}
                                                value={i}
                                                label={label} />
                                        )
                                    })}
                                </PickerIOS>
                            </View>
                        </View>
                    </View>
                </Modal>
            }
            </View>
        );
    }
});

var styles = StyleSheet.create({
    basicContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer:{
        position:'absolute',
        bottom:0,
        right:0,
        left:0,
        width:SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        padding:0,
        backgroundColor: cssVar('superLightGrey'),
    },
    buttonView:{
        width:SCREEN_WIDTH,
        padding: 8,
        borderTopWidth:0.5,
        borderTopColor:'#eeeeee',
        justifyContent: 'space-between',
        flexDirection:'row',
        backgroundColor: cssVar('lightGrey'),
    },
    bottomPicker : {
        width:SCREEN_WIDTH,
//        fontSize:13
    },
    mainBox: {
    }
});

module.exports = BottomPicker;
