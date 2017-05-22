'use strict';
import React, {
    Component,
    StyleSheet,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import ASConstants from '../../constants/asyncStorage'
import FB from '../../constants/firebase'

export default class extends Component {

    constructor(props){
        super(props);
        this.ref = FB.BASE_REF;
        this.state = {
            email: "",
            password: "",
            errorMessage: null
        }
    }

    componentDidMount() {
    }

    onMailChange(text) {
        this.setState({
            email: text
        })
    }

    onPasswordChange(text) {
        this.setState({
            password: text
        })
    }

    validateForm() {
        return this.state.password && this.state.email
    }

    submit() {
        if(!this.validateForm){
            this.setState({errorMessage: "Please fill in all the fields"});
            return;
        }
        this.props.authWithPassword({password: this.state.password, email: this.state.email}
            , 'manually', function (error) {
            this.setState({errorMessage: error});
        }.bind(this));
    }

    render() {
        var error = this.state.errorMessage ? <Text style={styles.errorText}>{this.state.errorMessage}</Text> : null;
        return (
            <View style={styles.container}>
                <Image
                    source={require('../../img/login-bg.jpg')}
                    style={styles.backgroundImage}>
                    <View style={styles.bottom}>
                        <View style={styles.form}>
                            {error}
                            <TextInput
                                style={styles.input}
                                onChangeText={this.onMailChange.bind(this)}
                                value={this.state.email}
                                placeholder="email"
                                />
                            <TextInput
                                style={styles.input}
                                onChangeText={this.onPasswordChange.bind(this)}
                                value={this.state.password}
                                placeholder="password"
                                secureTextEntry={true}
                                />
                                <TouchableOpacity style={styles.submitButton} onPress={this.submit.bind(this)}>
                                    <Text style={styles.submitText}>Sign in</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.props.navigator.push({name: 'forgot'})} style={styles.forgotPasswordButton}>
                                    <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
                                </TouchableOpacity>
                        </View>
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
    },
    submitText: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    form: {
        marginBottom: 50
    },
    backgroundImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    bottom: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        height: Dimensions.get('window').height / 2,
        marginLeft: 10,
        marginRight: 10
    },
    input: {
        height: 60,
        fontSize: 20,
        borderColor: 'gray',
        margin: 10,
        backgroundColor: "#EEE",
        padding: 10,
        borderRadius: 5
    },
    errorText: {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        color: "red",
        margin: 10
    },
    submitButton: {
        backgroundColor: "#FFC107",
        justifyContent: 'center',
        height: 60,
        borderRadius: 5,
        margin: 10,
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
    }
});