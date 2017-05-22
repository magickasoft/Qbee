export function setExposedCountryPoint(data) {
    return {
        type: 'SET_EXPOSED_COUNTRY_POINT',
        data: data
    }
}

export function exposedCountryPoint(exposedCountryPoint = {lat: 0, lng: 0}, action = {}) {
    switch (action.type) {
        case 'SET_EXPOSED_COUNTRY_POINT':{
            return action.data
        }
        default:
            return exposedCountryPoint;
    }
}
