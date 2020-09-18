import React from 'react';
import { connect } from 'react-redux';
import PageHeader from '../PageHeader';
import { push } from 'connected-react-router';
import app from "../../firebaseConfig";

class Navigation extends React.Component {
    constructor(props){
        super(props);

        this.logOut = this.logOut.bind(this);
    }

    async logOut(){
        await app
            .auth()
            .signOut()
            .then( result => {
                console.log(result);
                // this.props.dispatch();
                this.props.dispatch(push('/login'))
            })
            .catch(error => {
                console.log(error);
            });

    }

    render(){
        return <PageHeader logOut={this.logOut} />
    }
}

function mapStateToProps(state, ownProps){
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Navigation);
