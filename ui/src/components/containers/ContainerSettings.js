import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {updateContainer, getContainerUpdateOptions} from '../../actions/containers';
import {CONTAINER_SETTINGS_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import ContainerBase from './ContainerBase';

const mapStateToProps = state => {    
    let container = state.containers.container;

    let {profile} = state.profile;

    return {
        ...state.containers,
        profile: (profile || {}),
        initialValues: {
            name: (container && container.name),
            ram: (container && container.ram),
            cpus: (container && container.cpus),
            user: (container && container.user),
        },
    };
};

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getContainerUpdateOptions()),
    onSubmit: (containerId, data) => dispatch(updateContainer(containerId, data)),
    onUnload: () => {
        dispatch(CONTAINER_SETTINGS_PAGE_UNLOADED())
    }
});


class ContainerSettings extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    render() {
        let {container, updateOptions, profile} = this.props;

        if (!updateOptions) {
            updateOptions = {}
        }

        let {users, ram_sizes} = updateOptions;
        
        let ramOptions = []
        if (ram_sizes) {
            ramOptions = ram_sizes.map((ram_size) => {
                return { key: ram_size.size, text: ram_size.size+"MB", value: ram_size.size };
            });
        }

        let userOptions = []
        if (users) {
            userOptions = users.map((user) => {
                return { key: user.id, text: user.email, value: user.id };
            });
        }

        return (
            <ContainerBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {container && 
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                        <Field label="Name (ascii)" name="name" component={FieldContainer} isInput={true} placeholder='Name (ascii)' type="text" />
                        <Field label="RAM" name="ram" component={FieldContainer} options={ramOptions} select={true} placeholder='RAM' />                        
                        {profile.is_superuser && <Field label="CPU" name="cpus" component={FieldContainer} isInput={true} placeholder='CPU' type="text" />}
                        {profile.is_superuser && <Field label="User" name="user" component={FieldContainer} options={userOptions} select={true} placeholder='User' />}
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </ContainerBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'container-settings',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(ContainerSettings));
