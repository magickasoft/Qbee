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
var moment = require('moment');
import FB from '../../constants/firebase'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {initChat, addMessage, clearChat} from '../../redux/redusers/messages'

// import Message from './../chat/Message'

class ChatRow extends Component {

    getCardTypeIcon(){
        var style;
        var text;
        switch (this.props.cardType){
            case 'sell':
                style = styles.sellIcon;
                text = 'S';
                break;
            case 'want':
                style = styles.wantIcon;
                text = 'W';
                break;
            case 'buy':
                style = styles.buyIcon;
                text = 'B';
                break;
            case 'none':
                return null;
                break;
        }
        return <View style={style}><Text style={styles.iconTypeText}>{text}</Text></View>
    }

    handlePress(){
        if(this.props.authData.uid === this.props.card.user){
            this.props.navigator.push({
                name: 'card-view',
                card: this.props.card,
                key: this.props.cardKey,
                flipped: true
            })
        } else {
            this.props.navigator.push(
                {
                    name: 'chat',
                    card: this.props.card,
                    key: this.props.cardKey,
                    chatWith: this.props.chatWith.uid,
                }
            )
        }
    }

    render() {
        return(
            <View style={styles.messageRow}>
                <TouchableOpacity onPress={this.handlePress.bind(this)} style={styles.row} >
                    <View style={styles.cardPhotoContainer}>
                        <Image
                            source={{uri: this.props.image}}
                            style={styles.cardImage}>
                        </Image>
                    </View>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.description}>{this.props.description}</Text>
                        {this.props.newMessagesCount ? <View style={styles.messagesCount}><Text style={styles.newMsgCount}>{this.props.newMessagesCount}</Text></View> : null}
                    </View>
                    {this.getCardTypeIcon.bind(this)()}
                </TouchableOpacity>
            </View>
        )
    }
}

class ChatList extends Component {

    constructor(props) {
        super(props);
        this.ref = FB.BASE_REF;
        this.state = {
            chats: []
        }
    }

    userValueHandler(cards) {
        cards.forEach((card) => {
            this.subscribeToChats(card.key());
        })
    }

    componentDidMount(){
        this.ref.child('users').child(this.props.authData.uid).child('cards').on('value', this.userValueHandler.bind(this));
        this.ref.child('users').child(this.props.authData.uid).child('chats').on('value', this.userValueHandler.bind(this));
    }

    componentWillUnmount(){
        //this.ref.child('users').child(this.props.authData.uid).child('cards').off('value', this.userValueHandler, this);
        //this.ref.child('users').child(this.props.authData.uid).child('chats').off('value', this.userValueHandler, this);
    }

    subscribeToChats(cardKey){
        this.ref.child('messages').child(cardKey).on('value', (snapshot) => {
            this.fetchCardRow.bind(this)(snapshot, cardKey);
        });
    }

    countNewMessages(cardKey, userKey){
        var count = 0;
        return new Promise((resolve, reject) => {
            this.ref.child('messages').child(cardKey).child(userKey).child('messages').orderByChild("viewed").equalTo(false).once('value', (msgObj) => {
                var messages = msgObj.val();
                for(var msgKey in messages){
                    if(messages[msgKey].sender !== this.props.authData.uid) {
                        count += 1;
                    }
                }
                resolve(count)
            })
        });
    }

    fetchCardRow(snapshot, cardKey) {
        if(!snapshot) return;
        snapshot.forEach((chatObj) => {
            var chats = this.state.chats;
            this.props.getUserByUid(chatObj.key()).then((chatWith) => {
                this.props.getCardByUid(cardKey).then((card) => {
                    var cardType;
                    if(card.type === 'sell' && card.user !== this.props.authData.uid) cardType = 'buy';
                    if(card.type === 'sell' && card.user === this.props.authData.uid) cardType = 'none';
                    if(card.type === 'request' && card.user === this.props.authData.uid) cardType = 'want';
                    if(card.type === 'request' && card.user !== this.props.authData.uid) cardType = 'sell';
                    if(this.props.authData.uid !== card.user){
                        this.countNewMessages.bind(this)(cardKey, this.props.authData.uid).then((newMessagesCount) => {
                            var chatPosition = null;
                            chats.map((oldChat, i) => {
                                if(oldChat.cardKey === cardKey){
                                    chatPosition = i;
                                }
                            });
                            var chatObj = {
                                description: card.description,
                                image: card.cardPhoto,
                                chatWith,
                                card,
                                cardKey,
                                cardType,
                                newMessagesCount
                            };
                            if(chatPosition !== null) {
                                chats[chatPosition] = chatObj;
                            } else {
                                chats.push(chatObj);
                            }
                            this.setState({chats: chats});
                        }).catch((err) => console.log(err))
                    } else {
                        this.ref.child('messages').child(cardKey).on('value', (snapshot) => {
                            var count = 0;
                            snapshot.forEach((user) => {
                                this.countNewMessages.bind(this)(cardKey, user.key()).then(
                                    (newMessagesCount) => {
                                        var chatPosition = null;
                                        chats.map((oldChat, i) => {
                                            if(oldChat.cardKey === cardKey){
                                                chatPosition = i;
                                            }
                                        });
                                        count += newMessagesCount;
                                        var chatObj = {
                                            description: card.description,
                                            image: card.cardPhoto,
                                            chatWith,
                                            card,
                                            cardKey,
                                            cardType,
                                            newMessagesCount: count
                                        };
                                        if(chatPosition !== null) {
                                            chats[chatPosition] = chatObj;
                                        } else {
                                            chats.push(chatObj);
                                        }
                                        this.setState({chats: chats});
                                    }
                                )
                            })
                        })
                    }
                });
            })
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView
                    ref='scrollView'
                    contentContainerStyle={styles.scrollViewContent}
                    style={styles.messagesContainer}>
                    {this.state.chats.map((chat, i) =>{
                        return <ChatRow
                            authData={this.props.authData}
                            key={i}
                            navigator={this.props.navigator}
                            {...chat}
                            />
                    })}
                    {!this.state.chats.length ? <Text style={styles.noContentText}>There are no active chats yet.</Text> : null}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        padding: 10,
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
    messageRow: {
        flex: 1,
        alignItems: 'flex-start',
        marginBottom: 10
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
        backgroundColor: 'rgba(0, 0, 0, 0)',
        height: 60,
        fontSize: 15,
        padding: 10
    },
    cardPhotoContainer: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    cardImage: {
        width: 60,
        height: 60
    },
    messagesContainer: {
        flex: 1
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
    descriptionContainer: {
        flex: 1,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#CCC'
    },
    row: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        paddingLeft: 11,
    },
    noContentText: {
        fontSize: 20
    },
    sellIcon: {
        width: 22,
        height: 22,
        backgroundColor: '#FF9800',
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 11,
        left: 0, top: 19,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
    buyIcon: {
        width: 22,
        height: 22,
        backgroundColor: '#8CC63F',
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 11,
        left: 0, top: 19,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
    wantIcon: {
        width: 22,
        height: 22,
        backgroundColor: '#2196F3',
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 11,
        left: 0, top: 19,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
    iconTypeText: {
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        fontWeight: 'bold'
    },
    newMessageIcon: {
        backgroundColor: '#29ABE2',
        width: 20,
        height: 20,
        borderRadius: 10,
        //position: 'absolute',
        //left: 0
    },
    messagesCount: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#29ABE2',
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        top: 15,
        position: 'absolute'
    },
    newMsgCount: {
        fontSize: 20,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        color: 'white',
        fontWeight: 'bold'
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
        authData: state.auth,
        chats: state.chats
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatList)