'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Map from '../general/Map'

export default class extends Component {

    render() {
        return (
            <View style={styles.container}>
               <Map mode="pickLocation"
                   onPick={this.props.onPick}
                   />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch'
    }
});