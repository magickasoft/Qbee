'use strict';
import React, {
    AsyncStorage,
    AppRegistry,
    Component,
    Text,
    View
} from 'react-native';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { initAuth } from '../redux/redusers/auth'
import SingUpScreen from './AuthNavigator'
import MainScreen from './MainNavigator'
import PreloaderScreen from './general/PreloaderScreen'
import ASConstants from '../constants/asyncStorage'
import FB from '../constants/firebase'
var Firebase = require('firebase');
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(FB.SECRET);

let mapDispatchToProps = (dispatch)=>{
    return bindActionCreators({
        initAuth: initAuth
    }, dispatch)
};
let mapStateToProps = (state)=>{
    return {
        auth: state.auth
    }
};

class App extends Component {
    constructor(props) {
        super(props);
        this.ref = FB.BASE_REF;
    }

    getUserByUid(uid){
        this.ref
            .child('users')
            .child(uid)
            .once('value', snapshot => {
                if(snapshot.val()){
                    this.props.initAuth(Object.assign(snapshot.val(), {uid: uid}))
                } else {
                    this.props.initAuth({});
                }
            },
                errorObject => {
                console.log("The read failed: " + errorObject.code);
            })
    }

    authWithPassword(loginData, type, errCallback){
        return new Promise((resolve, reject) => {
            this.ref.authWithPassword(loginData, (err, authData) => {
                if (err) {
                    console.log("Login Failed!", err.code);
                    switch (err.code) {
                        case "INVALID_EMAIL": {
                            errCallback ? errCallback('Email is invalid') : null;
                            break;
                        }
                        case "INVALID_PASSWORD": {
                            errCallback ? errCallback('Password is invalid') : null;
                            break;
                        }
                        case "INVALID_USER":
                        {
                            errCallback ? errCallback('User is not registered') : null;
                            break;
                        }
                        default :
                    }
                    if(type && type == 'auto'){
                        this.logOut();
                    }
                } else {
                    console.log('successfully logged in');
                    resolve(loginData);
                    this.saveLoginDataToStorage(loginData);
                    this.getUserByUid(authData.auth.uid);
                }
            }, (a, b, c) => {
                console.log(a, b, c)
            })
        });
    }

    saveLoginDataToStorage(data, callback){
        AsyncStorage.setItem(ASConstants.LOGIN_DATA, JSON.stringify(data)).then(function (result) {
           callback ? callback(result) : null;
        });
    }

    checkUserExists(uid){
        return new Promise((resolve, reject) => {
            this.ref
                .child('users')
                .child(uid)
                .once('value', (snapshot) => {
                    if(snapshot.val()){
                        resolve(true);
                    } else {
                        resolve(false)
                    }
                })
        });
    }

    registerUser(userData) {
        var newUser = {
            firstName: userData.firstName,
            lastName: userData.lastName
        };
        if(userData.facebookId){
            newUser.facebookId = userData.facebookId;
            userData.uid = userData.facebookId;
        }
        this.ref
            .child('users')
            .child(userData.uid)
            .set(newUser)
            .catch((err) => alert(err));
        this.props.initAuth({
            firstName: userData.firstName,
            lastName: userData.lastName,
            facebookId: userData.facebookId,
            uid: userData.uid
        });
    }

    createUser(data, errCallback, successCallback){
        var authObject = {
            password: data.password,
            email: data.email
        };
        var userData = {
            firstName: data.firstName,
            lastName: data.lastName
        };
        if(data.facebookId){
            userData.facebookId = data.facebookId;
        }
        this.ref.createUser(authObject, (error, authData) => {
            if (error) {
                console.log("Registration Failed!", error.code);
                if(error.code == 'EMAIL_TAKEN'){
                    errCallback ? errCallback('Sorry, this email is already taken') : null
                } else {
                    errCallback ? errCallback(error.details) : null;
                }
            } else {
                console.log("Registered user successfully. Login Data:", JSON.stringify(authData));
                successCallback(() => {
                    userData.uid = authData.uid;
                    this.authWithPassword(authObject)
                        .then(() => {
                                this.registerUser(userData);
                            });
                })
            }
        });
    }

    logOut() {
        AsyncStorage.removeItem(ASConstants.LOGIN_DATA).then(function () {
            this.props.initAuth({});
        }.bind(this))
    }

    loginViaFacebookId(FBid) {
        var token = tokenGenerator.createToken({uid: FBid});
        this.ref.authWithCustomToken(token, (error, authData) => {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Login via Facebook", authData);
                this.getUserByUid(authData.uid);
            }
        });
    }

    componentWillMount() {
        AsyncStorage.getItem(ASConstants.LOGIN_DATA, function (err, loginData) {
            if(loginData){
                var data = JSON.parse(loginData);
                var dataProperties = Object.keys(data);
                if (dataProperties.indexOf('facebookId') > -1){
                    this.loginViaFacebookId(data.facebookId)
                } else if (dataProperties.indexOf('email') > -1){
                    this.authWithPassword(data, 'auto');
                }
            } else {
                console.log('No login data');
                this.props.initAuth({initialized: true});
            }
        }.bind(this));
    }

    render() {
        if (!this.props.auth.initialized) return <PreloaderScreen preloaderHeight={40} />;
        if (this.props.auth.uid){
            return <MainScreen
                logOut={this.logOut.bind(this)}/>
        } else {
            return (
                <SingUpScreen
                    createUser={this.createUser.bind(this)}
                    authWithPassword={this.authWithPassword.bind(this)}
                    getUserByUid={this.getUserByUid.bind(this)}
                    registerUser={this.registerUser.bind(this)}
                    loginViaFacebookId={this.loginViaFacebookId.bind(this)}
                    saveLoginDataToStorage={this.saveLoginDataToStorage.bind(this)}
                    checkUserExists={this.checkUserExists.bind(this)}
                />
            );
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);