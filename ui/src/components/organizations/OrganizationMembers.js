import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button, Table, Pagination, Confirm} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {
    getOrganizationUpdateOptions, 
    getOrganizationUserList, 
    deleteOrganizationUser,
    createOrganizationUser } from '../../actions/organizations';
import {ORGANIZATION_USER_LIST_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import {perPage} from '../../constants/pagination';

import OrganizationBase from './OrganizationBase';

const mapStateToProps = state => {
    return {
        ...state.organizations,
    };
};

const mapDispatchToProps = dispatch => ({
    onLoad: (organizationId) => {
        dispatch(getOrganizationUpdateOptions())
        dispatch(getOrganizationUserList(organizationId))
    },
    onSubmit: (organizationId, data) => {
        return dispatch(createOrganizationUser({...data, organization: organizationId})).then(() => {
            dispatch(getOrganizationUserList(organizationId));
        })
    },
    onUnload: () => {
        dispatch(ORGANIZATION_USER_LIST_PAGE_UNLOADED())
    },
    onDeleteConfirm: (organizationId, organizationUserId) => {
        dispatch(deleteOrganizationUser(organizationUserId)).then(() => {
            dispatch(getOrganizationUserList(organizationId));
        })
    }
});


class OrganizationMembers extends React.Component {
    state = {
        deleteConfirmOpen: false
    }

    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    openDeleteConfirm = (deleteOrganizationUserId) => this.setState({ deleteConfirmOpen: true, deleteOrganizationUserId })
    closeDeleteConfirm = () => this.setState({ deleteConfirmOpen: false, deleteOrganizationUserId: undefined })

    onDeleteConfirm = () => {
        let deleteOrganizationUserId = this.state.deleteOrganizationUserId;
        if (deleteOrganizationUserId) {
            this.props.onDeleteConfirm(this.props.match.params.id, deleteOrganizationUserId);
        }
        this.closeDeleteConfirm();
    }

    render() {
        let {organization, updateOptions, organizationUserList, organizationUserListInProgress} = this.props;

        let currentPage = this.props.organizationUserListCurrentPage || 1;
        let totalPages = Math.ceil(((organizationUserList && organizationUserList.count) || 0) / perPage);
        
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
                    <Header as='h2'>Members</Header>

                    <Confirm open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />
                    
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                        <Field label="User" name="user" component={FieldContainer} options={userOptions} select={true} placeholder='User' />                        
                        <Button primary type='submit'>Add</Button>
                    </Form>

                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>User</Table.HeaderCell>
                                <Table.HeaderCell>Created at</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {organizationUserList && organizationUserList.results && organizationUserList.results.length > 0
                             && organizationUserList.results.map(orgUser => {
                                return (
                                    <Table.Row key={orgUser.id}>
                                        <Table.Cell>
                                            {orgUser.user_email}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {orgUser.created_at}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button disabled={this.props.organizationUserDeleteInProgress} compact size="mini" onClick={()=>(this.openDeleteConfirm(orgUser.id))} secondary negative>Delete</Button>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}

                        </Table.Body>

                        <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan='3'>
                            {organizationUserList && organizationUserList.results && organizationUserList.results.length > 0 && 
                                <Pagination disabled={organizationUserListInProgress} size="small" onPageChange={this.onPageChange} 
                                floated='right' defaultActivePage={currentPage} totalPages={totalPages} />}
                            </Table.HeaderCell>
                        </Table.Row>
                        </Table.Footer>
                    </Table>

                </Segment>
                }

            </OrganizationBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'organization-members-create',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(OrganizationMembers));
