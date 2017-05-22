/**
 * Created by Bardiaswift on 10/05/16.
 */

var RNGeocoder = require('react-native-geocoder');
import API from '../API'

export default function (coords, cb) {
    RNGeocoder.reverseGeocodeLocation(coords).then((data) => {
        var country = data[0].country;
        if(!country) {
            if(typeof cb === "function") {
                cb(null);
            }
            return;
        }
        RNGeocoder.geocodeAddress(country, (err, cardCountry) => {
            if (err) {
                if(typeof cb === "function") {
                    cb(null, err);
                }
                return;
            }
            API.getCountryCoordinate(country)
                .then(countryCoordinates => {  //{lat: lng:}
                    var locality = data[0].locality;
                    var name = data[0].name;
                    var currentGeo;
                    if (!country) {
                        currentGeo = name;
                    } else {
                        if(!locality){
                            currentGeo = country + ', ' + name;
                        } else {
                            currentGeo = country + ', ' + locality;
                        }
                    }
                    if(typeof cb === "function") {
                        cb({currentGeo, countryCoordinates}, null);
                    }
                }).catch(err => {console.log(err); /*alert(JSON.stringify(err))*/});
        }).catch(err => {console.log(err); /*alert(JSON.stringify(err))*/});
    }).catch(err => {console.log(err); /*alert(JSON.stringify(err))*/});
}