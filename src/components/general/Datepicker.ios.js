'use strict';
import React, {
    Component,
    Text,
    TouchableOpacity,
    PropTypes,
    NativeModules,
    DatePickerIOS,
    StyleSheet,
    View
} from 'react-native';
var moment = require('moment');

export default class DatePicker extends Component {

    constructor(props){
        super(props);
        this.state = {
            collapsed: false,
            date: new Date()
        }
    }

    onDateChange(date) {
        let callback = this.props.onDatePick;
        var d = moment(date);
        d.hours(0);
        d.minutes(0);
        d.seconds(0);
        d.milliseconds(0);
        this.setState({date: d.toDate()});
        callback(d.format('X'));
    }

    renderCollapsed(){
        return (
            <View style={styles.container} >
                <TouchableOpacity onPress={() => this.setState({collapsed: false})}>
                    <Text style={this.props.textStyle}>{this.props.children}</Text>
                </TouchableOpacity>
                <DatePickerIOS
                    date={this.state.date}
                    mode="date"
                    onDateChange={this.onDateChange.bind(this)}
                    />
            </View>
        );
    }

    renderFolded(){
        return (
            <TouchableOpacity onPress={() => this.setState({collapsed: true})}>
                {this.props.toggleButton}
            </TouchableOpacity>
        )
    }

    render() {
        return this.state.collapsed ? this.renderCollapsed.bind(this)() : this.renderFolded.bind(this)();
    }
}

DatePicker.propTypes = {
    onDatePick: PropTypes.func.isRequired,
    pickerStyle: PropTypes.number.isRequired,
    textStyle: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
    }
});