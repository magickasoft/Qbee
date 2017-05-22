'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Platform,
    View
} from 'react-native';
import FB from '../../constants/firebase'
import ASConstants from '../../constants/asyncStorage'
import Map from './../general/Map';
import Card from './Card'
import Preloader from '../general/PreloaderScreen'
import API from '../../API'
var RNGeocoder = require('react-native-geocoder');
import GeoCoder from "../../helpers/GeoCoder"
import Helper from "../../helpers"

export default class MainScreen extends Component {

    constructor(props){
        super(props);
        this.ref = FB.BASE_REF;
        this.state = {
            loading: false
        }
    }

    componentDidMount() {
        this.ref
            .child('countries')
            .on('value', (snapshot) => {
                var countriesObj = snapshot.val();
                if(!countriesObj) return null;
                Object.keys(countriesObj).map((key, i) => {
                    return new Promise((resolve, reject) => {
                        let coordinates = countriesObj[key]['coordinates'];
                        let latitude = coordinates['latitude'];
                        let longitude = coordinates['longitude'];
                        var country = {
                            latitude: latitude,
                            longitude: longitude
                        };
                        API.getCoordinateCountry(latitude, longitude)
                            .then(result => {
                                country.name = result;
                                country.key = latitude + '_' + longitude;
                                country.itemsAmount = countriesObj[key]['count'];
                                this.props.addCountry(country);
                                resolve(country);
                            });
                    });
                });
            }, (error) => {
                console.warn('country value error');
                alert(error);
            });
        this.ref
            .child('countries')
            .on('child_removed', (snapshot) => {
                this.props.deleteCountry(snapshot.key());
            });
        this.checkChatsCards();
    }

    checkChatsCards(){
        var userChats = this.props.authData.chats;
        if(!userChats) return;
        for(var cardKey in userChats){
            this.ref
                .child('cards')
                .child(cardKey)
                .once('value', (card) => {
                    if(!card.val()){
                        this.ref
                            .child('users')
                            .child(this.props.authData.uid)
                            .child('chats')
                            .child(cardKey)
                            .remove();
                    }
                })
        }
    }

    changeCountry(){
        this.props.initCards({});
        this.props.setViewMode('countries');
    }

    updateCard(snapshot, prevKey){
        var card = {};
        card[snapshot.key()] = snapshot.val();
        this.props.addCard(card);
    }

    getPreloader(){
        if(!this.state.loading) return null;
        return(
            <View style={{marginTop: 50}}>
                <Preloader />
            </View>
        )
    }

    onCountryCalloutPress(coordinate, point) {
        const { map } = this.refs;
        point.latitudeDelta = 100;
        point.longitudeDelta = 20;
        map.changeRegion(point);
    }

    onRegionChangeComplete(region) {
        this.setState({loading: true});
        GeoCoder(region, data => {
            if (data) {
                let country = data.currentGeo.split(',')[0];
                this.ref
                    .child('cards')
                    .orderByChild('country')
                    .equalTo(country)
                    .once('value', cardsSnapshot => {
                        let cards = cardsSnapshot.val() || {};
                        this.props.initCards(cards);
                        this.props.setViewMode('cards');
                        this.props.setExposedCountryPoint(data.countryCoordinates);
                        this.setState({loading: false});
                    }).catch(err => {console.log(err);});
            } else {
                this.setState({loading: false});
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.map}>
                    <Map
                        ref="map"
                        noZoom
                        changeCountry={this.changeCountry.bind(this)}
                        onCountryCalloutPress={this.onCountryCalloutPress.bind(this)}
                        cards={this.props.cards}
                        countries={this.props.countries}
                        mode={this.props.viewMode}
                        exposedCountryPoint={this.props.exposedCountryPoint}
                        region={this.state.region}
                        onRegionChangeComplete={this.onRegionChangeComplete.bind(this)}
                    />
                </View>
                <ScrollView style={styles.scrollView}>
                    {this.getPreloader.bind(this)()}
                    <View style={styles.cardsList}>
                        {Object.keys(this.props.cards).map((item, i) => {
                            return (
                                <Card key={item} cardKey={item} navigator={this.props.navigator} card={this.props.cards[item]}/>
                            );
                        })}
                    </View>
                </ScrollView>
                <TouchableOpacity onPress={() => this.props.navigator.push({name: 'sell'})} style={styles.sellButton}>
                    <Text style={styles.sellText}>Sell</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.navigator.push({name: 'request'})} style={styles.iWantButton}>
                    <Text style={styles.iWantText}>I want</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

var platformOffset = Platform.OS === 'ios' ? 0 : 10;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        marginBottom: 50
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#F5FCFF'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    map: {
        position: 'relative',
        flex: 1,
        height: Dimensions.get('window').height / 2
    },
    bottom: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFCCCC',
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    product: {
        flex: 1,
        margin: 5,
        backgroundColor: "red"
    },
    row: {
        height: 150,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'stretch'
    },
    sellButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        height: 70,
        width: 70,
        left: Dimensions.get('window').width / 2 - 35,
        top: Dimensions.get('window').height / 2 - 35 - 25 - platformOffset,
        backgroundColor: "#FF9800",
        borderRadius: 35,
        borderWidth: 5,
        borderColor: "#FFFFFF"
    },
    iWantButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        height: 60,
        width: 60,
        left: Dimensions.get('window').width / 2 - 30 + 62,
        top: Dimensions.get('window').height / 2 - 30 - 25 - platformOffset,
        backgroundColor: "#2196F3",
        borderRadius: 35,
        borderWidth: 5,
        borderColor: "#FFFFFF"
    },
    sellText: {
        color: '#FFFFFf',
        fontWeight: 'bold',
        fontSize: 20
    },
    iWantText: {
        color: '#FFFFFf',
        fontWeight: 'bold',
        fontSize: 15
    },
    cardsList: {
        flexDirection: 'row',
        flex: 1,
        flexWrap: 'wrap'
    }
});