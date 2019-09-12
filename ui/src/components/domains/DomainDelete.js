import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Button, Confirm} from 'semantic-ui-react';

import {deleteDomain} from '../../actions/domains';
import {DOMAIN_DELETE_PAGE_UNLOADED} from '../../constants/actionTypes';

import DomainBase from './DomainBase';

const mapStateToProps = state => {    
    return {
        ...state.domains
    };
};

const mapDispatchToProps = dispatch => ({
    onDeleteConfirm: (domainId) => dispatch(deleteDomain(domainId)),
    onUnload: () => {
        dispatch(DOMAIN_DELETE_PAGE_UNLOADED())
    }
});


class DomainDelete extends React.Component {
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
        let domain = this.props.domain;
        return (
            <DomainBase {...this.props}>
            <Confirm confirmButton={<Button negative>Delete</Button>} open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />
            {domain && 
                <Segment>
                    <Header as='h2'>Delete domain</Header>
                    <Button disabled={this.props.domainDeleteInProgress} 
                            loading={this.props.domainDeleteInProgress} 
                            onClick={this.openDeleteConfirm} primary type="button" negative>Delete domain</Button>
                </Segment>
            }
            </DomainBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(DomainDelete);
