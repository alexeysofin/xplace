import React from 'react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

import { Field, reduxForm } from 'redux-form';

import {Link} from 'react-router-dom';

import { connect } from 'react-redux';

import {REGISTER_PAGE_UNLOADED} from '../../constants/actionTypes';
import {register} from '../../actions/auth';
import {FieldContainer} from '../presentational/field';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    onSubmit: (data) => dispatch(register(data)),
    onUnload: () => {
        dispatch(REGISTER_PAGE_UNLOADED())
    }
});

const languageOptions = [
    { key: 'en', text: 'English', value: 'en' },
    { key: 'ru', text: 'Русский', value: 'ru' },
];

class Register extends React.Component {
    submitForm = values => {
        return this.props.onSubmit(values);        
    }

    componentWillUnmount() {
        this.props.onUnload();
    }
    
    render() {
        return (
            <div className='login-form'>
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
                    {this.props.registerOK && 
                        <Message positive>
                            <Message.Header>Your are one step from success!</Message.Header>
                            <p>
                            We have emailed you registration confirmation.
                            </p>
                        </Message>
                    }
                    {!this.props.registerOK && <div>
                        <Header as='h2' color='teal' textAlign='center' className="phantasm">
                            xplace
                        </Header>
                        <Header as='h2' color='teal' textAlign='center'>
                        Register your account
                        </Header>
                        {/* {this.props.registerDisplayError && <Message negative><p>{this.props.registerDisplayError.message}</p></Message>} */}
                        <Form size='large' onSubmit={this.props.handleSubmit(this.submitForm)}>
                        
                        <Segment stacked>
                            <Field name="email" component={FieldContainer} isInput={true} placeholder='E-mail address' type="text" />
                            <Field name="language" component={FieldContainer} options={languageOptions} select={true} placeholder='Language' />
                            <Field name="password" component={FieldContainer} isInput={true} placeholder='Password' type="password" />
                            <Field name="password_repeat" component={FieldContainer} isInput={true} type="password" placeholder='Repeat password' />
                            <Button color='teal' fluid size='large' loading={this.props.registerInProgress} disabled={this.props.registerInProgress}>
                            Register
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
    form: 'register',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(Register));