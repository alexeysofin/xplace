import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {updateOrganization, getOrganizationUpdateOptions} from '../../actions/organizations';
import {ORGANIZATION_SETTINGS_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import OrganizationBase from './OrganizationBase';

const mapStateToProps = state => {    
    let organization = state.organizations.organization;

    return {
        ...state.organizations,
        initialValues: {
            name: (organization && organization.name),
            owner: (organization && organization.owner),
        },
    };
};

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getOrganizationUpdateOptions()),
    onSubmit: (organizationId, data) => dispatch(updateOrganization(organizationId, data)),
    onUnload: () => {
        dispatch(ORGANIZATION_SETTINGS_PAGE_UNLOADED())
    }
});


class OrganizationSettings extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    render() {
        let {organization, updateOptions} = this.props;
        
        let userOptions = []
        if (updateOptions && updateOptions.users) {
            userOptions = updateOptions.users.map((user) => {
                return { key: user.id, text: user.email, value: user.id };
            });
        }

        return (
            <OrganizationBase {...this.props}>
                {organization && 
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                    <Field label="Name" name="name" component={FieldContainer} isInput={true} placeholder='Name' type="text" />
                            <Field label="Owner" name="owner" component={FieldContainer} options={userOptions} select={true} placeholder='Owner' />                        
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </OrganizationBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'organization-settings',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(OrganizationSettings));
