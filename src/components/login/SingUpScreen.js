'use strict';
import React, {
    AppRegistry,
    Component,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    AsyncStorage,
    Platform,
    Image,
    Dimensions
} from 'react-native';
var Firebase = require('firebase');
var {NativeModules} = require('react-native');
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');
var FBLoginManager = require('NativeModules').FBLoginManager;

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { initAuth } from '../../redux/redusers/auth'
import ASConstants from '../../constants/asyncStorage'
import FB from '../../constants/firebase'
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(FB.SECRET);

class SignUpScreen extends Component {

    constructor(props) {
        super(props);
        this.ref = FB.BASE_REF;
    }

    generatePassword() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    facebookLogin() {
        var self = this;
        this.props.initAuth({initialized: false});
        FBLoginManager.loginWithPermissions(["email","user_friends", "public_profile"], function(error, data){
            if (!error) {
                var newFBUserData = {};
                if(Platform.OS === 'ios'){
                    console.log('FB data:', data);
                    fetch('https://graph.facebook.com/' + data.credentials.userId +'?fields=first_name,last_name&access_token=' + data.credentials.token, {
                        method: 'GET'
                    }).then(function (response) {
                        response.text().then(function (response) {
                            var res = JSON.parse(response);
                            newFBUserData.firstName = decodeURIComponent(res.first_name);
                            newFBUserData.lastName = decodeURIComponent(res.last_name);
                            newFBUserData.facebookId = res.id;
                            var token = tokenGenerator.createToken({uid: res.id});
                            self.props.checkUserExists(res.id).then((exists) => {
                                if(!exists){
                                    self.props.registerUser(newFBUserData);
                                }
                            }).then(() => {
                                self.props.loginViaFacebookId(res.id);
                                self.props.saveLoginDataToStorage({facebookId: res.id});
                            });
                        })
                    })
                } else {
                    console.log("Login data: ", data);
                    var profile = JSON.parse(data.profile);
                    newFBUserData.facebookId = profile.id;
                    newFBUserData.firstName = profile.first_name;
                    newFBUserData.lastName = profile.last_name;
                    var token = tokenGenerator.createToken({uid: profile.id});
                    self.props.checkUserExists(profile.id).then((exists) => {
                        if(!exists){
                            self.props.registerUser(newFBUserData);
                        }
                    }).then(() => {
                        self.props.loginViaFacebookId(profile.id);
                        self.props.saveLoginDataToStorage({facebookId: profile.id});
                    });
                }
            } else {
                console.log("Facebook error: ", data);
                this.props.initAuth({});
            }
        }.bind(this))
    }

    signUp() {
        this.props.navigator.push({name: 'register'});
    }

    login() {
        this.props.navigator.push({name: 'log-in'});
    }

    render() {
        return (
            <View style={styles.wrapper}>
                <Image
                    source={require('../../img/sign-up-bg.jpg')}
                    style={styles.backgroundImage}>
                    <View style={styles.container}>
                        <View style={styles.bottom}>
                            <TouchableOpacity style={[styles.facebookButton, styles.button]} onPress={this.facebookLogin.bind(this)}>
                                <Text style={styles.facebookButtonText}>LOGIN WITH FACEBOOK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button]} onPress={this.signUp.bind(this)}>
                                <Text style={styles.signUpButtonText}>SIGN UP BY EMAIL</Text>
                            </TouchableOpacity>
                            <View style={styles.separationContainer}>
                                <View style={styles.divider}/>
                                <View style={styles.dividerCenter}>
                                    <Text style={styles.dividerText}>OR</Text>
                                </View>
                                <View style={styles.divider}/>
                            </View>
                            <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={this.login.bind(this)}>
                                <Text style={styles.loginButtonText}>LOGIN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigator.push({name: 'forgot'})} style={styles.forgotPasswordButton}>
                                <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Image>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    backgroundImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        flexDirection: "column"
    },
    facebookButtonText: {
        fontSize: 20,
        color: "#3b5998",
        textAlign: 'center',
        fontWeight: 'bold',
        margin: 10
    },
    signUpButtonText: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        margin: 10
    },
    loginButtonText: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        margin: 10
    },
    bottom: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        margin: 20,
        marginBottom: 80
    },
    input: {
        fontSize: 20,
        height: 60,
        borderColor: 'gray',
        borderWidth: 1,
        margin: 10,
        backgroundColor: "#EEE",
        borderRadius: 5
    },
    loginButton: {
        backgroundColor: "#FFC107",
        borderWidth: 0
    },
    facebookButton: {
        borderColor: "#3b5998"
    },
    button: {
        justifyContent: 'center',
        height: 60,
        borderWidth: 1,
        borderRadius: 5,
        margin: 10
    },
    separationContainer: {
        flexDirection: 'row',
        height: 20,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    divider: {
        height: 1,
        width: 30,
        borderBottomWidth: 1
    },
    dividerCenter: {
        marginLeft: 5,
        marginRight: 5
    },
    dividerText: {
        fontWeight: 'bold',
        fontSize: 20
    },
    forgotPasswordButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        borderRadius: 5,
        margin: 10
    },
    forgotPasswordText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    termsOfServiceText: {
        margin: 10,
        fontSize: 10,
        fontWeight: 'bold'
    }
});

let mapDispatchToProps = (dispatch)=>{
    return bindActionCreators({
        initAuth: initAuth
    }, dispatch)
};
let mapStateToProps = (state)=>{
    return {
        authData: state.authData
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUpScreen)