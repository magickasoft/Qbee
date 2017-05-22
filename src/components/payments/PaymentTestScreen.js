'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    WebView,
    View
} from 'react-native';

import paypal from '../../constants/paypalBackend'

export default class extends Component {

    constructor(){
        super();
        this.state = {
            page: 'prepare',
            payKey: null
        }
    }

    setUpPayment(){
        fetch(`${paypal.host}/setup-payment`, {method: 'post'})
            .then(result => {
                result = JSON.parse(result._bodyText);
                if (!result.success) return alert(result.error);
                this.setState({
                    payKey: result.payKey
                })
            }
        )
        .catch(err => {
                alert(`Sorry, payment service is temporary offline. Please, try again later.`)
            });
    }

    completePayment(){
        var body = JSON.stringify({
            payKey: this.state.payKey
        });
        fetch(`${paypal.host}/complete-payment`, {
            method: 'post',
            headers: {
                "Content-type": "application/json"
            },
            body
        })
            .then(result => {
                result = JSON.parse(result._bodyText);
                console.log(result);
                if (!result.success) return alert(result.error);
                if(result.status = "COMPLETED") return alert('Payment successfully completed.')
            }
        );
    }

    checkPaymentStatus(){
        var body = JSON.stringify({
            payKey: this.state.payKey
        });
        fetch(`${paypal.host}/check-status`, {
            method: 'post',
            headers: {
                "Content-type": "application/json"
            },
            body
        })
            .then(result => {
                result = JSON.parse(result._bodyText);
                if (!result.success) return alert(result.error);
                console.log(`Payment status: ${result.status}`);
                switch (result.status){
                    case 'CREATED': {
                        alert('Payment just created and ready to be paid. Once it paid funds will be sent to facilitator and awaiting other side confirmation');
                        break;
                    }
                    case 'INCOMPLETE': {
                        alert('Payment send to facilitator and awaiting confirmation');
                        break;
                    }
                    default :{
                        alert(`Payment status is ${result.status}`)
                    }
                }
            }
        );
    }

    renderCompletePaymentButton(){
        if(!this.state.payKey) return null;
        return (
            <View style={styles.row}>
                <TouchableOpacity style={styles.setupPayment} onPress={this.completePayment.bind(this)}>
                    <Text style={styles.text}>Complete payment</Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderCheckPaymentStatusButton(){
        if(!this.state.payKey) return null;
        return (
            <View style={styles.row}>
                <TouchableOpacity style={styles.setupPayment} onPress={this.checkPaymentStatus.bind(this)}>
                    <Text style={styles.text}>Check payment status</Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderPayButton(){
        if(!this.state.payKey) return null;
        return (
            <View style={styles.row}>
                <TouchableOpacity style={styles.setupPayment} onPress={() => this.setState({page: 'webview'})}>
                    <Text style={styles.text}>Go to payment</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render(){
        switch (this.state.page) {
            case 'prepare':
            {
                return (
                    <View style={styles.container}>
                        <View style={styles.row}>
                            <TouchableOpacity style={styles.setupPayment} onPress={this.setUpPayment.bind(this)}>
                                <Text style={styles.text}>Set up payment</Text>
                            </TouchableOpacity>
                        </View>
                        {this.renderPayButton.bind(this)()}
                        {this.renderCheckPaymentStatusButton.bind(this)()}
                        {this.renderCompletePaymentButton.bind(this)()}
                    </View>
                );
            }
            case 'webview':
            {
                return (
                    <View style={styles.webContainer}>
                        <View style={styles.webPanel}>
                            <TouchableOpacity style={styles.closeWeb} onPress={() => this.setState({page: 'prepare'})}>
                                <Text>Close</Text>
                            </TouchableOpacity>
                        </View>
                        <WebView
                            style={styles.webView}
                            url={`https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=${this.state.payKey}`}>
                        </WebView>
                    </View>
                )

            }
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    row: {
        alignSelf: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'center'
    },
    webContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    setupPayment: {
        margin: 10,
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 20
    },
    webView: {
        borderWidth: 1,
        flex: 1
    },
    webPanel: {
        height: 50,
        backgroundColor: '#3b5998',
        alignItems: 'flex-end'
    },
    closeWeb: {
        width: 80,
        flex: 1,
        backgroundColor: '#DEDEDE',
        justifyContent: 'center',
        alignItems: 'center'
    }
});