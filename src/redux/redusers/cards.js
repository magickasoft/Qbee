import constants from '../../constants/redux'

export function initCards(data) {
    return {
        type: constants.INIT_CARDS,
        data: data
    }
}

export function addCard(data) {
    return {
        type: constants.ADD_CARD,
        data: data
    }
}

export function deleteCard(data) {
    return {
        type: constants.DELETE_CARD,
        data: data
    }
}

export function cards(state = {}, action = {}) {
    switch (action.type) {
        case constants.INIT_CARDS:{
            return action.data
        }
        case constants.ADD_CARD:{
            var card = action.data;
            return Object.assign(state, card)
        }
        case constants.DELETE_CARD:{
            var newState = Object.assign({}, state);
            delete newState[action.data];
            return newState
        }
        default:
            return state;
    }
}
