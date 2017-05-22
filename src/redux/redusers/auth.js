export function initAuth(data) {
    return {
        type: "INIT-AUTH-DATA",
        data: data
    }
}

export function auth(state = {initialized: false}, action = {}) {
    switch (action.type) {
        case "INIT-AUTH-DATA":{
            var authData = action.data || {};
            if(authData.initialized === false) {
                return Object.assign(authData);
            }
            return Object.assign(authData, {initialized: true});
        }
        default:
            return state;
    }
}
