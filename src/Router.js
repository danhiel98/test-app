import React, { Component } from 'react';
import {
    // BrowserRouter as ReactRouter,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';

import './App.css';

import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './components/clientes/Clientes';
import Contratos from './components/contratos/Contratos';
import Talonario from './components/reportes/Talonario';
// import NotFound from './components/result/NotFound'
import Seed from './seeds/Seed';
import { connect } from 'react-redux';
import app from './firebaseConfig';
import { ConnectedRouter } from 'connected-react-router';
import * as actions from './actions/userActions';

class Router extends Component
{
    constructor(props){
        super(props);

        app.auth().onAuthStateChanged(user => {
            this.props.dispatch(actions.login(user));
        });
    }

    signedIn(){
        return this.props.user.user;
    }

    render()
    {
        return (
            <ConnectedRouter history={ this.props.history }>
                <Switch>
                    <Route exact path="/seed" component={Seed} />
                    <Route exact path="/login" component={Login} />
                    { this.signedIn() ? null : <Redirect to="/login" />}
                    <App>
                        <Route exact path="/" component={Dashboard} />
                        <Route exact path="/clientes" component={Clientes} />
                        <Route exact path="/contratos" component={Contratos} />
                        <Route exact path="/talonario/:contrato" component={Talonario} />
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
