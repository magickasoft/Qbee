'use strict';
import React, {
    Component,
    Text,
    TouchableOpacity,
    PropTypes,
    NativeModules,
    View
} from 'react-native';
var DateAndroid = NativeModules.DateAndroid;
var moment = require('moment');

export default class DatePicker extends Component {

    showDatePicker() {
        let callback = this.props.onDatePick;
        DateAndroid.showDatepicker(function() {}, function (y, m, d) {
            m = +m + 1;
            var date = moment(y + '-' + m + '-' + d + ' 00:00', 'YYYY-M-D HH:mm');
            callback(date.format('X'));
        });
    }

    render() {
        return (
            <TouchableOpacity style={this.props.pickerStyle} onPress={this.showDatePicker.bind(this)}>
                <Text style={this.props.textStyle}>{this.props.children}</Text>
            </TouchableOpacity>
        );
    }
}

DatePicker.propTypes = {
    onDatePick: PropTypes.func.isRequired,
    pickerStyle: PropTypes.number.isRequired,
    textStyle: PropTypes.number.isRequired
};