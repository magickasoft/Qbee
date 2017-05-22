'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
    View
} from 'react-native';

class Wrapper extends Component {

    render(){
        return this.props.onPress ? (
            <TouchableOpacity onPress={this.props.onPress}>
                {this.props.children}
            </TouchableOpacity>
        ) :  (
            <View>
                {this.props.children}
            </View>
        )
    }

}

export default class extends Component {

    getImage(){
        return(
            <Image
                style={[styles.image, {
                    width: this.props.radius * 2,
                    height: this.props.radius * 2,
                    borderRadius: this.props.radius,
                    borderWidth: this.props.bordered ? 3 : 0
                }]}
                source={{uri: this.props.image}}
                />
        )
    }

    getLabel(){
        return(
            <View
                style={[styles.label, {
                    width: this.props.radius * 2,
                    height: this.props.radius * 2,
                    borderRadius: this.props.radius,
                    borderWidth: this.props.bordered ? 3 : 0
                }]}
                >
                <Text style={{
                        fontSize: this.props.fontSize || this.props.radius,
                        fontWeight: 'bold'
                    }}>
                    {this.props.userName ? this.props.userName[0] : ''}
                </Text>
            </View>
        )
    }

    render() {
        return (
            <Wrapper {...this.props}>
                {this.props.image ? this.getImage.bind(this)() : this.getLabel.bind(this)()}
            </Wrapper>
        );
    }
}

const styles = StyleSheet.create({
    image: {
        borderColor: 'white'
    },
    label: {
        backgroundColor: '#eee',
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    }
});