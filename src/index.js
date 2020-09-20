import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Router from './Router';
import * as serviceWorker from './serviceWorker';
import configureStore from "./store/configureStore";
import { Provider } from 'react-redux';
import { createBrowserHistory, createHashHistory } from 'history';

const history = createHashHistory();

const store = configureStore(history);

ReactDOM.render(
    <Provider store={ store }>
        <Router history={history} />
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
