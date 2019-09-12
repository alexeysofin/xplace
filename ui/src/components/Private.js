import React from 'react';

import { connect } from 'react-redux';
import {Redirect} from 'react-router-dom';

import {Loader} from 'semantic-ui-react';

import {PROFILE} from '../constants/actionTypes';
import {getProfile} from '../actions/profile';
import {PRIVATE_PAGE_UNLOADED} from '../constants/actionTypes';

const mapStateToProps = state => ({ ...state.profile });

const mapDispatchToProps = dispatch => ({
    onLoad: (token) => dispatch(getProfile(token)),
    onUnload: () => dispatch(PRIVATE_PAGE_UNLOADED()),
    onMissingToken: () => dispatch(PROFILE({profileDisplayError: new Error('No token supplied')})),
});

class Private extends React.Component {
    componentWillUnmount() {
        this.props.onUnload();
    }
    componentWillMount() {
        let token = localStorage.getItem('token');
        if (!token) {
            this.props.onMissingToken();
        } else {
            this.props.onLoad(token);
        }
    }
    render() {
        let {profileInProgress, profile, children, logoutOk, profileDisplayError} = this.props;

        return (
            <div>
            {profileInProgress && <Loader active inline />}
            {(logoutOk || profileDisplayError) && <Redirect to="/login" />}
            {typeof profileInProgress != 'undefined' && !profileInProgress && profile && !profileDisplayError && children}
            </div>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps,
    mapDispatchToProps
)

export default connectedRedux(Private);