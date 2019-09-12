import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import ProfileBase from './ProfileBase';
import {reduxForm, Field} from 'redux-form';

import {FieldContainer} from '../presentational/field';

import {updateProfilePassword} from '../../actions/profile';

const mapStateToProps = state => {
    let root = state.profile;

    return { 
        ...root
    };
}

const mapDispatchToProps = dispatch => ({
    onSubmit: (data) => dispatch(updateProfilePassword(data)),
});


class ProfilePassword extends React.Component {
    submitForm = values => {
        return this.props.onSubmit(values);        
    }

    render() {
        let profile = this.props.profile;

        return (
            <ProfileBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {profile && 
                <Segment>
                    <Header as='h2'>Change password</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)} loading={this.props.profileUpdateInProgress}>
                        <Field label="Current password" name="current_password" isInput={true} component={FieldContainer} placeholder='Current password' type="password" />
                        <Field label="New password" name="password" isInput={true} component={FieldContainer} placeholder='New password' type="password" />
                        <Field label="Confirm new password" name="password_repeat" isInput={true} component={FieldContainer} placeholder='Confirm new password' type="password" />
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </ProfileBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

const connectedForm = reduxForm({
    form: 'profile-password',
    enableReinitialize: true
})


export default connectedRedux(connectedForm(ProfilePassword));
