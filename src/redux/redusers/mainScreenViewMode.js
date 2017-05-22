export function setViewMode(data) {
    return {
        type: 'SET_VIEW_MODE',
        data: data
    }
}

export function viewMode(state = 'countries', action = {}) {
    switch (action.type) {
        case 'SET_VIEW_MODE':{
            return action.data
        }
        default:
            return state;
    }
}
