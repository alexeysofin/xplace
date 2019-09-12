import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Button, Confirm} from 'semantic-ui-react';

import {deleteOrganization} from '../../actions/organizations';
import {ORGANIZATION_DELETE_PAGE_UNLOADED} from '../../constants/actionTypes';

import OrganizationBase from './OrganizationBase';

const mapStateToProps = state => {    
    return {
        ...state.organizations
    };
};

const mapDispatchToProps = dispatch => ({
    onDeleteConfirm: (organizationId) => dispatch(deleteOrganization(organizationId)),
    onUnload: () => {
        dispatch(ORGANIZATION_DELETE_PAGE_UNLOADED())
    }
});


class OrganizationDelete extends React.Component {
    state = {
        deleteConfirmOpen: false
    }

    closeDeleteConfirm = () => {this.setState({deleteConfirmOpen: false})}
    openDeleteConfirm = () => {this.setState({deleteConfirmOpen: true})}

    onDeleteConfirm = () => {
        this.props.onDeleteConfirm(this.props.match.params.id);
        this.closeDeleteConfirm();
    }

    render() {
        let organization = this.props.organization;
        return (
            <OrganizationBase {...this.props}>
            <Confirm confirmButton={<Button negative>Delete</Button>} open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />
            {organization && 
                <Segment>
                    <Header as='h2'>Delete organization</Header>
                    <Button disabled={this.props.organizationDeleteInProgress} 
                            loading={this.props.organizationDeleteInProgress} 
                            onClick={this.openDeleteConfirm} primary type="button" negative>Delete organization</Button>
                </Segment>
            }
            </OrganizationBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(OrganizationDelete);
