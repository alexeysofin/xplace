import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {changeContainerState} from '../../actions/containers';
import {CONTAINER_STATE_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import ContainerBase from './ContainerBase';

const STATIC_STATES = ['STOPPED', 'RUNNING'];

const POWER_ACTIONS = [
    {'key': 'start', 'value': 'START', 'text': 'Start'},
    {'key': 'stop', 'value': 'STOP', 'text': 'Stop'},
    {'key': 'reboot', 'value': 'REBOOT', 'text': 'Reboot'},
]

const mapStateToProps = state => {    
    let container = state.containers.container;
    let power_action = undefined;

    if (container) {
        if (container.state === 'RUNNING') {
            power_action = 'STOP';
        } else if (container.state === 'STOPPED') {
            power_action = 'START';
        }
    }

    return {
        ...state.containers,
        initialValues: {
            action: power_action,
        },
    };
};

const mapDispatchToProps = dispatch => ({
    onSubmit: (containerId, data) => dispatch(changeContainerState(containerId, data)),
    onUnload: () => {
        dispatch(CONTAINER_STATE_PAGE_UNLOADED())
    }
});


class ContainerState extends React.Component {
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    render() {
        let {container, containerStateInProgress} = this.props;
        
        let loading = false;

        if (container) {
            loading = containerStateInProgress || !STATIC_STATES.includes(container.state);
        }

        return (
            <ContainerBase {...this.props}>
                {container && 
                <Segment>
                    <Header as='h2'>State</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                        <Field disabled={loading} label="Power action" name="action" component={FieldContainer} options={POWER_ACTIONS} select={true} placeholder='Choose power action' />                        
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </ContainerBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'container-state',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(ContainerState));
