import React from 'react';

import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import DashboardOptions from '../dashboard/DashboardOptions';


class DashboardNavigation extends React.Component
{
    constructor(props){
        super(props);

        this.goClients = this.goClients.bind(this);
        this.goContracts = this.goContracts.bind(this);
        this.goPayments = this.goPayments.bind(this);
        this.goMaintenances = this.goMaintenances.bind(this);
    }

    goClients = () => this.props.dispatch(push('/clientes'));
    goContracts = () => this.props.dispatch(push('/contratos'));
    goPayments = () => this.props.dispatch(push('/pagos'));
    goMaintenances = () => this.props.dispatch(push('/mantenimientos'));

    render(){
        return (
            <DashboardOptions
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

export default connect(mapStateToProps)(DashboardNavigation);
