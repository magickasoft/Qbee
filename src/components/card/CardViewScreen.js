'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    Easing,
    ScrollView,
    View
} from 'react-native';
import ChatList from './ChatList'
import Chat from '../chat/ChatScreen'
import Avatar from '../general/Avatar'
import FB from '../../constants/firebase'
import API from '../../API'
import paypal from '../../constants/paypalBackend'
import FlipView from 'react-native-flip-view'
// var FlipView = require('react-native-flip-view').default;
var moment = require('moment');

export default class extends Component {

    constructor(props){
        super(props);
        var flipped = this.props.flipped;
        this.ref = FB.BASE_REF;
        this.state = {
            avatar: null,
            userName: null,
            paypal: null,
            locality: null,
            flipped,
            backSideOpacity: flipped ? 1 : 0
        }
    }

    componentDidMount(){
        if(this.props.card.user === this.props.authData.uid) {
            this.setState({
                userName: this.props.authData.firstName + this.props.authData.lastName,
                avatar: this.props.authData.avatar
            })
        } else {
            this.props.getUserByUid(this.props.card.user).then(user => {
                this.setState({
                    userName: user.firstName + ' ' + user.lastName,
                    avatar: user.avatar,
                    paypal: user.paypal
                });
            });
        }
        this.props.getLocalityByCords(this.props.card.cardCoordinates).then((locality) => {
            this.setState({locality: locality});
        });
    }

    backView(){
        if(this.props.card.user === this.props.authData.uid) return (
            <View style={{backgroundColor: 'white', flex: 1, opacity: this.state.backSideOpacity}}>
                <ChatList
                flip={this.flip.bind(this)}
                getUserByUid={this.props.getUserByUid}
                card={this.props.card}
                navigator={this.props.navigator}
                authData={this.props.authData}
                cardKey={this.props.cardKey} />
            </View>
                );
        return(
            <View style={{backgroundColor: 'white', flex: 1, opacity: this.state.backSideOpacity}}>
                <Chat
                    onHeaderPress={this.flip.bind(this)}
                    authData={this.props.authData}
                    card={this.props.card}
                    cardKey={this.props.cardKey}
                    chatWith={this.props.authData.uid}
                    onHeadPress={this.flip.bind(this)}
                    getUserByUid={this.props.getUserByUid}
                    navigator={this.props.navigator}/>
            </View>
        )
    }

    flip(){
        this.setState({flipped: !this.state.flipped})
    }

    initPurchase(){
        if(!this.state.paypal){
            return this.ref
                    .child('payments')
                    .child(this.props.cardKey)
                    .child(this.props.authData.uid)
                    .set({
                        payKey: null,
                        status: paypal.NO_ACCOUNT
                    })
        }
        this.ref
            .child('payments')
            .child(this.props.cardKey)
            .child(this.props.authData.uid)
            .once('value', paymentSnapshot => {
                var payment = paymentSnapshot.val();
                if(payment && payment.status !== paypal.NO_ACCOUNT) return this.flip.bind(this)();
                API.setUpPayment(this.state.paypal, this.props.card.price)
                    .then(result => {
                        if(!result.success) return console.error(result.error);
                        var payKey = result.payKey;
                        this.ref
                            .child('payments')
                            .child(this.props.cardKey)
                            .child(this.props.authData.uid)
                            .set({
                                payKey,
                                status: paypal.CREATED
                            })
                            .then(this.flip.bind(this));
                    })
                    .catch(err => {
                        console.error(err);
                    })
            });
    }

    getCardButton() {
        var cardStyle;
        var buttonText;
        var onPress = () => {};
        if (this.props.card.type === 'request'){
            cardStyle = styles.requestButton;
            buttonText = 'Sell';
        } else {
            cardStyle = styles.buyButton;
            buttonText = 'Buy';
            onPress = this.initPurchase.bind(this)
        }
        if(this.props.card.user === this.props.authData.uid){
            cardStyle = styles.editButton;
            buttonText = 'Edit';
            onPress = () => {
                this.props.navigator.push({name: this.props.card.type, editCard: this.props.card, key: this.props.cardKey})
            };
        }
        return(
            <TouchableOpacity onPress={onPress} style={[styles.cardButton, cardStyle]}>
                <Text style={styles.sellText}>{buttonText}</Text>
            </TouchableOpacity>
        )
    }

    frontView(){
        return (
            <View style={styles.container}>
                    <Image style={styles.cardView} source={{uri: this.props.card.cardPhoto}}>
                        <TouchableOpacity onPress={this.flip.bind(this)} style={styles.flipIconCircle}>
                            <Image
                                style={styles.flipIconImage}
                                source={require('../../img/iconset_flip.png')}></Image>
                        </TouchableOpacity>
                    </Image>
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
                        style={styles.cardInfo}>
                        <View style={styles.cardInfoContainer}>
                            <Text style={styles.price}>{this.props.card.price}$</Text>
                            <View style={styles.row}>
                                <Text style={styles.itemsCount}>{this.props.card.itemsCount} left. </Text>
                                <Text style={styles.paymentDueDate}>Expires {moment(this.props.card.paymentDueDate, 'X').fromNow()}</Text>
                            </View>
                            <View style={styles.flexRow}>
                                <View style={styles.avatarCol}>
                                    <TouchableOpacity onPress={this.flip.bind(this)}>
                                        {this.props.authData.uid !== this.props.card.user ?
                                            <Image source={require('../../img/iconset_asktoseller.png')}
                                                   style={styles.askToSeller}
                                                /> : null}
                                        <Avatar
                                            bardered
                                            userName={this.state.userName}
                                            image={this.state.avatar}
                                            radius={20}/>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.description}>
                                        Description: {this.props.card.description}
                                    </Text>
                                    <Text style={styles.seller}>
                                        {this.props.card.type === 'request' ? 'Request by' : 'By'} {this.state.userName}
                                    </Text>
                                    <Text style={styles.locality}>
                                        from {this.state.locality}
                                    </Text>
                                    <Text style={styles.shippingDate}>
                                        Ships {moment(this.props.card.shippingDate, 'X').format('MM-DD-YYYY')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    {this.getCardButton.bind(this)()}
            </View>
        );
    }

    render() {
        console.log(this.props);
        return (
            <FlipView style={{flex: 1}}
                      front={this.frontView.bind(this)()}
                      back={this.backView.bind(this)()}
                      isFlipped={this.state.flipped}
                      onFlip={() => this.setState({backSideOpacity: this.state.flipped ? 1 : 0})}
                      flipAxis="y"
                      flipEasing={Easing.out(Easing.ease)}
                      flipDuration={500}
                      perspective={1000}/>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    cardView: {
        backgroundColor: 'grey',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 2
    },
    cardImage: {
        flex: 1
    },
    cardInfo: {
        flex: 1,
        paddingTop: 50
    },
    cardInfoContainer: {
        alignSelf: 'stretch',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    avatarCol: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginRight: 10
    },
    cardContent: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch'
    },
    avatarIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEE'
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    flexRow: {
        margin: 20,
        alignSelf: 'stretch',
        flex: 1,
        flexDirection: 'row'
    },
    scrollViewContent: {
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10
    },
    sellText: {
        color: '#FFFFFf',
        fontWeight: 'bold',
        fontSize: 20
    },
    cardButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        height: 70,
        width: 70,
        left: Dimensions.get('window').width / 2 - 35,
        top: Dimensions.get('window').height / 2 - 35,
        borderRadius: 35,
        borderWidth: 5,
        borderColor: "#FFFFFF"
    },
    requestButton: {
        backgroundColor: "#FF9800"
    },
    editButton: {
        backgroundColor: "#FF9800"
    },
    buyButton: {
        backgroundColor: "#8CC63F"
    },
    price: {
        fontSize: 25
    },
    itemsCount: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    paymentDueDate: {
        fontSize: 20
    },
    description: {
        fontSize: 15
    },
    seller: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    locality: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    shippingDate: {
        fontSize: 15
    },
    backView: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        backgroundColor: 'green'
    },
    askToSeller: {
        width: 40,
        height: 40
    },
    flipIconCircle: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        top: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        left: Dimensions.get('window').width / 2 - 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    flipIconImage: {
        width: 32,
        height: 32
    }
});