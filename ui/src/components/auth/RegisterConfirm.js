import React from 'react';

import { Grid, Message, Loader } from 'semantic-ui-react'

import {Redirect} from 'react-router-dom';

import { connect } from 'react-redux';

import {REGISTER_CONFIRM_PAGE_UNLOADED} from '../../constants/actionTypes';

import {registerConfirm} from '../../actions/auth';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    onLoad: (data) => dispatch(registerConfirm(data)),
    onUnload: () => {
        dispatch(REGISTER_CONFIRM_PAGE_UNLOADED())
    }
});

class RegisterConfirm extends React.Component {
    componentWillUnmount() {
        this.props.onUnload();
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(this.props.location.search);
        this.props.onLoad({'token': urlParams.get('token')});
    }
    
    render() {
        return (
            <div className='login-form'>
                {this.props.registerConfirmOK && <Redirect to="/" />}
                {/*
                Heads up! The styles below are necessary for the correct render of this example.
                You can do same with CSS, the main idea is that all the elements up to the `Grid`
                below must have a height of 100%.
                */}
                <style>{`
                body > div,
                body > div > div,
                body > div > div > div.login-form {
                    height: 100%;
                }
                `}</style>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 450 }}>
                    {this.props.registerConfirmInProgress && <Loader size="large" active inline />}
                    {/* {this.props.registerConfirmDisplayError && 
                        <Message negative>
                        <p>{this.props.registerConfirmDisplayError.message}</p></Message>
                    } */}
                </Grid.Column>
                </Grid>
            </div>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(RegisterConfirm);