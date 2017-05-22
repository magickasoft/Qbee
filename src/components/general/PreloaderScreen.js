'use strict';
import React, {
    View,
    Component
} from 'react-native';

var GiftedSpinner = require('react-native-gifted-spinner');

export default class extends Component {

    render() {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <GiftedSpinner  size={'large'} style={{height: this.props.preloaderHeight}}  />
            </View>
        );
    }
}