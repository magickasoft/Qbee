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

import Card from '../main/Card'

import FB from '../../constants/firebase';

export default class MyItemsScreen extends Component {
    
    constructor (props) {
        super(props);
        this.ref = FB.BASE_REF;
    }
    
    render () {
        return (
            <ScrollView>
                <View style={styles.cardsList}>
                    {Object.keys(this.props.cards).map((item, i) => {
                        return (
                            <Card flipped={true} key={item} cardKey={item} navigator={this.props.navigator} card={this.props.cards[item]}/>
                        );
                    })}
                </View>
            </ScrollView>
        )
    }
    
}

const styles = StyleSheet.create({
    cardsList: {
        flexDirection: 'row',
        flex: 1,
        flexWrap: 'wrap'
    }
});