import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Button, Confirm} from 'semantic-ui-react';

import {deleteContainer} from '../../actions/containers';
import {CONTAINER_DELETE_PAGE_UNLOADED} from '../../constants/actionTypes';

import ContainerBase from './ContainerBase';

const mapStateToProps = state => {    
    return {
        ...state.containers
    };
};

const mapDispatchToProps = dispatch => ({
    onDeleteConfirm: (containerId) => dispatch(deleteContainer(containerId)),
    onUnload: () => {
        dispatch(CONTAINER_DELETE_PAGE_UNLOADED())
    }
});


class ContainerDelete extends React.Component {
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
        let container = this.props.container;
        return (
            <ContainerBase {...this.props}>
            <Confirm confirmButton={<Button negative>Delete</Button>} open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />
            {container && 
                <Segment>
                    <Header as='h2'>Delete container</Header>
                    <Button disabled={this.props.containerDeleteInProgress} 
                            loading={this.props.containerDeleteInProgress} 
                            onClick={this.openDeleteConfirm} primary type="button" negative>Delete container</Button>
                </Segment>
            }
            </ContainerBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(ContainerDelete);
