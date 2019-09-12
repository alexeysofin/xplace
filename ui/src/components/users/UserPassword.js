import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {changeUserPassword} from '../../actions/users';
import {USER_PASSWORD_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import UserBase from './UserBase';

const mapStateToProps = state => {    
    return {
        ...state.users,
    };
};

const mapDispatchToProps = dispatch => ({
    onSubmit: (userId, data) => dispatch(changeUserPassword(userId, data)),
    onUnload: () => {
        dispatch(USER_PASSWORD_PAGE_UNLOADED())
    }
});


class UserPassword extends React.Component {
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values).then(() => {
            this.props.reset();
        })
    }

    render() {
        let user = this.props.user;

        return (
            <UserBase {...this.props}>
                {user && 
                <Segment>
                    <Header as='h2'>Change password</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                        <Field label="Password" name="password" component={FieldContainer} isInput={true} type='password' placeholder='Password' />
                        <Field label="Confirm password" name="password_repeat" component={FieldContainer} isInput={true} type='password' placeholder='Confirm password' />
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </UserBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'user-password',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(UserPassword));
