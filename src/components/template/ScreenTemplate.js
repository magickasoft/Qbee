'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default class extends Component {

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {this.props.navigator.pop()}}>
                    <Text>Screen template</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});