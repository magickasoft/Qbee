export function addCountry(data) {
    return {
        type: "ADD-COUNTRY",
        data: data
    }
}

export function deleteCountry(data) {
    return {
        type: "DELETE-COUNTRY",
        data: data
    }
}

export function countries(state = [], action = {}) {
    switch (action.type) {
        case "ADD-COUNTRY":{
            var newState = state.slice();
            var updated = false;
            newState.forEach((country, i) => {
                if(country.key == action.data.key) {
                    newState[i] = action.data;
                    updated = true;
                }
            });
            if(!updated)
            newState.push(action.data);
            return newState;
        }
        case "DELETE-COUNTRY":{
            newState = state.slice();
            newState.forEach((country, i) => {
                if(country.key === action.data) newState.splice(i, 1);
            });
            return newState;
        }
        default:
            return state;
    }
}