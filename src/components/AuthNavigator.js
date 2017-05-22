'use strict';
var React = require('react-native');
var {
    Component,
    Navigator,
    BackAndroid
    } = React;
import SignUpScreen from './login/SingUpScreen';
import LoginScreen from './login/LoginScreen';
import RegisterScreen from './login/RegisterScreen';
import ForgotPasswordScreen from './login/ForgotPasswordScreen';
import FinalScreen from './login/FinalScreen';

export default class extends Component{

    componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            this.refs.navigator.pop();
            return true;
        });
    }

    renderScene (route, navigator){
        switch (route.name){
            case 'sign-up': {
                return <SignUpScreen {...this.props} navigator={navigator} />;
            }
            case 'log-in': {
                return <LoginScreen {...this.props} navigator={navigator} />
            }
            case 'register': {
                return <RegisterScreen
                    createUser={this.props.createUser}
                    authWithPassword={this.props.authWithPassword}
                    registerUser={this.props.registerUser}
                    navigator={navigator} />
            }
            case 'forgot': {
                return <ForgotPasswordScreen navigator={navigator} />
            }
            case 'final': {
                return <FinalScreen
                    onSubmit={route.onSubmit}
                    navigator={navigator} />
            }
            default:
                return <SignUpScreen
                    createUser={this.props.createUser}
                    navigator={navigator} />;
        }
    }

    render() {
        return (
            <Navigator
                initialRoute={{name: 'sign-up'}}
                renderScene={this.renderScene.bind(this)}
                ref="navigator">
            </Navigator>
        );
    }
};
