'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
    View
} from 'react-native';
import paypal from '../../constants/paypalBackend'
import FB from '../../constants/firebase'

export default class extends Component {

    constructor(){
        super();
        this.ref = FB.BASE_REF
    }

    cancelPurchase(){
        this.ref
            .child('payments')
            .child(this.props.card)
            .child(this.props.buyer)
            .set(null)
    }

    renderPurchaseProposal(){
        return (
            <View style={[styles.container, styles.system]}>
                <Text style={styles.text}>Confirm your purchase.</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={this.cancelPurchase.bind(this)}
                        style={[styles.button, styles.cancelButton, {marginRight: 2}]}>
                        <Text style={{fontSize: 15}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.props.navigator.push({
                                name: 'payment',
                                payKey: this.props.payKey,
                                onClose: this.props.checkPaymentStatus
                            })}
                        style={[styles.button, styles.buyButton, {marginLeft: 2}]}>
                        <Text style={{fontSize: 15, color: '#ffffff'}}>BUY</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderNoPaypal(){
        return(
            <View style={[styles.container, styles.system]}>
                <Text style={styles.text} numberOfLines={3}>Enter your PayPal email address in profile settings</Text>
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton, {marginRight: 2}]}>
                        <Text style={{fontSize: 15}}>GO TO PROFILE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderWaitingSeller(){
        return (
            <View style={[styles.container, styles.system]}>
                <Text style={styles.text} numberOfLines={3}>Waiting seller to enter PayPal email</Text>
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton, {marginRight: 2}]}>
                        <Text style={{fontSize: 15}}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderPurchaseNotification(){
        return(
            <View style={[styles.container, styles.system]}>
                <Text style={styles.text} numberOfLines={5}>
                    User has requested purchase.
                    Awaiting payment and delivery conformation.
                    As soon as user confirms the delivery you will get funds on PayPal account.
                </Text>
            </View>
        )
    }


    renderCompleteNotification(){
        return(
            <View style={[styles.container, styles.system]}>
                <Text style={styles.text} numberOfLines={5}>
                    Product successfully delivered. Purchase completed.
                </Text>
            </View>
        )
    }

    renderShipmentConfirmation(){
        return (
            <View style={[styles.container, styles.system]}>
                <Text style={styles.text} numberOfLines={5}>Please confirm delivery of goods as soon as you receive it</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={this.props.confirmDelivery}
                        style={[styles.button, styles.cancelButton, {marginRight: 2}]}>
                        <Text style={{fontSize: 15}}>CONFIRM DELIVERY</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderSellerMessage(){
        switch(this.props.status){
            case paypal.CREATED: return this.renderPurchaseNotification();
            case paypal.INCOMPLETE: return this.renderPurchaseNotification();
            case paypal.COMPLETED: return this.renderCompleteNotification();
            case paypal.NO_ACCOUNT: return this.renderNoPaypal();
            default: return null;
        }
    }

    renderBuyerMessage(){
        switch(this.props.status){
            case paypal.CREATED: return this.renderPurchaseProposal();
            case paypal.INCOMPLETE: return this.renderShipmentConfirmation();
            case paypal.COMPLETED: return this.renderCompleteNotification();
            case paypal.NO_ACCOUNT: return this.renderWaitingSeller();
            default: return null;
        }
    }

    render() {
        if(this.props.authData.uid === this.props.user) return this.renderSellerMessage.bind(this)();
        return this.renderBuyerMessage.bind(this)();
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        marginBottom: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    system: {
        backgroundColor: '#FEC107'
    },
    messageText: {
        fontSize: 15,
        margin: 10
    },
    text: {
        fontSize: 15,
        marginBottom: 10
    },
    row: {
        marginBottom: 10,
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'stretch'
    },
    button: {
        flex: 1,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch'
    },
    cancelButton: {
        borderWidth: 1
    },
    buyButton: {
        backgroundColor: '#2AABE4'
    },
});