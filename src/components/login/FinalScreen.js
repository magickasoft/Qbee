'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
    Image,
    TextInput,
    View
} from 'react-native';
import FB from '../../constants/firebase'

export default class extends Component {

    constructor(props){
        super(props);
        this.ref = FB.BASE_REF;
        this.state = {
            email: "",
            errorMessage: null
        }
    }

    onMailChange(text) {
        this.setState({
            email: text
        })
    }

    submit() {
        this.props.onSubmit();
    }

    render() {
        return (
            <View style={styles.container}>
                <Image
                    source={require('../../img/final-bg.jpg')}
                    style={styles.backgroundImage}>
                    <View style={styles.content}>
                        <TouchableOpacity style={styles.submitButton} onPress={this.submit.bind(this)}>
                            <Text style={styles.submitText}>START USING QBEE</Text>
                        </TouchableOpacity>
                    </View>
                </Image>
                <TouchableOpacity onPress={this.props.navigator.pop} style={styles.backIconTouch}>
                    <Image
                        source={require('../../img/back-icon.png')}
                        style={styles.backIconImage}
                        />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    backgroundImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    content: {
        flex: 1,
        margin: 20,
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        paddingBottom: 50
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
    input: {
        height: 60,
        fontSize: 20,
        borderColor: 'gray',
        margin: 10,
        backgroundColor: "#EEE",
        padding: 10,
        borderRadius: 5
    },
    submitButton: {
        backgroundColor: "#CDDC39",
        justifyContent: 'center',
        height: 60,
        borderRadius: 5,
        margin: 10,
    },
    submitText: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    errorText: {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        color: "red",
        margin: 10
    }
});