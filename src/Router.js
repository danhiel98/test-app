import React, { Component } from 'react';
import {
    // BrowserRouter as ReactRouter,
    HashRouter,
    Route
} from 'react-router-dom';

import './App.css';

import App from './App';
// import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default class Router extends Component
{
    render()
    {
        return (
            <HashRouter basename="/">
                <App>
                    <Route exact path="/" component={Dashboard} />
                    <Route path={'/login'} component={Login} />
                </App>
            </HashRouter>
        );
    }
}
