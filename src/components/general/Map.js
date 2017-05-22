'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
    View
} from 'react-native';
import MapView from 'react-native-maps';
var Marker = MapView.Marker;
var Callout = MapView.Callout;
var countries = require('../../data/countries.json');

class PickLocationButton extends Component {

    render() {
        return(
            <View style={styles.pickButton}>
                <TouchableOpacity onPress={this.props.onPress} style={styles.pickerTO}>
                    <Text style={styles.pickButtonText}>
                        Pick location
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

}

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            initialRegion: {
                latitude: 39.9272222,
                longitude: 32.8644444,
                latitudeDelta: 4,
                longitudeDelta: 4
            },
            region: null,
            pickerCoordinates: {
                latitude: 1,
                longitude: 1,
                latitudeDelta: 100,
                longitudeDelta: 100
            }
        }
    }

    componentDidMount() {
        this.animateToCurrentRegion.bind(this)();
    }


    animateToCurrentRegion() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                var newCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                };
                this.setState({
                    pickerCoordinates: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                });
                if(this.refs.map && this.refs.map.state && this.refs.map.state.isReady){
                    if(!this.props.noZoom)
                    this.refs.map.animateToRegion(newCoords);
                } else {
                    setTimeout(() => {
                        try {
                            if(!this.props.noZoom)
                            this.refs.map.animateToRegion(newCoords);
                        }
                        catch (err) {
                            console.warn(err)
                        }
                    }, 1000);
                }
            },
            (error) => console.log(error),
            {enableHighAccuracy: false, timeout: 2000, maximumAge: 1000}
        );
    }

    pinDragHandler(e){
        this.setState({ pickerCoordinates: e.nativeEvent.coordinate })
    }

    getPicker() {
        if(this.props.mode != 'pickLocation'){
            return;
        }
        return <Marker
                coordinate={this.state.pickerCoordinates}
                onDragEnd={this.pinDragHandler.bind(this)}
                draggable
                />
    }

    getCardsPins(){
        if(this.props.mode !== 'cards') return null;
        var cards = this.props.cards;
        var result = [];
        if(!cards) return null;
        for(var i in cards){
            var card = cards[i];
            result.push(
                <Marker key={i}
                        title={card.currentGeo}
                        description={card.description}
                        coordinate={card.cardCoordinates}/>
            )
        }
        return result;
    }

    getStyles() {
        if(this.props.mode != 'pickLocation') return styles.flexMap;
        if(this.props.style) return [styles.pickerMap, this.props.style];
        return styles.pickerMap;
    }

    getPickLocationButton() {
        if(this.props.mode != 'pickLocation') return;
        return <PickLocationButton onPress={this.getPinCoordinates.bind(this)}/>
    }

    getPinCoordinates() {
        var pickerCoords = this.state.pickerCoordinates;
        delete pickerCoords.latitudeDelta;
        delete pickerCoords.longitudeDelta;
        this.props.onPick(this.state.pickerCoordinates);
    }

    getCountriesPins(){
        //if(this.props.mode !== 'countries') return null;
        if (this.props.mode == 'pickLocation') return null;
        var countries = this.props.countries.filter((country => {
            return (country.latitude != this.props.exposedCountryPoint.lat && country.longitude != this.props.exposedCountryPoint.lng)
        }));
        return countries.map((country, i) => {
            return <Marker key={i}
                           title={country.name}
                           description={country.name}
                           coordinate={{
                            latitude: country.latitude,
                            longitude: country.longitude,
                           }}>
                    <View style={styles.countryPin}>
                        <Text>{country.itemsAmount}</Text>
                    </View>
                    <Callout>
                        <TouchableOpacity onPress={() => this.props.onCountryCalloutPress(country.key, {
                            latitude: country.latitude,
                            longitude: country.longitude,
                           })}>
                            <Text>{country.name} ({country.itemsAmount})</Text>
                        </TouchableOpacity>
                    </Callout>
            </Marker>
        });

    }

    getChangeCountryButton(){
        return null;
        // if(this.props.mode !== 'cards') return null;
        // return (
        //     <View style={styles.changeCountryButton}>
        //         <TouchableOpacity onPress={this.props.changeCountry}>
        //             <Text style={styles.pickButtonText}>Change country</Text>
        //         </TouchableOpacity>
        //     </View>
        // )
    }

    changeRegion(region) {
        this.setState({region});
        this.props.onRegionChangeComplete && this.props.onRegionChangeComplete(region);
    }

    onRegionChange(region) {
        this.setState({region});
        this.props.onRegionChange && this.props.onRegionChange(region);
    }

    onRegionChangeComplete(region) {
        this.props.onRegionChangeComplete && this.props.onRegionChangeComplete(region);
    }

    render() {
        return (
            <View style={styles.container}>
                <MapView.Animated
                    ref="map"
                    bounces={true}
                    onMarkerDragEnd={this.pinDragHandler.bind(this)}
                    region={this.state.region}
                    style={this.getStyles()}
                    onRegionChange={this.onRegionChange.bind(this)}
                    onRegionChangeComplete={this.onRegionChangeComplete.bind(this)}
                >
                    {this.getPicker.bind(this)()}
                    {this.getCardsPins.bind(this)()}
                    {this.getCountriesPins.bind(this)()}
                </MapView.Animated>
                {this.getPickLocationButton.bind(this)()}
                {this.getChangeCountryButton.bind(this)()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    pickerTO: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    flexMap: {
        flex: 1,
        alignItems: 'stretch',
        backgroundColor: "81DBA7"
    },
    pickButton: {
        width: 150,
        height: 50,
        backgroundColor: "rgba(14, 6, 0, 0.2)",
        borderRadius: 10,
        position: 'absolute',
        right: Dimensions.get('window').width / 2 - 75,
        bottom: 80
    },
    pickerMap: {
        flex: 1
    },
    pickButtonText: {
        fontSize: 20
    },
    changeCountryButton: {
        backgroundColor: 'rgba(14, 6, 0, 0.2)',
        position: 'absolute',
        top: 10,
        right: 10,
        bottom: 0,
        height: 40,
        width: 200,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    countryPin: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    }
});