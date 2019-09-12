import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import ProfileBase from './ProfileBase';

import {reduxForm, Field} from 'redux-form';

import {FieldContainer} from '../../components/presentational/field';

import {getSshKey, updateSshKey} from '../../actions/ssh_keys';
import {SSH_KEY_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => {
    let {sshKeys, profile} = state;

    let {sshKey} = sshKeys;

    return { 
        ...profile,
        ...sshKeys,
        initialValues: {
            name: (sshKey && sshKey.name),
            public_key: (sshKey && sshKey.public_key),
        }
    };
}

const mapDispatchToProps = dispatch => ({
    onLoad: (sshKeyId) => dispatch(getSshKey(sshKeyId)),
    onUnload: () => dispatch(SSH_KEY_PAGE_UNLOADED()),
    onSubmit: (sshKeyId, data) => dispatch(updateSshKey(sshKeyId, data)),
});


class SshKeyUpdate extends React.Component {
    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }
    
    submitForm = (values) => {
        return this.props.onSubmit(this.props.match.params.id, values);
    }

    render() {
        let {profile, sshKeyUpdateInProgress, sshKeyInProgress} = this.props;

        return (
            <ProfileBase {...this.props}>                
                {profile && 
                <Segment>
                    <Header as='h2'>Update SSH key</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)} loading={sshKeyUpdateInProgress || sshKeyInProgress}>
                        <Field label="Name" name="name" component={FieldContainer} isInput={true} placeholder='Name' type="text" />
                        <Field label="Public key" name="public_key" isTextArea={true} component={FieldContainer} placeholder='Public key' />
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </ProfileBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

const connectedForm = reduxForm({
    form: 'ssh-key-update',
    enableReinitialize: true
})

export default connectedRedux(connectedForm(SshKeyUpdate));
