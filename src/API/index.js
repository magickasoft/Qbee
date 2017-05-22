import paypal from '../constants/paypalBackend'

class API {

    request(url, body) {
        return new Promise((resolve, reject) => {
            fetch(`${paypal.host}${url}`, {
                method: 'post',
                headers: {
                    "Content-type": "application/json"
                },
                body: body ? JSON.stringify(body) : ""
            })
                .then(result => {
                    result = JSON.parse(result._bodyText);
                    resolve(result);
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    setUpPayment(email, price){
        return new Promise((resolve, reject) => {
            this.request('/setup-payment', {email, price})
                .then(result => resolve(result))
                .catch(err => reject(err))
        })
    }

    checkStatus(payKey){
        return new Promise((resolve, reject) => {
            this.request('/check-status', {payKey})
                .then(result => resolve(result))
                .catch(err => reject(err))
        })
    }

    completePayment(payKey){
        return new Promise((resolve, reject) => {
            this.request('/complete-payment', {payKey})
                .then(result => resolve(result))
                .catch(err => reject(err))
        })
    }

    getCountryCoordinate(country){
        return new Promise((resolve, reject) => {
            fetch(`http://www.mapquestapi.com/geocoding/v1/address?key=YUlG5mAqr0zOSYp5dFade3sc53BPKEcN&location=${country}`)
                .then(result => resolve(JSON.parse(result._bodyText).results[0].locations[0].latLng))
                .catch(err => reject(err));
        })
    }

    getCoordinateCountry(lat, lng){
        return new Promise((resolve, reject) => {
            fetch(`http://www.mapquestapi.com/geocoding/v1/reverse?key=YUlG5mAqr0zOSYp5dFade3sc53BPKEcN&location=${lat},${lng}`)
                .then(result => resolve(JSON.parse(result._bodyText).results[0].locations[0].adminArea1))
                .catch(err => reject(err));
        })

    }

}
export default new API()