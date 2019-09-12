import React from 'react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

import { Field, reduxForm } from 'redux-form';

import {Link} from 'react-router-dom';

import { connect } from 'react-redux';

import {RESET_PAGE_UNLOADED} from '../../constants/actionTypes';
import {reset} from '../../actions/auth';
import {FieldContainer} from '../presentational/field';

import {languageOptions} from '../../constants/options';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    onSubmit: (data) => dispatch(reset(data)),
    onUnload: () => {
        dispatch(RESET_PAGE_UNLOADED())
    }
});

class Reset extends React.Component {
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
                    {this.props.resetOK && 
                        <Message positive>
                            <Message.Header>Your are one step from success!</Message.Header>
                            <p>
                            We have emailed you password reset confirmation.
                            </p>
                        </Message>
                    }
                    {!this.props.resetOK && <div>
                        <Header as='h2' color='teal' textAlign='center' className="phantasm">
                            xplace
                        </Header>
                        <Header as='h2' color='teal' textAlign='center'>
                        Reset your password
                        </Header>
                        {/* {this.props.resetDisplayError && <Message negative><p>{this.props.resetDisplayError.message}</p></Message>} */}
                        <Form size='large' onSubmit={this.props.handleSubmit(this.submitForm)}>
                        
                        <Segment stacked>
                            <Field name="email" component={FieldContainer} isInput={true} placeholder='E-mail address' type="text" />
                            <Field name="language" component={FieldContainer} options={languageOptions} select={true} placeholder='Language' />
                            <Button color='teal' fluid size='large' loading={this.props.resetInProgress} disabled={this.props.resetInProgress}>
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
    form: 'reset',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(Reset));