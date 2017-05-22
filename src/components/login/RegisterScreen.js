'use strict';
import React, {
    AppRegistry,
    Component,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    View,
    AsyncStorage,
    Platform,
    Dimensions
} from 'react-native';
var {NativeModules} = require('react-native');
var FBLoginManager = require('NativeModules').FBLoginManager;
import { initAuth } from '../../redux/redusers/auth'
var GiftedSpinner = require('react-native-gifted-spinner');

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: null,
            fetching: false
        }
    }

    onFirstNameChange(text){
        this.setState({firstName: text});
    }

    onLastNameChange(text){
        this.setState({lastName: text});
    }

    onEmailNameChange(text){
        this.setState({email: text});
    }

    onFirstPassChange(text){
        this.setState({firstPass: text});
    }
    onSecondPassChange(text){
        this.setState({secondPass: text});
    }

    validateForm() {
        var state = this.state;
        function emailIsValid() {
            var email = state.email;
            var atIndex = email.indexOf('@');
            var dotIndex = email.indexOf('.');
            return (atIndex > -1 && dotIndex > -1);
        }
        if(!state.firstName || !state.lastName || !state.email || !state.firstPass || !state.secondPass) {
            this.setState({errorMessage: "Please fill in all the fields"});
            return false;
        }
        if(!emailIsValid()){
            this.setState({errorMessage: "Please enter valid email"});
            return false;
        }
        if(state.firstPass != state.secondPass){
            this.setState({errorMessage: "Passwords don't match"});
            return false;
        }
        this.setState({errorMessage: null});
        return true;
    }

    handleSubmit() {
        if (this.state.fetching) return;
        var formValid = this.validateForm();
        if (formValid) {
            this.setState({fetching: true});
            this.registerUser();
        }
    }

    registerUser() {
        var authObject = {
            email: this.state.email,
            password: this.state.firstPass,
            firstName: this.state.firstName,
            lastName: this.state.lastName
        };
        this.props.createUser(authObject, (error) => {
            console.log('Register screen got error:', error);
            this.setState({errorMessage: error, fetching: false});
        }, (successCallback) => {
            this.props.navigator.push({name: 'final', onSubmit: successCallback})
        });
    }

    render() {
        var error = this.state.errorMessage ? <Text style={styles.errorText}>{this.state.errorMessage}</Text> : null;
        return (
            <View style={styles.container}>
                <Image
                    source={require('../../img/register-bg.jpg')}
                    style={styles.backgroundImage}>
                    <View style={styles.bottom}>
                        <View style={styles.container}>
                            {error}
                        </View>
                        <TextInput
                            onChangeText={this.onFirstNameChange.bind(this)}
                            style={styles.input}
                            autoCapitalize="words"
                            placeholder="first name"
                            />
                        <TextInput
                            onChangeText={this.onLastNameChange.bind(this)}
                            style={styles.input}
                            autoCapitalize="words"
                            placeholder="last name"
                            />
                        <TextInput
                            onChangeText={this.onEmailNameChange.bind(this)}
                            style={styles.input}
                            placeholder="email address"
                            />
                        <TextInput
                            onChangeText={this.onFirstPassChange.bind(this)}
                            style={styles.input}
                            secureTextEntry={true}
                            placeholder="password"
                            />
                        <TextInput
                            onChangeText={this.onSecondPassChange.bind(this)}
                            style={styles.input}
                            secureTextEntry={true}
                            placeholder="password again"
                            />
                        <TouchableOpacity onPress={this.handleSubmit.bind(this)} style={styles.button}>
                            {this.state.fetching ? <GiftedSpinner size={'large'} style={{height: 40}} /> : <Text style={styles.submitButtonText}>Ok</Text>}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={this.props.navigator.pop} style={styles.backIconTouch}>
                        <Image
                            source={require('../../img/back-icon.png')}
                            style={styles.backIconImage}
                            />
                    </TouchableOpacity>
                </Image>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        flexDirection: "column"
    },
    backgroundImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    submitButtonText: {
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
        margin: 20
    },
    input: {
        fontSize: 20,
        height: 60,
        borderColor: 'gray',
        margin: 10,
        backgroundColor: "#EEE",
        borderRadius: 5,
        padding: 10
    },
    button: {
        justifyContent: 'center',
        height: 60,
        borderRadius: 5,
        backgroundColor: "#CDDC39",
        margin: 10
    },
    errorText: {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        color: "red",
        margin: 10
    },
    backIconTouch: {
        position: 'absolute',
        left: 10,
        top: 15,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backIconImage: {
        width: 32,
        height: 32
    }
});