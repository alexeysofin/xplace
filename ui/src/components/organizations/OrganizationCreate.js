import React from 'react';

import { Form, Grid, 
         Breadcrumb, Header, Button, Segment } from 'semantic-ui-react';

import { Redirect, Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm, Field} from 'redux-form';

import {getOrganizationCreateOptions, createOrganization} from '../../actions/organizations';
import {FieldContainer} from '../presentational/field';
import {ORGANIZATION_CREATE_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => ({
     ...state.organizations,
});

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getOrganizationCreateOptions()),
    onSubmit: (data) => dispatch(createOrganization(data)),
    onUnload: () => {
        dispatch(ORGANIZATION_CREATE_PAGE_UNLOADED())
    }
});


class OrganizationCreate extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    submitForm = values => {
        return this.props.onSubmit(values);        
    }

    render() {
        let {createOptions} = this.props;
        
        let userOptions = []
        if (createOptions && createOptions.users) {
            userOptions = createOptions.users.map((user) => {
                return { key: user.id, text: user.email, value: user.id };
            });
        }


        return (
            <div>
            {this.props.organizationCreated && <Redirect to={"/organizations/"+this.props.organizationCreated.id}></Redirect>}
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section as={Link} to="/organizations" link>Organizations</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Create</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Header as='h1'>Create organization</Header>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Segment>
                        <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                            <Field label="Name" name="name" component={FieldContainer} isInput={true} placeholder='Name' type="text" />
                            <Field label="Owner" name="owner" component={FieldContainer} options={userOptions} select={true} placeholder='Owner' />                        
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
    form: 'organization-create',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(OrganizationCreate));
