'use strict';
import React, {
    AppRegistry,
    Component,
} from 'react-native';

import { Provider } from 'react-redux'
import App from './src/components/App'
import configureStore from './src/redux/store/configureStore'

var store = configureStore();
class qbee extends Component {

  render() {
    return (
        <Provider store={store}>
            <App/>
        </Provider>
    );
  }
}


AppRegistry.registerComponent('qbee', () => qbee);
