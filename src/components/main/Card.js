'use strict';
import React, {
    Component,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    View
} from 'react-native';

var moment = require('moment');

export default class extends Component {

    onPress(){
        this.props.navigator.push({name: 'card-view', card: this.props.card, key: this.props.cardKey})
    }

    getInfoLabel(){
        var today = moment();
        var paymentDate = moment(this.props.card.paymentDueDate, 'X');
        var hoursLeft = paymentDate.diff(today, 'hours');
        if(hoursLeft < 24) return <Text style={styles.warningText}>Last Day</Text>;
        if(this.props.card.itemsCount === 1) return <Text style={styles.warningText}>Last Item!</Text>;
        return null;
    }

    render(){
        return (
            <TouchableOpacity onPress={this.onPress.bind(this)} style={styles.container}>
                <Image style={styles.backgroundImage}
                    source={{uri: this.props.card.cardPhoto}}>
                </Image>
                <View style={styles.infoLabel}>
                    <View style={styles.warningLabel}>
                        {this.getInfoLabel.bind(this)()}
                    </View>
                    <Text style={styles.priceText}>{this.props.card.price}$</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        margin: 5,
        width: Dimensions.get('window').width / 2 - 10,
        height: 150
    },
    backgroundImage: {
        flex: 1
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        position: 'absolute',
        bottom: 10, right: 10,
        backgroundColor: 'white'
    },
    warningLabel: {
        backgroundColor: 'red',
    },
    priceText: {
        margin: 5,
        fontSize: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningText : {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white', margin: 5
    }
});