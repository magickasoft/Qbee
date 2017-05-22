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
import Avatar from '../general/Avatar'
import FB from '../../constants/firebase'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {initChat, addMessage, clearChat} from '../../redux/redusers/messages'

class ChatRow extends Component {

    render() {
        var newMessages = false;
        if (this.props.authData.uid === this.props.card.user){
            newMessages = !this.props.viewedByOwner;
        }
        if (this.props.authData.uid === this.props.chatWith.uid){
            newMessages = !this.props.viewedByUser;
        }
        return(
            <View style={styles.messageRow}>
                <TouchableOpacity onPress={() => {this.props.navigator.push({
                    name: 'chat',
                    card: this.props.card,
                    key: this.props.cardKey,
                    chatWith: this.props.chatWith.uid,
                    onHeaderPress: this.props.navigator.pop
                })}} style={styles.row} >
                    <View style={styles.avatarContainer}>
                        {newMessages ? <View style={styles.newMessageIcon}/> : null}
                        <Avatar
                            userName={this.props.chatWith.firstName}
                            image={this.props.chatWith.avatar}
                            radius={20}/>
                    </View>
                    <View>
                        <Text style={styles.description}>{this.props.message.text}</Text>
                    </View>
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

    componentDidMount(){
        this.ref
            .child('messages')
            .child(this.props.cardKey)
            .on('value', this.pushChatRow.bind(this));
    }

    componentWillUnmount(){
        this.ref
            .child('messages')
            .child(this.props.cardKey)
            .off('value', this.pushChatRow, this)
    }

    pushChatRow(snapshot) {
        if(!snapshot) return;

        snapshot.forEach((data) => {
            this.ref
                .child('messages')
                .child(this.props.cardKey)
                .child(data.key())
                .once('value', (chatSnapshot) => {
                    var chat = chatSnapshot.val();
                    this.ref.child('messages').child(this.props.cardKey).child(data.key()).child('messages').limitToLast(1).once('value', (msgSnapshot) => {
                        var message = msgSnapshot.val();
                        if (!message) return;
                        message = message[Object.keys(message)[0]];
                        this.props.getUserByUid(message.sender).then((messageSender) => {
                            var chats = this.state.chats;
                            this.props.getUserByUid(data.key()).then((chatWith) => {
                                var chatPosition = null;
                                chats.map((oldChat, i) => {
                                    if(oldChat.chatWith.uid === chatWith.uid){
                                        chatPosition = i;
                                    }
                                });
                                var chatObj = {
                                    message: message,
                                    user: messageSender,
                                    chatWith: chatWith,
                                    viewedByOwner: chat.viewedByOwner,
                                    viewedByUser: chat.viewedByUser
                                };
                                if(chatPosition !== null) {
                                    chats[chatPosition] = chatObj;
                                } else {
                                    chats.push(chatObj);
                                }
                                this.setState({chats: chats});
                            })
                        })
                    });
                });
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <View onPress={() => { this.props.flip ? this.props.flip() : null}} style={styles.header}>
                    <View style={styles.headerRow}>
                        <View onPress={this.props.flip}>
                            <Image source={{uri: this.props.card.cardPhoto}} style={styles.photo}/>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>{this.props.card.description}</Text>
                        </View>
                        <TouchableOpacity onPress={this.props.flip} style={styles.flipIconCircle}>
                            <Image
                                source={require('../../img/iconset_flip.png')}
                                style={styles.flipIconImage}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView
                    ref='scrollView'
                    contentContainerStyle={styles.scrollViewContent}
                    style={styles.messagesContainer}>
                    {this.state.chats.map((chat, i) =>{
                        return <ChatRow
                            authData={this.props.authData}
                            key={i}
                            card={this.props.card}
                            cardKey={this.props.cardKey}
                            message={chat.message}
                            navigator={this.props.navigator}
                            user={chat.user}
                            chatWith={chat.chatWith}
                            viewedByOwner={chat.viewedByOwner}
                            viewedByUser={chat.viewedByUser}
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
        justifyContent: 'center',
        flexDirection: 'row'
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
        flex: 4
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
    row: {
        flexDirection: 'row'
    },
    noContentText: {
        fontSize: 20
    },
    newMessageIcon: {
        backgroundColor: '#29ABE2',
        width: 20,
        height: 20,
        borderRadius: 10
    },
    descriptionContainer: {
        flex: 1,
    },
    flipIconCircle: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center'
    },
    flipIconImage: {
        width: 32,
        height: 32
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

export default connect(mapStateToProps, mapDispatchToProps)(ChatList)