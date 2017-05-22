import { combineReducers } from 'redux'
import { auth } from './auth'
import { cards } from './cards'
import { chats } from './messages'
import { countries } from './countries'
import { viewMode } from './mainScreenViewMode'
import { exposedCountryPoint } from './mainScreenExposedCountryPoint'

const rootReducer = combineReducers({
    auth,
    cards,
    countries,
    viewMode,
    exposedCountryPoint,
    chats
});

export default rootReducer
