import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Pagination, Table, Grid, Button, Confirm} from 'semantic-ui-react';

import {CONTAINER_BACKUPS_PAGE_UNLOADED, CONTAINER_BACKUPS, PAGE} from '../../constants/actionTypes';
import {getContainerBackupList, backupContainer, restoreContainer, deleteBackup} from '../../actions/containers';
import {perPage} from '../../constants/pagination';

import ContainerBase from './ContainerBase';

const mapStateToProps = state => ({ ...state.containers });

const mapDispatchToProps = dispatch => ({
    onLoad: (containerId) => dispatch(getContainerBackupList(containerId)),
    onPageChange: (containerId, e, { activePage }) => {
        dispatch(PAGE({activePage, subtype: CONTAINER_BACKUPS}))
        dispatch(getContainerBackupList(containerId));
    },
    onUnload: () => {
        dispatch(CONTAINER_BACKUPS_PAGE_UNLOADED())
    },
    onBackupConfirm: (containerId) => {
        dispatch(backupContainer(containerId));
    },
    onRestoreConfirm: (containerId, backupId) => {
        dispatch(restoreContainer(containerId, backupId));
    },
    onDeleteConfirm: (containerId, backupId) => {
        dispatch(deleteBackup(containerId, backupId));
    },
});

class ContainerBackups extends React.Component {
    state = {
        backupConfirmOpen: false,
        restoreConfirmOpen: false,
        deleteConfirmOpen: false
    }

    openBackupConfirm = () => this.setState({ backupConfirmOpen: true })
    closeBackupConfirm = () => this.setState({ backupConfirmOpen: false })
    
    openRestoreConfirm = (restoreBackupId) => this.setState({ restoreConfirmOpen: true, restoreBackupId })
    closeRestoreConfirm = () => this.setState({ restoreConfirmOpen: false, restoreBackupId: undefined })

    openDeleteConfirm = (deleteBackupId) => this.setState({ deleteConfirmOpen: true, deleteBackupId })
    closeDeleteConfirm = () => this.setState({ deleteConfirmOpen: false, deleteBackupId: undefined })

    onBackupConfirm = () => {
        this.closeBackupConfirm();
        this.props.onBackupConfirm(this.props.match.params.id);
    }

    onRestoreConfirm = () => {
        let backupId = this.state.restoreBackupId;
        if (backupId) {
            this.props.onRestoreConfirm(this.props.match.params.id, backupId);
        }
        this.closeRestoreConfirm();
    }

    onDeleteConfirm = () => {
        let backupId = this.state.deleteBackupId;
        if (backupId) {
            this.props.onDeleteConfirm(this.props.match.params.id, backupId);
        }
        this.closeDeleteConfirm();
    }

    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    onPageChange = (e, { activePage }) => {
        this.props.onPageChange(this.props.match.params.id, e, {activePage})
    }

    render() {
        let {container, backups, containerBackupListInProgress} = this.props;
        let currentPage = this.props.backupsCurrentPage || 1;
        let totalPages = Math.ceil(((backups && backups.count) || 0) / perPage);

        return (
            <ContainerBase {...this.props}>
                {container && 
                    <Segment attached loading={containerBackupListInProgress}>
                        <Confirm open={this.state.backupConfirmOpen} onCancel={this.closeBackupConfirm} onConfirm={this.onBackupConfirm} />
                        <Confirm open={this.state.restoreConfirmOpen} onCancel={this.closeRestoreConfirm} onConfirm={this.onRestoreConfirm} />
                        <Confirm open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />

                        <Grid>
                            <Grid.Row>
                                <Grid.Column width="12">
                                <Header as='h2'>Container backups</Header>
                                </Grid.Column>
                                <Grid.Column width="4">
                                    <Button compact size="small" floated='right' primary onClick={this.openBackupConfirm}>Create</Button>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>

                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Created at</Table.HeaderCell>
                                    <Table.HeaderCell>State</Table.HeaderCell>
                                    <Table.HeaderCell>Actions</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {backups && backups.results && backups.results.length > 0 && backups.results.map(backup => {
                                    return (
                                        <Table.Row key={backup.id}>
                                            <Table.Cell>
                                                {backup.created_at}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {backup.state}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Button disabled={this.props.containerRestoreInProgress} compact size="mini" onClick={()=>(this.openRestoreConfirm(backup.id))} secondary>Restore</Button>
                                                <Button disabled={this.props.containerBackupDeleteInProgress} compact size="mini" onClick={()=>(this.openDeleteConfirm(backup.id))} secondary negative>Delete</Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}

                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='3'>
                                {backups && backups.results && backups.results.length > 0 && 
                                    <Pagination disabled={containerBackupListInProgress} size="small" onPageChange={this.onPageChange} 
                                    floated='right' defaultActivePage={currentPage} totalPages={totalPages} />}
                                </Table.HeaderCell>
                            </Table.Row>
                            </Table.Footer>
                        </Table>
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

export default connectedRedux(ContainerBackups);
