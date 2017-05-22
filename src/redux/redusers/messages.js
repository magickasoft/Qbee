import constants from '../../constants/redux'

export function initChat(data) {
    return {
        type: constants.INIT_CHAT,
        data: data
    }
}

export function addMessage(data) {
    return {
        type: constants.ADD_MESSAGE,
        data: data
    }
}
export function clearChat(data) {
    return {
        type: constants.CLEAR_CHAT,
        data: data
    }
}

export function chats(state = {}, action = {}) {
    switch (action.type) {
        case constants.INIT_CHAT:{
            var chat = {};
            chat[action.data.cardKey] = action.data.messages;
            return Object.assign(state, chat);
        }
        case constants.CLEAR_CHAT:{
            var newState = Object.assign({}, state);
            delete newState[action.data];
            return newState;
        }
        case constants.ADD_MESSAGE:{
            var message = action.data.message;
            var cardKey = action.data.cardKey;
            newState = Object.assign({}, state);
            if(newState[cardKey]){
                newState[cardKey].messages.push(message)
            } else {
                newState[cardKey] = {};
                newState[cardKey].messages = [message];
            }
            newState[cardKey].initialized = true;
            newState[cardKey].messages.sort((a, b) => {
                if (a.sentAt > b.sentAt) {
                    return -1;
                }
                if (a.sentAt < b.sentAt) {
                    return 1;
                }
                return 0;
            });
            return newState;
        }
        default:
            return state;
    }
}
