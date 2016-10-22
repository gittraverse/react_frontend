import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import Home from './home';
import configureStore from './store';
import DevTools from './dev-tools';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        <Route path="/*" component={Home} />
      </Router>
    </div>
  </Provider>,
document.getElementById('container'));

      // <DevTools />
