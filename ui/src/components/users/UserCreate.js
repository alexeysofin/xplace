import React from 'react';

import { Form, Grid, 
         Breadcrumb, Header, Button, Segment } from 'semantic-ui-react';

import { Redirect, Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm, Field} from 'redux-form';

import {createUser} from '../../actions/users';
import {FieldContainer} from '../presentational/field';
import {USER_CREATE_PAGE_UNLOADED} from '../../constants/actionTypes';
import {languageOptions} from '../../constants/options';

const mapStateToProps = state => ({
     ...state.users,
     initialValues: {
         destination_http_port: "80",
         destination_https_port: "443",
     }
});

const mapDispatchToProps = dispatch => ({
    onSubmit: (data) => dispatch(createUser(data)),
    onUnload: () => {
        dispatch(USER_CREATE_PAGE_UNLOADED())
    }
});


class UserCreate extends React.Component {
    submitForm = values => {
        return this.props.onSubmit(values);        
    }

    render() {
        return (
            <div>
            {this.props.userCreated && <Redirect to={"/users/"+this.props.userCreated.id}></Redirect>}
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section as={Link} to="/users" link>Users</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Create</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Header as='h1'>Create user</Header>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Segment>
                        <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                            <Field label="Email" name="email" component={FieldContainer} isInput={true} placeholder='Email' type="text" />
                            <Field label="Language" name="language" component={FieldContainer} select={true} options={languageOptions} placeholder='Language' />
                            <Field label="First name" name="first_name" component={FieldContainer} isInput={true} placeholder='First name' type="text" />
                            <Field label="Last name" name="last_name" component={FieldContainer} isInput={true} placeholder='Last name' type="text" />
                            <Field label="Is superuser" name="is_superuser" component={FieldContainer} isCheckbox={true} placeholder='Is superuser' type="text" />
                            <Field label="Staff status" name="is_staff" component={FieldContainer} isCheckbox={true} placeholder='Staff status' type="text" />
                            <Field label="Available RAM (MB)" name="available_ram" component={FieldContainer} isInput={true} placeholder='Available RAM (MB)' type="text" />
                            <Field label="Available disk size (GB)" name="available_disk_size" component={FieldContainer} isInput={true} placeholder='Available disk size (GB)' type="text" />
                            <Button primary type='submit'>Submit</Button>
                        </Form>
                    </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            </div>
        );
    }
}

const connectedForm = reduxForm({
    form: 'user-create',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(UserCreate));
