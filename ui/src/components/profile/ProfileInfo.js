import React from 'react';

import { connect } from 'react-redux';

import {Header, Grid, Segment, Form, Button, Progress} from 'semantic-ui-react';

import ProfileBase from './ProfileBase';
import {reduxForm, Field} from 'redux-form';

import {FieldContainer} from '../presentational/field';

import {languageOptions} from '../../constants/options';

import {updateProfile} from '../../actions/profile';

const mapStateToProps = state => {
    let root = state.profile;

    let {profile} = root;

    return { 
        ...root,
        initialValues: {
            first_name: (profile && profile.first_name),
            last_name: (profile && profile.last_name),
            language: (profile && profile.language),
        }
    };
}

const mapDispatchToProps = dispatch => ({
    onSubmit: (data) => dispatch(updateProfile(data)),
});


class ProfileInfo extends React.Component {
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
                    <Header as='h2'>Information</Header>
                    <Grid>
                        <Grid.Column width={8}>
                            <Header className="definition" as='h4'>Email</Header>
                            <p>{profile.email}</p>
                            <Header className="definition" as='h4'>Date joined</Header>
                            <p>{profile.date_joined}</p>
                            <Header className="definition" as='h4'>Last login</Header>
                            <p>{profile.last_login}</p>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Header className="definition" as='h4'>Full name</Header>
                            <p>{profile.first_name} {profile.last_name}</p>
                        </Grid.Column>
                    </Grid>
                    
                    <Header as='h2'>Available resources</Header>
                    <Header as='h3'>Disk size</Header>
                    <Progress color="blue" size="small" percent={
                        (profile.available_disk_size > 0 && Math.min(Math.ceil(profile.used_disk_size / profile.available_disk_size * 100)), 100) || 0
                    }>Used: {profile.used_disk_size}GB, Free: {profile.available_disk_size}GB</Progress>
                    <Header as='h3'>RAM</Header>
                    <Progress color="blue" size="small" percent={
                        (profile.available_ram > 0 && Math.min(Math.ceil(profile.used_ram / profile.available_ram * 100)), 100) || 0}>Used: {profile.used_ram}MB, Free: {profile.available_ram}MB</Progress>

                    <Header as='h2'>Update personal information</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)} loading={this.props.profileUpdateInProgress}>
                        <Field label="First name" name="first_name" component={FieldContainer} isInput={true} placeholder='First name' type="text" />
                        <Field label="Last name" name="last_name" component={FieldContainer} isInput={true} placeholder='Last name' type="text" />
                        <Field label="Language" name="language" component={FieldContainer} options={languageOptions} select={true} placeholder='Language' />                        
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
    form: 'profile',
    enableReinitialize: true
})


export default connectedRedux(connectedForm(ProfileInfo));
