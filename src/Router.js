import React, { Component } from 'react';
import {
    // BrowserRouter as ReactRouter,
    HashRouter,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';

import './App.css';

import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { connect } from 'react-redux';
import app from './firebaseConfig';
import { ConnectedRouter } from 'connected-react-router';

class Router extends Component
{
    constructor(props){
        super(props);

        // console.log("El usuario activo es: ");
        app.auth().onAuthStateChanged(function(user) {
            // console.log(user);
        });
    }

    signedIn(){
        return this.props.user;
    }

    render()
    {
        return (
            <ConnectedRouter history={ this.props.history }>
                <Switch>
                    <Route exact path="/login" component={Login} />
                    { this.signedIn() ? null : <Redirect to="/login" />}
                    <App>
                        <Route exact path="/" component={Dashboard} />
                    </App>
                </Switch>
            </ConnectedRouter>
        );
    }
}

function mapStateToProps(state, ownState){
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Router);
