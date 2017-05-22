'use strict';

import React, {
    Alert,
    Component,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableHighlight,
    ScrollView,
    Platform,
    View
} from 'react-native';
import Avatar from '../general/Avatar'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
var ImagePickerManager = require('NativeModules').ImagePickerManager;
import FB from '../../constants/firebase';

var Accordion = require('react-native-accordion');

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

export default class SettingsScreen extends Component {

    _focusNextField(nextField) {
        this.refs[nextField].focus();
    }

    constructor(props) {
        super(props);
        this.ref = FB.BASE_REF;
        this.state = {
            userName: props.authData.firstName + ' ' + props.authData.lastName,
            avatar: props.authData.avatar,
            paypal: props.authData.paypal,
            currentPass: '',
            newPass: '',
            newPass2: '',
            onPassError: '',
            onPassSuccess: '',
            supportError: false,
            supportSuccess: false
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Avatar
                            image={this.state.avatar}
                            bordered
                            radius={53}
                            userName={this.state.userName}/>
                        <TouchableOpacity onPress={this.pickAvatar.bind(this)} style={styles.editButton}>
                            <View>
                                <Text style={styles.pencilIcon}>&#x270e;</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userNameContainer}>
                        <Text style={styles.userName}>
                            { this.state.userName }
                        </Text>
                    </View>
                    <View style={styles.userRatingContainer}>
                        <Text style={[styles.userRatingStar, styles.goldStar]}>&#9733;</Text>
                        <Text style={[styles.userRatingStar, styles.goldStar]}>&#9733;</Text>
                        <Text style={[styles.userRatingStar, styles.goldStar]}>&#9733;</Text>
                        <Text style={[styles.userRatingStar, styles.goldStar]}>&#9733;</Text>
                        <Text style={[styles.userRatingStar, styles.greyStar]}>&#9733;</Text>
                    </View>
                    <View style={styles.ratingInfoContainer}>
                        <Text style={styles.ratingInfoText}>In 100 items</Text>
                    </View>
                </View>
                <KeyboardAwareScrollView keyboardShouldPersistTaps={true} ref='scrollView'>
                    <View style={styles.profileOptions}>
                        <View style={styles.profileOption}>
                            <TouchableOpacity onPress={ this.goToMyItems.bind(this) }>
                                <Text>MY CURRENT ITEMS</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileOption}>
                            {this._renderPasswordRow()}
                        </View>
                        <View style={styles.profileOption}>
                            {this._renderPaypalAccountRow()}
                        </View>
                        <View style={styles.profileOption}>
                            <TouchableOpacity onPress={ this.showLogoutPopup.bind(this) }>
                                <Text>LOGOUT</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileOption}>
                            {this._renderSupportRow()}
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }

    pickAvatar(){
        ImagePickerManager.showImagePicker(ImagePickerOptions, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picking');
            }
            else if (response.errorBox) {
                console.log('ImagePickerManager Error: ', response.errorBox);
                alert(response.errorBox);
            }
            else {
                const source = 'data:image/jpeg;base64,' + response.data;
                this.ref
                    .child('users')
                    .child(this.props.authData.uid)
                    .child('avatar')
                    .set(source)
                    .then(() => {
                        var updatedProfile = Object.assign(this.props.authData, {avatar: source});
                        this.props.updateProfile(updatedProfile);
                        this.setState({avatar: source});
                    })
            }
        });
    }

    goToMyItems () {
        this.props.navigator.push({
            name: 'my-items'
        });
    }

    _renderPasswordRow () {
        let header = (
            <Text>CHANGE PASSWORD</Text>
        );
        let content = (
            <View style={styles.profileItemContent}>
                { this.showPassEvents() }
                <View style={styles.profileInputWrap}>
                    <TextInput underlineColorAndroid="transparent" ref="current" onSubmitEditing={() => this._focusNextField('newPass')} returnKeyType='next' value={this.state.currentPass} onChangeText={this.onCurrentPassChange.bind(this)} secureTextEntry={true} style={styles.profileInput} placeholder="Current password"/>
                </View>
                <View style={styles.profileInputWrap}>
                    <TextInput underlineColorAndroid="transparent" ref="newPass" onSubmitEditing={() => this._focusNextField('newPass2')} returnKeyType='next' value={this.state.newPass} onChangeText={this.onNewPassChange.bind(this)} secureTextEntry={true} style={styles.profileInput} placeholder="New password"/>
                </View>
                <View style={styles.profileInputWrap}>
                    <TextInput underlineColorAndroid="transparent" ref="newPass2" value={this.state.newPass2} onChangeText={this.onNewPass2Change.bind(this)} returnKeyType='done' secureTextEntry={true} style={styles.profileInput} placeholder="New password 2"/>
                </View>
                <TouchableHighlight onPress={ this.passChange.bind(this) } style={styles.button}>
                    <Text style={styles.buttonText}>CHANGE</Text>
                </TouchableHighlight>
            </View>
        );
        return (
            <Accordion header={header} content={content} underlayColor="transparent"/>
        )
    }

    _renderPaypalAccountRow(){
        let header = (
            <Text>PAYPAL ACCOUNT</Text>
        );
        let content = (
            <View style={styles.profileItemContent}>
                { this.showPassEvents() }
                <View style={styles.profileInputWrap}>
                    <TextInput underlineColorAndroid="transparent" ref="paypal" returnKeyType='next' value={this.state.paypal} onChangeText={this.onPaypalChange.bind(this)} style={styles.profileInput} placeholder="Email"/>
                </View>
                <TouchableHighlight onPress={ this.submitPaypal.bind(this) } style={styles.button}>
                    <Text style={styles.buttonText}>SUBMIT</Text>
                </TouchableHighlight>
            </View>
        );
        return (
            <Accordion ref="paypalAccordion" header={header} content={content} underlayColor="transparent"/>
        )
    }

    _renderSupportRow () {
        let header = (
            <Text>SUPPORT</Text>
        );
        let content = (
            <View style={styles.profileItemContent}>
                { this.showSupportEvents() }
                <View style={styles.textareaWrap}>
                    <TextInput underlineColorAndroid="transparent" placeholder='What seems to be the problem?' multiline={true} style={styles.textarea} />
                </View>
                <TouchableHighlight onPress={() => console.log()} style={styles.button}>
                    <Text style={styles.buttonText}>SUBMIT</Text>
                </TouchableHighlight>
            </View>
        );
        return (
            <Accordion header={header} content={content} underlayColor="transparent"/>
        )
    }


    showLogoutPopup () {
        let logout = this.props.logout;
        Alert.alert('Logout', 'Are you sure?',
            [
                { text: 'Cancel' },
                { text: 'OK', onPress: () => logout() }
            ]
        );
    }

    showPassEvents () {
        if(!this.state.onPassError && !this.state.onPassSuccess) return null;

        if(this.state.onPassError) return (
            <View style={[styles.message, styles.errorBox]}>
                <Text style={styles.errorMessageText}>{this.state.onPassError}</Text>
            </View>
        );
        if(this.state.onPassSuccess) return (
            <View style={[styles.message, styles.successBox]}>
                <Text style={styles.errorMessageText}>{this.state.onPassSuccess}</Text>
            </View>
        )
    }

    showSupportEvents () {
        if(!this.state.supportError && !this.state.supportSuccess) return null;
        if(this.state.supportError) return (
            <View style={[styles.message, styles.errorBox]}>
                <Text style={ styles.errorMessageText }>ERROR MESSAGE HERE</Text>
            </View>
        );
        if(this.state.supportSuccess) return (
            <View style={[styles.message, styles.successBox]}>
                <Text style={ styles.successMessageText }>SUCCESS MESSAGE HERE</Text>
            </View>
        )
    }

    onCurrentPassChange (text) {
        this.setState({
            currentPass: text
        })
    }

    onNewPassChange (text) {
        this.setState({
            newPass: text
        })
    }

    onNewPass2Change (text) {
        this.setState({
            newPass2: text
        })
    }

    onPaypalChange(text){
        this.setState({
            paypal: text
        })
    }

    submitPaypal(){
        this.ref
            .child('users')
            .child(this.props.authData.uid)
            .child('paypal')
            .set(this.state.paypal)
            .then(() => {
                this.refs.paypalAccordion.close();
            })
    }

    passChange () {

        if(this.state.currentPass == '' || this.state.newPass == '' || this.state.newPass2 == ''){
            this.setState({
                onPassError: 'All fields must be filled.'
            });
            return;
        }
        else if(this.state.newPass !== this.state.newPass2){
            this.setState({
                onPassError: 'Passwords didn\'t match. Please, check it.'
            });
            return;
        }

        // TODO: Add email to props
        let email = this.ref.getAuth().password.email;
        this.ref.changePassword({
                email: email,
                oldPassword: this.state.currentPass,
                newPassword: this.state.newPass
            },
            (error) => {
                if(error){
                    switch(error.code){
                        case 'INVALID_PASSWORD':
                            this.setState({
                                onPassError: 'Current password is incorrect. Please, check it.'
                            });
                            break;
                        case 'INVALID_USER':
                            this.setState({
                                onPassError: "The specified user account does not exist."
                            });
                            break;
                        default:
                            this.setState({
                                onPassError: error
                            });
                    }
                }
                else{
                    this.setState({
                        currentPass:'',
                        newPass: '',
                        newPass2: '',
                        onPassError: '',
                        onPassSuccess: 'Password changed successfully.'
                    });
                    setTimeout(() => this.setState({onPassSuccess: ''}), 5000);
                }
            }
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: 'white',
        paddingBottom: 60
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        position: 'relative'
    },
    headerRow: {
        flexDirection: 'row'
    },
    avatar: {
        width: 106,
        height: 106,
        borderRadius: 53,
        borderColor: 'white',
        borderWidth: 3
    },
    editButton: {
        position: 'absolute',
        backgroundColor: '#FFC107',
        width: 70,
        height: 70,
        borderRadius: 100,
        left: 52,
        top: 20,
        marginLeft: 40,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    pencilIcon: {
        transform: [{ scaleX: -1}],
        backgroundColor: 'transparent',
        fontSize: 28
    },
    userNameContainer: {
        flex: 1,
        alignItems: 'flex-start',
        height: 30
    },
    userName: {
        fontSize: 22,
        padding: 5
    },
    userRatingContainer: {
        paddingTop: 5,
        flex: 1,
        flexDirection: 'row',
        height: 30
    },
    userRatingStar: {
        fontSize: 18
    },
    greyStar: {
        color: '#ccc'
    },
    goldStar: {
        color: '#FFC107'
    },
    ratingInfoContainer: {
        padding: 5,
        height: 20
    },
    ratingInfoText: {
        fontSize: 14
    },
    profileOptions: {
        paddingLeft: 20,
        paddingTop: 10
    },
    profileOption: {
        paddingVertical: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    profileOptionZone: {
        paddingBottom: 0
    },
    profileItemContent: {
        paddingTop: 10,
        marginRight: 20
    },
    message: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        marginBottom: 5,
        borderRadius: 10
    },
    errorBox: {
        backgroundColor: 'red'
    },
    errorMessageText: {
        fontSize: 12,
        color: 'white'
    },
    successMessageText: {
        fontSize: 12
    },
    successBox: {
        backgroundColor: '#CDDC39'
    },
    profileInputWrap: {
        borderRadius: 15,
        backgroundColor: '#eee',
        height: 30,
        marginBottom: 5
    },
    profileInput: {
        padding: 0,
        paddingLeft: 5,
        height: 30,
        borderColor: '#eee'
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#CDDC39',
        borderRadius: 10,
        height: 30
    },
    buttonText: {
        fontSize: 14
    },
    textareaWrap: {
        height: 120,
        borderRadius: 15,
        backgroundColor: '#eee',
        marginBottom: 5
    },
    textarea: {
        fontSize: 14,
        textAlignVertical: 'top',
        height: 120,
        paddingLeft: 7,
        paddingTop: 7
    }
});