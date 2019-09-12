import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Button, Confirm} from 'semantic-ui-react';

import {deleteUser} from '../../actions/users';
import {USER_DELETE_PAGE_UNLOADED} from '../../constants/actionTypes';

import UserBase from './UserBase';

const mapStateToProps = state => {    
    return {
        ...state.users
    };
};

const mapDispatchToProps = dispatch => ({
    onDeleteConfirm: (userId) => dispatch(deleteUser(userId)),
    onUnload: () => {
        dispatch(USER_DELETE_PAGE_UNLOADED())
    }
});


class UserDelete extends React.Component {
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
        let user = this.props.user;
        return (
            <UserBase {...this.props}>
            <Confirm confirmButton={<Button negative>Delete</Button>} open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />
            {user && 
                <Segment>
                    <Header as='h2'>Delete user</Header>
                    <Button disabled={this.props.userDeleteInProgress} 
                            loading={this.props.userDeleteInProgress} 
                            onClick={this.openDeleteConfirm} primary type="button" negative>Delete user</Button>
                </Segment>
            }
            </UserBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(UserDelete);
