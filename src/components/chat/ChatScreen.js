'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    ScrollView,
    View
} from 'react-native';
var RCTUIManager = require('NativeModules').UIManager;
var moment = require('moment');
import Avatar from '../general/Avatar'
import FB from '../../constants/firebase'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {initChat, addMessage, clearChat} from '../../redux/redusers/messages'

import Message from './Message'
import SystemMessage from './SystemMessage'
import API from '../../API'

class ChatHeader extends Component {

    render() {
        return this.props.onPress ?
            <TouchableOpacity style={this.props.style} onPress={this.props.onPress}>
                {this.props.children}
            </TouchableOpacity> :
            <View style={this.props.style}>
                {this.props.children}
            </View>
    }

}

export default class ChatScreen extends Component {

    constructor(props){
        super(props);
        this.ref = FB.BASE_REF;
        this.state = {
            userName: null,
            messageText: null,
            avatar: null,
            paypal: null,
            paymentData: {
                status: null
            }
        }
    }

    componentDidMount(){
        var userNameUid = this.props.card.user === this.props.authData.uid ? this.props.chatWith : this.props.card.user;
        this.props.getUserByUid(userNameUid).then((user) => {
            this.setState({
                paypal: user.paypal,
                userName: user.firstName + ' ' + user.lastName,
                avatar: user.avatar
            });
        });
        this.ref
            .child('messages')
            .child(this.props.cardKey)
            .child(this.props.chatWith)
            .child('messages')
            .on('child_added', this.addMessage.bind(this));
        if (this.props.authData.uid === this.props.card.user){
            this.ref
                .child('messages')
                .child(this.props.cardKey)
                .child(this.props.chatWith)
                .child('viewedByOwner')
                .set(true);
        }
        if (this.props.authData.uid === this.props.chatWith) {
            this.ref
                .child('messages')
                .child(this.props.cardKey)
                .child(this.props.chatWith)
                .child('messages')
                .once('value', chatSnapshot => {
                    if(chatSnapshot.val()) this.ref
                        .child('messages')
                        .child(this.props.cardKey)
                        .child(this.props.chatWith)
                        .child('viewedByUser')
                        .set(true);
                })
        }
        this.ref
            .child('payments')
            .child(this.props.cardKey);
        this.ref
            .child('payments')
            .child(this.props.cardKey)
            .child(this.props.chatWith)
            .on('value', paymentSnapshot => {
            var paymentData = paymentSnapshot.val();
            if(paymentData) {
                this.setState({paymentData});
                this.checkPaymentStatus.bind(this)();
            } else {
                this.setState({
                    paymentData: {
                        status: null
                    }
                })
            }
        })
    }

    componentWillUnmount(){
        this.ref
            .child('messages')
            .child(this.props.cardKey)
            .child(this.props.chatWith)
            .child('messages')
            .off();
        this.props.clearChat(this.props.cardKey);
    }

    addMessage(snapshot) {
        if (this.props.authData.uid === this.props.card.user){
            this.ref
                .child('messages')
                .child(this.props.cardKey)
                .child(this.props.chatWith)
                .child('viewedByOwner')
                .set(true);
        }
        if (this.props.authData.uid === this.props.chatWith) {
            this.ref
                .child('messages')
                .child(this.props.cardKey)
                .child(this.props.chatWith)
                .child('viewedByUser')
                .set(true);
        }
        if (snapshot.val().sender !== this.props.authData.uid){
            this.ref.child('messages').child(this.props.cardKey).child(this.props.chatWith).child('messages').child(snapshot.key()).child('viewed').set(true);
        }
        this.props.addMessage({
            cardKey: this.props.cardKey,
            message: snapshot.val()
        })
    }

    textChange(text){
        this.setState({messageText: text});
    }

    send(){
        if(!this.state.messageText) return;
        var newMessage = {
            text: this.state.messageText,
            sentAt: moment().format('X'),
            sender: this.props.authData.uid,
            viewed: false
        };
        if (this.props.authData.uid === this.props.chatWith) {
            this.ref.child('messages').child(this.props.cardKey).child(this.props.chatWith).child('viewedByOwner').set(false);
            this.ref.child('users').child(this.props.authData.uid).child('chats').child(this.props.cardKey).set(true);
        }
        if (this.props.authData.uid === this.props.card.user) {
            this.ref.child('messages').child(this.props.cardKey).child(this.props.chatWith).child('viewedByUser').set(false);
        }
        this.ref.child('messages').child(this.props.cardKey).child(this.props.chatWith).child('messages').push(newMessage);
        this.setState({messageText: null});
    }

    checkPaymentStatus(){
        if(this.state.paymentData.payKey){
            API.checkStatus(this.state.paymentData.payKey)
                .then(result => {
                    console.log(result);
                    if(!result.success){
                        console.error(result.error);
                        return null;
                    }
                    this.ref.child('payments')
                        .child(this.props.cardKey)
                        .child(this.props.chatWith)
                        .update({status: result.status});
                })
                .catch(err => {
                    console.error(err);
                    return null;
                })
        }
    }

    confirmDelivery(){
        API.completePayment(this.state.paymentData.payKey)
            .then(result => {
                console.log(result);
                if(!result.success){
                    console.error(result.error);
                    return null;
                }
                this.ref.child('payments')
                    .child(this.props.cardKey)
                    .child(this.props.chatWith)
                    .update({status: result.status});
            })
            .catch(err => {
                console.error(err);
                return null;
            })
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Image source={{uri: this.props.card.cardPhoto}} style={styles.photo}/>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>{this.props.card.description}</Text>
                            <TouchableOpacity onPress={this.props.onHeaderPress} style={styles.flipIconCircle}>
                                <Image
                                    source={require('../../img/iconset_flip.png')}
                                    style={styles.flipIconImage}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.headerRow, {borderBottomWidth: 1}]}>
                        <View style={styles.avatarContainer}>
                            <Avatar
                                image={this.state.avatar}
                                userName={this.state.userName}
                                radius={20}/>
                        </View>
                        <View style={styles.userNameContainer}>
                            <Text style={styles.userName}>{this.state.userName}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={this.props.navigator.pop} style={styles.backIcon}>
                        <Text style={{color: 'white'}}>{'<'}</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    ref='scrollView'
                    contentContainerStyle={styles.scrollViewContent}
                    style={styles.messagesContainer}>
                    {this.state.paymentData.status
                        ?
                        <SystemMessage
                            checkPaymentStatus={this.checkPaymentStatus.bind(this)}
                            confirmDelivery={this.confirmDelivery.bind(this)}
                            payKey={this.state.paymentData.payKey}
                            authData={this.props.authData}
                            buyer={this.props.chatWith}
                            status={this.state.paymentData.status}
                            user={this.props.card.user}
                            card={this.props.cardKey}
                            price={this.props.card.price}
                            navigator={this.props.navigator} />
                        :
                        null}
                    {this.props.chats[this.props.cardKey] ? this.props.chats[this.props.cardKey].messages.map((message, i) => {
                        return <Message
                            key={i}
                            message={message}
                            authData={this.props.authData}/>
                    }) : null}
                </ScrollView>
                <View style={styles.newMessageContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput style={styles.messageInput}
                                   value={this.state.messageText ? this.state.messageText : ''}
                                   onChangeText={this.textChange.bind(this)}
                                   multiline={true}
                                   placeholder="Message..."
                                   numberOfLines={4}/>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={this.send.bind(this)} style={styles.sendButton}><Text style={styles.sendText}>SEND</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 50
    },
    header: {
        alignItems: 'stretch',
        justifyContent: 'center'
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    photo: {
        width: 60,
        height: 60
    },
    descriptionContainer: {
        flex: 1,
        alignItems: 'flex-start',
        borderBottomWidth: 1
    },
    userNameContainer: {
        flex: 1,
        alignItems: 'flex-start',
        height: 60
    },
    userName: {
        fontSize: 20,
        padding: 10
    },
    description: {
        height: 60,
        fontSize: 15,
        padding: 10
    },
    avatarContainer: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center'
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
    messagesContainer: {
        flex: 4,
        paddingTop: 10,
        paddingBottom: 10
    },
    scrollViewContent: {
        alignItems: 'stretch',
        justifyContent: 'flex-start'
    },
    newMessageContainer: {
        height: 80,
        flexDirection: 'row'
    },
    messageInput: {
        alignSelf: 'stretch',
        backgroundColor: '#EEE',
        height: 60,
        padding: 10
    },
    sendButton: {
        backgroundColor: '#29ABE2',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sendText: {
        fontSize: 13
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: '#EEE',
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputContainer: {
        flex: 4,
        backgroundColor: '#EEE',
        alignItems: 'center',
        justifyContent: 'center'
    },
    flipIconCircle: {
        width: 60,
        height: 60,
        position: 'absolute',
        right: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    flipIconImage: {
        width: 32,
        height: 32
    },
    backIcon: {
        position: 'absolute',
        left: -15,
        top: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        borderColor: 'white',
        borderWidth: 2,
        backgroundColor: '#29ABE2',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

let mapDispatchToProps = (dispatch)=>{
    return bindActionCreators({
        initChat,
        addMessage,
        clearChat
    }, dispatch)
};
let mapStateToProps = (state)=>{
    return {
        chats: state.chats
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen)