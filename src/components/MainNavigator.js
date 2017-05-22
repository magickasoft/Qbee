'use strict';
var React = require('react-native');
var {
    Component,
    Navigator,
    BackAndroid
    } = React;
import MainScreen from './main/MainScreen';
import CardForm from './sell/CardForm';
import CardView from './card/CardViewScreen';
import Navbar from './general/Navbar';
import MapLocationPicker from './sell/MapLocationPicker'
import ChatScreen from './chat/ChatScreen'
import ChatList from './chat/ChatList'
import CardChatsList from './card/ChatList'
import SettingsScreen from './settings/SettingsScreen'
import MyItemsScreen from './settings/MyItemsScreen'
import PaymentsTest from './payments/PaymentTestScreen'
import PaymentScreen from './payments/PaymentScreen'

import FB from '../constants/firebase'
import { addCard, initCards, deleteCard } from '../redux/redusers/cards'
import { addCountry, deleteCountry} from '../redux/redusers/countries'
import { setViewMode } from '../redux/redusers/mainScreenViewMode'
import { setExposedCountryPoint } from '../redux/redusers/mainScreenExposedCountryPoint'
import { initAuth } from '../redux/redusers/auth.js'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
var RNGeocoder = require('react-native-geocoder');

const SCREEN_WIDTH = require('Dimensions').get('window').width;

/**
 * Overwrite the default navigator scene config.
 * to use a wider area for back swiping.
 */
export class MainNavigator extends Component{

    constructor(props){
        super(props);
        this.ref = FB.BASE_REF;
    }

    componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            this.refs.navigator.pop();
            return true;
        });
    }

    getUserByUid(uid){
        return new Promise((resolve, reject) =>{
           this.ref.child('users').child(uid).once('value', (snapshot) => {
               var user = snapshot.val();
               user.uid = snapshot.key();
               resolve(user);
           })
        });
    }

    deleteCard(card){
        if(!this.props.deleteCard) return alert('No action to delete card in MaiNavigator.js');
        return new Promise((resolve, reject) => {
            var removeCardObject = new Promise((resolve, reject) => {
                this.ref
                    .child('cards')
                    .child(card.key)
                    .remove()
                    .then(resolve)
                    .catch(err => reject(err));
            });
            var removeCardFromUser = new Promise((resolve, reject) => {
                this.ref
                    .child('users')
                    .child(card.user)
                    .child('cards')
                    .child(card.key)
                    .remove()
                    .then(resolve)
                    .catch(err => reject(err));
            });
            var removeMessagesReference = new Promise((resolve, reject) => {
                this.ref
                    .child('messages')
                    .child(card.key)
                    .remove()
                    .then(resolve)
                    .catch(err => reject(err));
            });
            var removePayments = new Promise((resolve, reject) => {
                this.ref
                    .child('payments')
                    .child(card.key)
                    .remove()
                    .then(resolve)
                    .catch(err => reject(err));
            });
            var decreaseCountryCounter = new Promise((resolve, reject) => {
                this.ref
                    .child('countries')
                    .child(card.country)
                    .transaction(itemsAmount => {
                        if(itemsAmount == 1) return null;
                        return itemsAmount - 1;
                    })
                    .then(resolve)
                    .catch(err => reject(err));
            });
            var promises = [removeCardFromUser, removeCardObject, removeMessagesReference, removePayments, decreaseCountryCounter];
            Promise.all(promises)
                .then(() => {
                    this.props.deleteCard(card.key);
                    resolve();
                })
                .catch((err) => {
                    console.warn('Can not complete all delete operations.', err);
                    reject(err);
                });
        })
    }

    getCardByUid(uid){
        return new Promise((resolve, reject) =>{
            this.ref.child('cards').child(uid).once('value', (snapshot) => {
                var card = snapshot.val();
                card.key = snapshot.key();
                resolve(card);
            })
        });
    }

    getLocalityByCords(coordsObj){
        return new Promise((resolve, reject) => {
            RNGeocoder.reverseGeocodeLocation(coordsObj).then((data) => {
                var locality = data[0].locality;
                var country = data[0].country;
                var name = data[0].name;
                var geoName;
                if (!country) {
                    geoName = name;
                } else {
                    if(!locality){
                        geoName = country + ', ' + name
                    } else {
                        geoName = country + ', ' + locality;
                    }
                }
                resolve(geoName);
            }).catch((err) => reject(err));
        })
    }

    renderScene (route, navigator){
        switch (route.name){
            case 'main': {
                return <MainScreen
                    {...this.props}
                    navigator={navigator} />;
            }
            case 'sell': case 'request': {
                return <CardForm
                    {...this.props}
                    card={route.editCard}
                    cardKey={route.key}
                    type={route.name}
                    navigator={navigator} />;
            }
            case 'map-location-picker': {
                return <MapLocationPicker
                    onPick={route.onPick}
                    navigator={navigator} />;
            }
            case 'card-view': {
                // return <React.View></React.View>;
                return <CardView
                    flipped={route.flipped}
                    authData={this.props.authData}
                    card={route.card}
                    cardKey={route.key}
                    getUserByUid={this.getUserByUid.bind(this)}
                    getLocalityByCords={this.getLocalityByCords.bind(this)}
                    navigator={navigator} />;
            }
            case 'chat': {
                return <ChatScreen
                    onHeaderPress={route.onHeaderPress}
                    authData={this.props.authData}
                    card={route.card}
                    cardKey={route.key}
                    chatWith={route.chatWith}
                    getUserByUid={this.getUserByUid.bind(this)}
                    navigator={navigator} />;
            }
            case 'chats-list': {
                return <ChatList
                    getUserByUid={this.getUserByUid.bind(this)}
                    getCardByUid={this.getCardByUid.bind(this)}
                    getLocalityByCords={this.getLocalityByCords.bind(this)}
                    navigator={navigator} />;
            }
            case 'card-chats-list': {
                return <CardChatsList
                    card={route.card}
                    cardKey={route.cardKey}
                    authData={this.props.authData}
                    getUserByUid={this.getUserByUid.bind(this)}
                    getCardByUid={this.getCardByUid.bind(this)}
                    navigator={navigator} />;
            }
            case 'settings': {
                return <SettingsScreen
                    logout={this.props.logOut}
                    card={route.card}
                    updateProfile={this.props.initAuth}
                    authData={this.props.authData}
                    navigator={navigator}
                    />;
            }
            case 'my-items':
                let myCards = {};
                for(let key in this.props.cards){
                    if(this.props.cards[key].user == this.props.authData.uid){
                        myCards[key] = this.props.cards[key];
                    }
                }

                return <MyItemsScreen
                    authData={this.props.authData}
                    getCardByUid={this.getCardByUid.bind(this)}
                    navigator={navigator}
                    cards={myCards}
                />;
            case 'payments-test':
                return <PaymentsTest/>;
            case 'payment':
                return <PaymentScreen
                        navigator={navigator}
                        onClose={route.onClose}
                        payKey={route.payKey}
                        />;
            default:
                return <MainScreen
                    {...this.props}
                    navigator={navigator} />;
        }
    }

    render() {
        return (
            <Navigator
                navigationBar={<Navbar
                                {...this.props}
                                deleteCard={this.deleteCard.bind(this)}
                                navigator={navigator}/>}
                initialRoute={{name: 'main'}}
                renderScene={this.renderScene.bind(this)}
                ref="navigator">
            </Navigator>
        );
    }
}

let mapDispatchToProps = (dispatch)=>{
    return bindActionCreators({
        initAuth,
        initCards,
        addCard,
        deleteCard,
        addCountry,
        setViewMode,
        setExposedCountryPoint,
        deleteCountry
    }, dispatch)
};
let mapStateToProps = (state)=>{
    return {
        authData: state.auth,
        cards: state.cards,
        countries: state.countries,
        viewMode: state.viewMode,
        exposedCountryPoint: state.exposedCountryPoint
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(MainNavigator)
