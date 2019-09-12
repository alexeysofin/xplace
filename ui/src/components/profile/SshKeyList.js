import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Table, Pagination, Form, Button, Confirm} from 'semantic-ui-react';

import ProfileBase from './ProfileBase';

import {Link} from 'react-router-dom';

import {reduxForm, Field} from 'redux-form';

import {FieldContainer} from '../../components/presentational/field';

import {getSshKeyList, createSshKey, deleteSshKey} from '../../actions/ssh_keys';
import {perPage} from '../../constants/pagination';
import {SSH_KEY_LIST_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => {
    return { 
        ...state.profile,
        ...state.sshKeys,
    };
}

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getSshKeyList()),
    onUnload: () => dispatch(SSH_KEY_LIST_PAGE_UNLOADED()),
    onSubmit: (data) => dispatch(createSshKey(data)),
    onDeleteConfirm: (sshKeyId) => dispatch(deleteSshKey(sshKeyId)),
});


class SshKeyList extends React.Component {
    state = {
        deleteConfirmOpen: false
    }
    openDeleteConfirm = (deleteSshKeyId) => this.setState({ deleteConfirmOpen: true, deleteSshKeyId })
    closeDeleteConfirm = () => this.setState({ deleteConfirmOpen: false, deleteSshKeyId: undefined })

    onDeleteConfirm = () => {
        let sshKeyId = this.state.deleteSshKeyId;
        if (sshKeyId) {
            this.props.onDeleteConfirm(sshKeyId);
        }
        this.closeDeleteConfirm();
    }

    componentDidMount() {
        this.props.onLoad();
    }
    
    submitForm = (values) => {
        return this.props.onSubmit(values).then(()=>{
            this.props.reset()
        });
    }

    render() {
        let {profile, sshKeys, sshKeyListInProgress} = this.props;
        let currentPage = this.props.sshKeyListCurrentPage || 1;
        let totalPages = Math.ceil(((sshKeys && sshKeys.count) || 0) / perPage);

        return (
            <ProfileBase {...this.props}>
                <Confirm open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />
                
                {profile && 
                <Segment>
                    <Header as='h2'>Add SSH key</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)} loading={this.props.sshKeyCreateInProgress}>
                        <Field label="Name" name="name" component={FieldContainer} isInput={true} placeholder='Name' type="text" />
                        <Field label="Public key" name="public_key" isTextArea={true} component={FieldContainer} placeholder='Public key' />
                        <Button primary type='submit'>Add</Button>
                    </Form>
                    <Header as='h2'>Current SSH keys</Header>
                    <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>MD5 fingerprint</Table.HeaderCell>
                                    <Table.HeaderCell>Created at</Table.HeaderCell>
                                    <Table.HeaderCell>Actions</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {sshKeys && sshKeys.results && sshKeys.results.length > 0 && sshKeys.results.map(sshKey => {
                                    return (
                                        <Table.Row key={sshKey.id}>
                                            <Table.Cell>
                                                <Link to={"/profile/ssh-keys/"+sshKey.id}>{sshKey.name}</Link>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {sshKey.hash_md5}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {sshKey.created_at}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Button disabled={this.props.sshKeyDeleteInProgress} compact size="mini" onClick={()=>(this.openDeleteConfirm(sshKey.id))} secondary negative>Delete</Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}

                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='4'>
                                {sshKeys && sshKeys.results > 0 && 
                                    <Pagination disabled={sshKeyListInProgress} size="small" onPageChange={this.onPageChange} 
                                    floated='right' defaultActivePage={currentPage} totalPages={totalPages} />}
                                </Table.HeaderCell>
                            </Table.Row>
                            </Table.Footer>
                        </Table>
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
    form: 'ssh-key-add',
    enableReinitialize: true
})

export default connectedRedux(connectedForm(SshKeyList));
