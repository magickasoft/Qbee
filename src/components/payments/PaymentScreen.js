'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    WebView,
    TouchableOpacity,
    View
} from 'react-native';

export default class PaymentScreen extends Component {

    onClose(){
        this.props.onClose();
        this.props.navigator.pop();
    }

    render() {
        console.log(this.props.payKey);
        return (
            <View style={styles.webContainer}>
                <View style={styles.webPanel}>
                    <TouchableOpacity style={styles.closeWeb} onPress={this.onClose.bind(this)}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                </View>
                <WebView
                    style={styles.webView}
                    url={`https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=${this.props.payKey}`}>
                </WebView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    webContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    webPanel: {
        height: 50,
        backgroundColor: '#3b5998',
        alignItems: 'flex-end'
    },
    webView: {
        borderWidth: 1,
        flex: 1
    },
    closeWeb: {
        width: 80,
        flex: 1,
        backgroundColor: '#DEDEDE',
        justifyContent: 'center',
        alignItems: 'center'
    }
});