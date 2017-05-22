import { createStore } from 'redux'
import rootReducer from '../redusers/index.js'

export default function (initialState){
    const store = createStore(rootReducer, initialState);
    return store;
}