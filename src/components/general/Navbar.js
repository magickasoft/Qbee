'use strict';
import React, {
    Component,
    StyleSheet,
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
var moment = require('moment');
import FB from '../../constants/firebase'
var LinearGradient = require('react-native-linear-gradient');

export default class extends Component {

    constructor(props) {
        super(props);
        this.ref = FB.BASE_REF;
        this.state = {
            reviewedChats: {}
        }
    }
    componentDidMount(){
        //this.ref.child('users')
        //    .child(this.props.authData.uid)
        //    .child('cards')
        //    .once('value', (snapshot) => {
        //        snapshot.forEach((card) => {
        //            this.subscribeToMyCards(card.key())
        //        })
        //});
        //this.ref
        //    .child('users')
        //    .child(this.props.authData.uid)
        //    .child('chats')
        //    .once('value', (snapshot) => {
        //        snapshot.forEach((card) => {
        //            this.subscribeToCardChat(card.key())
        //        })
        //});
        var myCards = this.props.authData.cards;
        var myChats = this.props.authData.chats;
        if(myCards) Object.keys(myCards).forEach(cardKey => this.checkExpirationDate(cardKey));
        if(myCards) Object.keys(myCards).forEach(cardKey => this.subscribeToMyCards(cardKey));
        if(myChats) Object.keys(myChats).forEach(cardKey => this.subscribeToCardChat(cardKey));
    }

    checkExpirationDate(cardKey){
        this.ref
            .child('cards')
            .child(cardKey)
            .child('paymentDueDate')
            .once('value', (dateSnapshot => {
                var expirationDate = dateSnapshot.val();
                expirationDate = moment(expirationDate, 'X');
                var now = moment();
                if(expirationDate.isBefore(now)){
                    this.ref
                        .child('cards')
                        .child(cardKey)
                        .child('country')
                        .once('value', cardSnapshot => {
                            var card = {key: cardKey, user: this.props.authData.uid, country: cardSnapshot.val()};
                            console.log('Card expired', card);
                            this.props.deleteCard(card);
                        })
                } else {
                    console.log('Card is actual', cardKey)
                }
            }))
    }

    subscribeToMyCards(cardKey){
        this.ref
            .child('messages')
            .child(cardKey)
            .on('value', (snapshot) => {
                if(snapshot.val()) {
                    snapshot.forEach((data) => {
                        var chat = data.val();
                        var reviewedChats = this.state.reviewedChats;
                        reviewedChats[data.key()] = chat.viewedByOwner;
                        this.setState(reviewedChats);
                    })
                }
        })
    }

    subscribeToCardChat(cardKey){
        this.ref
            .child('messages')
            .child(cardKey)
            .child(this.props.authData.uid)
            .on('value', (chatSnapshot) => {
                var chat = chatSnapshot.val();
                if(!chat){
                    return this.ref
                        .child('users')
                        .child(this.props.authData.uid)
                        .child('chats')
                        .child(cardKey)
                        .remove()
                }
                var reviewedChats = this.state.reviewedChats;
                reviewedChats[cardKey] = chat.viewedByUser;
                this.setState(reviewedChats);
            });
    }

    goToMain(){
        this.props.navigator.resetTo({name: 'main'});
    }

    goToSettings(){
        this.props.navigator.resetTo({name: 'settings'});
    }

    getUnreviwedMessagesCount(){
        var count = 0;
        for (var cardKey in this.state.reviewedChats){
            if (!this.state.reviewedChats[cardKey] && typeof this.state.reviewedChats[cardKey] != 'undefined') count +=1
        }
        return count;
    }

    render() {
        return (
            <LinearGradient
                start={[1, 0.15]} end={[1, 0.7]}
                colors={['#CCC', '#FFF']}
                style={styles.container}>
                <View style={styles.navItem}>
                    <TouchableOpacity onPress={this.goToMain.bind(this)} style={styles.navButton}>
                        <Image
                            style={styles.dots}
                            source={require('../../img/iconset_dots.png')}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.navItem}>
                    <TouchableOpacity onPress={() => this.props.navigator.resetTo({name: 'chats-list'})} style={styles.navButton}>
                        <Image
                            style={styles.messages}
                            source={require('../../img/iconset_messages.png')}>
                            <Text style={styles.text}>{this.getUnreviwedMessagesCount.bind(this)()}</Text>
                        </Image>
                    </TouchableOpacity>
                </View>
                <View style={styles.navItem}>
                    <TouchableOpacity onPress={this.goToSettings.bind(this)} style={styles.navButton}>
                        <Image
                            style={styles.burger}
                            source={require('../../img/iconset_burger.png')}/>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 50
    },
    navItem: {
        flex: 1
    },
    navButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dots: {
        width: 40,
        height: 40
    },
    messages: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    burger: {
        width: 40,
        height: 40
    },
    text: {
        fontSize: 18,
        backgroundColor: 'rgba(0,0,0,0)'
    }
});