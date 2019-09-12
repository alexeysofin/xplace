import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Button} from 'semantic-ui-react';

import {resetContainerPassword} from '../../actions/containers';
import {CONTAINER_PASSWORD_PAGE_UNLOADED} from '../../constants/actionTypes';

import ContainerBase from './ContainerBase';

const mapStateToProps = state => {    
    return {
        ...state.containers
    };
};

const mapDispatchToProps = dispatch => ({
    onResetPasswordClick: (containerId) => dispatch(resetContainerPassword(containerId)),
    onUnload: () => {
        dispatch(CONTAINER_PASSWORD_PAGE_UNLOADED())
    }
});


class ContainerPassword extends React.Component {
    onResetPasswordClick = () => {
        return this.props.onResetPasswordClick(this.props.match.params.id);        
    }

    render() {
        let container = this.props.container;
        return (
            <ContainerBase {...this.props}>
            {container && 
                <Segment>
                    <Header as='h2'>Reset container password</Header>
                    <Button disabled={this.props.containerPasswordInProgress} 
                            loading={this.props.containerPasswordInProgress} 
                            onClick={this.onResetPasswordClick} primary type="button">Reset password</Button>
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

export default connectedRedux(ContainerPassword);
