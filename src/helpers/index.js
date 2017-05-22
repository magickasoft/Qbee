export default function makeContryPoint(lat, lng) {
    var countryLat =  '' + lat;
    var countryLng = '' + lng;
    countryLat = countryLat.replace('.', ',');
    countryLng = countryLng.replace('.', ',');
    return countryLat + '_' + countryLng;
}