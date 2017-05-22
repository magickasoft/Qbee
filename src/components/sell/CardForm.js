'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    NativeModules,
    Image,
    ScrollView,
    Picker,
    Dimensions,
    View
} from 'react-native';
var RNGeocoder = require('react-native-geocoder');
var ImagePickerManager = require('NativeModules').ImagePickerManager;
var Datepicker = require('../general/Datepicker').default;
var moment = require('moment');
import FB from '../../constants/firebase'
import API from '../../API'
import GeoCoder from "../../helpers/GeoCoder"
import Helper from "../../helpers"

var ImagePickerOptions = {
    title: 'Select photo', // specify null or empty string to remove the title
    cancelButtonTitle: 'Cancel',
    takePhotoButtonTitle: 'Take Photo', // specify null or empty string to remove this button
    chooseFromLibraryButtonTitle: 'Choose from Library', // specify null or empty string to remove this button
    cameraType: 'back', // 'front' or 'back'
    mediaType: 'photo', // 'photo' or 'video'
    videoQuality: 'high', // 'low', 'medium', or 'high'
    maxWidth: 1024, // photos only
    maxHeight: 1024, // photos only
    aspectX: 1, // aspectX:aspectY, the cropping image's ratio of width to height
    aspectY: 1, // aspectX:aspectY, the cropping image's ratio of width to height
    quality: 1, // photos only
    angle: 0, // photos only
    allowsEditing: false, // Built in functionality to resize/reposition the image
    noData: false, // photos only - disables the base64 `data` field from being generated (greatly improves performance on large photos)
    storageOptions: { // if this key is provided, the image will get saved in the documents/pictures directory (rather than a temporary directory)
        skipBackup: true, // image will NOT be backed up to icloud
        path: 'Qbee' // will save image at /Documents/images rather than the root
    }
};

export default class extends Component {

    constructor(props){
        super(props);
        this.ref = FB.BASE_REF;
        if(this.props.card){
            this.state = this.props.card;
            this.state.countryCoordinates = {
                lat: +this.props.card.country.replace(/,/g, '.').split('_')[0],
                lng: +this.props.card.country.replace(/,/g, '.').split('_')[1]
            };
            console.log(this.state.countryCoordinates);
            this.state.dueDateInterval = 'months';
            this.state.dueDateCount = null;
        } else {
            this.state = {
                currentGeo : null,
                countryCoordinates: null,
                cardCoordinates: null,
                cardPhoto: null,
                shippingDate: null,
                paymentDueDate: null,
                itemsCount: null,
                offers: [],
                description: null,
                price: null,
                type: this.props.type,
                dueDateInterval: 'months',
                dueDateCount: null
            }
        }

    }

    setCardLocation(coords) {
        GeoCoder(coords, (data, err) => {
            if (data == null) {
                alert('Can not define country. Please pick another location');
            } else {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    this.setState(data)
                }
            }
        });
    }

    getCurrentLocation(){
        navigator.geolocation.getCurrentPosition(
            (position) => {
                var currentCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                this.setState({cardCoordinates: currentCoords});
                this.setCardLocation.bind(this)(currentCoords);
            },
            (error) => {
                if(error === 'No available location provider.'){
                    alert('Please enable location service on your device')
                } else {
                    console.log(error); alert(error.message)
                }
            },
            {enableHighAccuracy: false, timeout: 2000, maximumAge: 1000}
        );
    }

    pickLocation(data) {
        this.props.navigator.pop();
        this.setState({cardCoordinates: data});
        this.setCardLocation.bind(this)(data);
    }

    pickPhoto(){
        ImagePickerManager.showImagePicker(ImagePickerOptions, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.errorBox) {
                console.log('ImagePickerManager Error: ', response.errorBox);
                alert(response.errorBox);
            }
            else {
                const source = 'data:image/jpeg;base64,' + response.data;
                this.setState({cardPhoto: source});
            }
        });
    }

    descriptionChange(description){
        this.setState({description});
    }

    priceChange(price){
        this.setState({price});
    }

    onCountChange(itemsCount){
        this.setState({itemsCount});
    }

    pickDate(shippingDate){
        this.setState({shippingDate});
    }

    setDueDateInterval(dueDateInterval){
        this.setState({dueDateInterval})
    }

    setDueDateCount(dueDateCount){
        this.setState({dueDateCount})
    }

    validateCardForm() {
        var card = this.state;
        if(!card.description) {
            alert('Please fill in the description');
            return false;
        }
        if(!card.price) {
            alert('Please fill in the price');
            return false;
        } else {
            if(isNaN(+card.price)){
                alert('Please select numeric price');
                return false;
            }
        }
        if(!card.itemsCount) {
            alert('Please select items count');
            return false;
        } else {
            if(isNaN(+card.itemsCount)){
                alert('Please select numeric items count');
                return false;
            }
        }
        if(!card.cardCoordinates) {
            alert('Please select location');
            return false;
        }
        if(!card.cardPhoto) {
            alert('Please add photo');
            return false;
        }
        if(!card.shippingDate) {
            alert('Please select shipping date');
            return false;
        }
        if(!card.dueDateCount) {
            alert('Please select payment due date');
            return false;
        } else {
            if(isNaN(+card.dueDateCount)){
                alert('Please select numeric count of due date');
                return false;
            }
        }
        return true;
    }

    submitCard() {
        var card = this.state;
        var cardValid = this.validateCardForm.bind(this)();
        if(cardValid){
            card.paymentDueDate = moment().add(+card.dueDateCount, card.dueDateInterval).hours(0).minutes(0).second(0).format('X');
            card.itemsCount = +card.itemsCount;
            card.price = +card.price;
            card.user = this.props.authData.uid;
            let country = this.state.currentGeo.split(',')[0];
            if(!this.props.cardKey) {
                let countryRef = this.ref
                    .child('countries')
                    .child(country);
                countryRef.child('count').transaction(itemsAmount => {
                    console.log('itemsAmount:', itemsAmount);
                    if (!itemsAmount) {
                        return 1;
                    }
                    return itemsAmount + 1;
                });
                countryRef.update({
                    coordinates: {
                        longitude: card.countryCoordinates.lng,
                        latitude: card.countryCoordinates.lat
                    }
                });
            }
            delete card.dueDateCount;
            delete card.dueDateInterval;
            card.country = country;
            //card.longitude = card.cardCoordinates.longitude;
            //card.latitude = card.cardCoordinates.latitude;
            delete card.countryCoordinates;
            var newCard = {};
            if(this.props.cardKey){
                this.ref.child('cards').child(this.props.cardKey).set(card);
                newCard[this.props.cardKey] = card;
                this.props.addCard(newCard);
            } else {
                var newCardRef = this.ref.child('cards').push();
                newCard[newCardRef.key()] = card;
                newCardRef.set(card);
                this.ref.child('users').child(this.props.authData.uid).child('cards').child(newCardRef.key()).set(true);
            }
            this.props.navigator.resetTo({name: 'main'});
            alert('Product card ' + (this.props.cardKey ? 'updated' : 'registered'));
        }
    }

    deleteCard(){
        var removeCardObject = new Promise((resolve, reject) => {
            this.ref
                .child('cards')
                .child(this.props.cardKey)
                .remove()
                .then(resolve)
                .catch(err => reject(err));
        });
        var removeCardFromUser = new Promise((resolve, reject) => {
            this.ref
                .child('users')
                .child(this.props.card.user)
                .child('cards')
                .child(this.props.cardKey)
                .remove()
                .then(resolve)
                .catch(err => reject(err));
        });
        var removeMessagesReference = new Promise((resolve, reject) => {
            this.ref
                .child('messages')
                .child(this.props.cardKey)
                .remove()
                .then(resolve)
                .catch(err => reject(err));
        });
        var removePayments = new Promise((resolve, reject) => {
            this.ref
                .child('payments')
                .child(this.props.cardKey)
                .remove()
                .then(resolve)
                .catch(err => reject(err));
        });
        var decreaseCountryCounter = new Promise((resolve, reject) => {
            this.ref
                .child('countries')
                .child(this.props.card.country)
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
                this.props.deleteCard(this.props.cardKey);
                this.props.navigator.resetTo({name: 'main'});
            })
            .catch((err) => {console.warn('Can not complete all delete operations.', err)});
    }

    getDeleteButton(){
        if(!this.props.cardKey) return null;
        return(
            <TouchableOpacity onPress={this.deleteCard.bind(this)} style={styles.deleteButton}>
                <Image
                    source={require('../../img/iconset_trash.png')}
                    style={{width: 25, height: 25}}/>
            </TouchableOpacity>
        )
    }

    render() {
        return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.mainContainer}>
                <View style={styles.formContainer}>
                    <View style={styles.descriptionInputWrapper}>
                        <TextInput style={styles.description}
                                   onChangeText={this.descriptionChange.bind(this)}
                                   multiline={true}
                                   value={this.state.description ? this.state.description : ''}
                                   placeholder="item description..."
                                   placeholderTextColor="black"
                                   underlineColorAndroid="rgba(0, 0, 0, 0)"
                                   numberOfLines={4}/>
                    </View>
                    <View style={styles.inputWrapper}>
                        <TextInput style={styles.price}
                                   underlineColorAndroid="rgba(0, 0, 0, 0)"
                                   value={this.state.price ? '' + this.state.price : ''}
                                   onChangeText={this.priceChange.bind(this)}
                                   keyboardType="numeric"
                                   placeholder="Price"/>
                    </View>
                    <View style={styles.inputWrapper}>
                        <TextInput style={styles.itemsCount}
                                   value={this.state.itemsCount ? '' + this.state.itemsCount : ''}
                                   onChangeText={this.onCountChange.bind(this)}
                                   keyboardType="numeric"
                                   underlineColorAndroid="rgba(0, 0, 0, 0)"
                                   placeholder="Items count"/>
                    </View>
                    <Text style={styles.cardOwner}>by {this.props.authData.firstName} {this.props.authData.lastName}</Text>
                    <Text style={styles.from}>From: {this.state.currentGeo}</Text>
                </View>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity onPress={this.getCurrentLocation.bind(this)} style={styles.Button}>
                        <Text style={styles.text}>USE CURRENT LOCATION</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigator.push({name: 'map-location-picker', onPick: this.pickLocation.bind(this)})} style={styles.Button}>
                        <Text style={styles.text}>PIN LOCATION</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.pickPhoto.bind(this)} style={styles.Button}>
                        <Text style={styles.text}>ADD PHOTO</Text>
                    </TouchableOpacity>
                    <Datepicker
                        toggleButton={
                            <View style={styles.Button}>
                                <Text style={styles.text}>SHIPPING DATE</Text>
                            </View>
                        }
                        textStyle={styles.text}
                        pickerStyle={styles.Button}
                        onDatePick={this.pickDate.bind(this)}>
                        SHIPPING DATE
                    </Datepicker>
                </View>
                <View style={styles.containerCenter}>
                    <Text style={styles.text}>TIME STAMP</Text></View>
                <View style={styles.row}>
                    <View style={styles.col1}>
                        <TextInput style={styles.dueDateCount}
                                   onChangeText={this.setDueDateCount.bind(this)}
                                   keyboardType="numeric"
                                   maxLength={2}
                                   placeholder="Number of"/>
                    </View>
                    <View style={styles.col1}>
                        <Picker selectedValue={this.state.dueDateInterval}
                            onValueChange={this.setDueDateInterval.bind(this)}
                            style={styles.paymentDueDateCountPicker}>
                            <Picker.Item value='days' label='Days'/>
                            <Picker.Item value='weeks' label='Weeks'/>
                            <Picker.Item value='months' label='Months'/>
                            <Picker.Item value='years' label='Years'/>
                        </Picker>
                    </View>
                </View>
                <View style={styles.containerCenter}>
                    <TouchableOpacity onPress={this.submitCard.bind(this)} style={[styles.submitButton, this.props.type === 'sell' ? styles.sellButtonColor : styles.requestButtonColor]}>
                        <Text style={styles.text}>
                            {this.props.type === 'sell' ? "Sell" : null}
                            {this.props.type === 'request' ? "I want" : null}
                        </Text>
                    </TouchableOpacity>
                    {this.getDeleteButton.bind(this)()}
                </View>
            </View>
        </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: 'white'
    },
    mainContainer: {
        flex: 1,
        alignItems: "stretch",
        justifyContent: "flex-start",
        margin: 10,
        marginBottom: 25,
    },
    formContainer: {
        padding: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column'
    },
    description: {
        height: 130,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        fontSize: 20,
        padding: 5
    },
    price: {
        height: 38,
        fontSize: 30,
        padding: 0,
        margin: 0,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        fontWeight: 'bold'
    },
    itemsCount: {
        height: 40,
        fontSize: 20,
        padding: 0,
        margin: 0
    },
    inputWrapper: {
        alignSelf: 'stretch',
        height: 38,
        borderBottomWidth: 1,
        borderColor: '#ccc'
    },
    descriptionInputWrapper: {
        alignSelf: 'stretch',
        height: 130,
        borderBottomWidth: 1,
        borderColor: '#ccc'
    },
    timeSpan: {
        height: 40,
        fontSize: 25,
        padding: 5
    },
    cardOwner: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 20
    },
    from: {
        fontSize: 20
    },
    buttonGroup: {
        alignItems: "stretch",
        justifyContent: 'space-around',
        marginLeft: 15,
        marginRight: 15,
    },
    Button: {
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderRadius: 10,
        margin: 5
    },
    text: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    shippingDate: {
        height: 40,
        fontSize: 20,
        padding: 5
    },
    containerCenter: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    cardPhoto: {
        width: 100,
        height: 100
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    col1: {
        margin: 5,
        flex: 1,
        alignItems: "stretch",
        justifyContent: "center",
        flexDirection: 'row'
    },
    paymentDueDateCountPicker: {
        flex: 1
    },
    dueDateCount: {
        flex: 1,
        height: 50,
        fontSize: 20
    },
    submitButton: {
        alignItems: "center",
        justifyContent: "center",
        height: 70,
        width: 70,
        borderRadius: 35,
        borderWidth: 5,
        borderColor: "#FFFFFF",
        marginBottom: 40
    },
    deleteButton: {
        position: 'absolute',
        left: Dimensions.get('window').width / 2 + 20,
        top: 10,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        width: 50,
        borderRadius: 25,
        borderWidth: 5,
        borderColor: "#FFFFFF",
        backgroundColor: "red",
        marginBottom: 40
    },
    sellButtonColor: {
        backgroundColor: "#FF9800"
    },
    requestButtonColor: {
        backgroundColor: "#2196F3"
    }
});