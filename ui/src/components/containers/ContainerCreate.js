import React from 'react';

import { Form, Grid, 
         Breadcrumb, Header, Button, Segment } from 'semantic-ui-react';

import { Redirect, Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm, Field} from 'redux-form';

import {getContainerCreateOptions, createContainer} from '../../actions/containers';
import {FieldContainer} from '../presentational/field';
import {CONTAINER_CREATE_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => {
    let {profile} = state.profile;

    return { ...state.containers, profile: (profile || {}) }
};

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getContainerCreateOptions()),
    onSubmit: (data) => dispatch(createContainer(data)),
    onUnload: () => {
        dispatch(CONTAINER_CREATE_PAGE_UNLOADED())
    }
});


class ContainerCreate extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    submitForm = values => {
        return this.props.onSubmit(values);        
    }

    render() {
        let {createOptions, profile} = this.props;

        if (!createOptions) {
            createOptions = {}
        }

        let {images, hosts, users, ram_sizes, disk_sizes, ssh_keys} = createOptions;
        
        let imageOptions = []
        if (images) {
            imageOptions = images.map((img) => {
                return { key: img.id, text: img.name, value: img.id };
            });
        }

        let hostOptions = []
        if (hosts) {
            hostOptions = hosts.map((host) => {
                return { key: host.id, text: host.hostname, value: host.id };
            });
        }

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

        let diskOptions = []
        if (disk_sizes) {
            diskOptions = disk_sizes.map((disk) => {
                return { key: disk.size, text: disk.size+"GB", value: disk.size };
            });
        }

        let sshKeysOptions = []
        if (ssh_keys) {
            sshKeysOptions = ssh_keys.map((ssh_key) => {
                return { key: ssh_key.id, text: ssh_key.name, value: ssh_key.id };
            });
        }

        return (
            <div>
            {this.props.containerCreated && <Redirect to={"/containers/"+this.props.containerCreated.id}></Redirect>}
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section as={Link} to="/containers" link>Containers</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Create</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Header as='h1'>Create container</Header>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Segment>
                        <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                            <Field label="Name (ascii)" name="name" component={FieldContainer} isInput={true} placeholder='Name (ascii)' type="text" />
                            <Field label="Image" name="image" component={FieldContainer} options={imageOptions} select={true} placeholder='Image' />
                            {profile.is_superuser && <Field label="Host" name="host" component={FieldContainer} options={hostOptions} select={true} placeholder='Host' />}
                            {profile.is_superuser && <Field label="CPU" name="cpus" component={FieldContainer} isInput={true} placeholder='CPU' type="text" />}
                            <Field label="RAM" name="ram" component={FieldContainer} options={ramOptions} select={true} placeholder='RAM' />                        
                            <Field label="Disk" name="disk_size" component={FieldContainer} options={diskOptions} select={true} placeholder='Disk' />                        
                            {profile.is_superuser && <Field label="User" name="user" component={FieldContainer} options={userOptions} select={true} placeholder='User' />}
                            <Field label="SSH keys" name="ssh_keys" component={FieldContainer} multiple options={sshKeysOptions} select={true} placeholder='SSH keys' />                        
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
    form: 'container-create',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(ContainerCreate));
