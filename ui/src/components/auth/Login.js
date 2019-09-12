import React from 'react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

import { Field, reduxForm } from 'redux-form';

import {Redirect, Link} from 'react-router-dom';

import { connect } from 'react-redux';

import {LOGIN_PAGE_UNLOADED} from '../../constants/actionTypes';
import {login} from '../../actions/auth';
import {FieldContainer} from '../presentational/field';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    onSubmit: (data) => dispatch(login(data)),
    onUnload: () =>
        dispatch(LOGIN_PAGE_UNLOADED())
});

class Login extends React.Component {
    submitForm = values => {
        return this.props.onSubmit(values);        
    }

    componentWillUnmount() {
        this.props.onUnload();
    }
    
    render() {
        return (
            <div className='login-form'>
                {this.props.loginOk && <Redirect to="/" />}
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
                    <Header as='h2' color='teal' textAlign='center' className="phantasm">
                        xplace
                    </Header>                    
                    <Header as='h2' color='teal' textAlign='center'>
                     Log-in to your account
                    </Header>
                    {/* {this.props.loginDisplayError && <Message negative><p>{this.props.loginDisplayError.message}</p></Message>} */}
                    <Form size='large' onSubmit={this.props.handleSubmit(this.submitForm)}>
                    
                    <Segment stacked>
                        <Field name="email" component={FieldContainer} isInput={true} type="text" placeholder='E-mail address' />
                        <Field name="password" component={FieldContainer} isInput={true} type="password" placeholder='Password' />
                        <Button color='teal' fluid size='large' loading={this.props.loginInProgress} disabled={this.props.loginInProgress}>
                        Login
                        </Button>
                    </Segment>
                    </Form>
                    <Message>
                    New to us? <Link to='/register'>Register a new account</Link>
                    </Message>
                    <Message>
                    Forgot your password? <Link to='/reset'>Reset it</Link>
                    </Message>
                </Grid.Column>
                </Grid>
            </div>
        );
    }
}

const connectedForm = reduxForm({
    form: 'login',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(Login));