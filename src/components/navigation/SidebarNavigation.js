import React, { Component } from 'react';
import { connect } from 'react-redux';
import Sidebar from '../Sidebar';
import { push } from 'connected-react-router';

class SidebarNavigation extends Component
{

    constructor(props){
        super(props);

        this.goHome = this.goHome.bind(this);
        this.goNewPayment = this.goNewPayment.bind(this);
        this.goClients = this.goClients.bind(this);
        this.goContracts = this.goContracts.bind(this);
        this.goPayments = this.goPayments.bind(this);
        this.goMaintenances = this.goMaintenances.bind(this);
    }

    goHome = () => this.props.dispatch(push('/'));
    goNewPayment = () => this.props.dispatch(push('/new-payment'));
    goClients = () => this.props.dispatch(push('/clientes'));
    goContracts = () => this.props.dispatch(push('/contratos'));
    goPayments = () => this.props.dispatch(push('/pagos'));
    goMaintenances = () => this.props.dispatch(push('/mantenimientos'));

    render() {
        return (
            <Sidebar
                goHome={this.goHome}
                goNewPayment={this.goNewPayment}
                goClients={this.goClients}
                goContracts={this.goContracts}
                goPayments={this.goPayments}
                goMaintenances={this.goMaintenances}
            />
        );
    }
}

function mapStateToProps(state, ownProps){
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(SidebarNavigation);
