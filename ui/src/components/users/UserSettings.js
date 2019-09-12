import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {updateUser} from '../../actions/users';
import {USER_SETTINGS_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import {languageOptions} from '../../constants/options';

import UserBase from './UserBase';

const mapStateToProps = state => {    
    let user = state.users.user;

    return {
        ...state.users,
        initialValues: {
            is_superuser: (user && user.is_superuser),
            is_staff: (user && user.is_staff),
            first_name: (user && user.first_name),
            last_name: (user && user.last_name),
            language: (user && user.language),
            available_ram: (user && user.available_ram),
            available_disk_size: (user && user.available_disk_size),
        },
    };
};

const mapDispatchToProps = dispatch => ({
    onSubmit: (userId, data) => dispatch(updateUser(userId, data)),
    onUnload: () => {
        dispatch(USER_SETTINGS_PAGE_UNLOADED())
    }
});


class UserSettings extends React.Component {
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    render() {
        let user = this.props.user;

        return (
            <UserBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {user && 
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                        <Field label="Language" name="language" component={FieldContainer} select={true} options={languageOptions} placeholder='Language' />
                        <Field label="First name" name="first_name" component={FieldContainer} isInput={true} placeholder='First name' type="text" />
                        <Field label="Last name" name="last_name" component={FieldContainer} isInput={true} placeholder='Last name' type="text" />
                        <Field label="Is superuser" name="is_superuser" component={FieldContainer} isCheckbox={true} placeholder='Is superuser' type="text" />
                        <Field label="Staff status" name="is_staff" component={FieldContainer} isCheckbox={true} placeholder='Staff status' type="text" />
                        <Field label="Available RAM (MB)" name="available_ram" component={FieldContainer} isInput={true} placeholder='Available RAM (MB)' type="text" />
                        <Field label="Available disk size (GB)" name="available_disk_size" component={FieldContainer} isInput={true} placeholder='Available disk size (GB)' type="text" />
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </UserBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'user-settings',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(UserSettings));
