import React from 'react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

import { Field, reduxForm } from 'redux-form';

import {Link, Redirect} from 'react-router-dom';

import { connect } from 'react-redux';

import {RESET_CONFIRM_PAGE_UNLOADED} from '../../constants/actionTypes';
import {resetConfirm} from '../../actions/auth';
import {FieldContainer} from '../presentational/field';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    onSubmit: (data) => dispatch(resetConfirm(data)),
    onUnload: () => {
        dispatch(RESET_CONFIRM_PAGE_UNLOADED())
    }
});

class ResetConfirm extends React.Component {
    submitForm = values => {
        const urlParams = new URLSearchParams(window.location.search);
        return this.props.onSubmit({...values, token: urlParams.get('token')});        
    }

    componentWillUnmount() {
        this.props.onUnload();
    }
    
    render() {
        return (
            <div className='login-form'>
                {this.props.resetConfirmOK && <Redirect to="/" />}
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
                    {!this.props.resetConfirmOK && <div>
                        <Header as='h2' color='teal' textAlign='center'>
                        <Image src='https://via.placeholder.com/150' /> Log-in to your account
                        </Header>
                        {/* {this.props.resetConfirmDisplayError && <Message negative><p>{this.props.resetConfirmDisplayError.message}</p></Message>} */}
                        <Form size='large' onSubmit={this.props.handleSubmit(this.submitForm)}>
                        
                        <Segment stacked>
                            <Field name="password" component={FieldContainer} isInput={true} placeholder='Password' type="password" />
                            <Field name="password_repeat" component={FieldContainer} isInput={true} placeholder='Repeat password' type="password" />
                            <Button color='teal' fluid size='large' loading={this.props.resetConfirmInProgress} disabled={this.props.resetConfirmInProgress}>
                            Reset password
                            </Button>
                        </Segment>
                        </Form>
                    </div>}
                    <Message>
                        Already have an acconut? <Link to='/login'>Login</Link>
                    </Message>
                </Grid.Column>
                </Grid>
            </div>
        );
    }
}

const connectedForm = reduxForm({
    form: 'reset-confirm',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(ResetConfirm));