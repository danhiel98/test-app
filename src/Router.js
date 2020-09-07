import { Component } from 'react';
import {
    BrowserRouter as ReactRouter,
    Route
} from 'react-router-dom';

import './App.css';

import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';

export default class Router extends Component 
{
    render()
    {
        return (
            <ReactRouter>
                <App>
                    <Route exact path="/" component={Home} />
                    <Route path={'/login'} component={Login} />
                </App>
            </ReactRouter>
        );
    }
}