import React from 'react';

import { Table, Grid, 
         Breadcrumb, Header, Button, Message, Pagination, Loader } from 'semantic-ui-react';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm} from 'redux-form';

import {getContainerList} from '../../actions/containers';
import {perPage} from '../../constants/pagination';
import {CONTAINER_LIST_PAGE_UNLOADED, PAGE, CONTAINER_LIST} from '../../constants/actionTypes';

const mapStateToProps = state => {
    let {profile} = state.profile;

    return { ...state.containers, profile: (profile || {}) }
};

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getContainerList()),
    onPageChange: (e, { activePage }) => {
        dispatch(PAGE({activePage, subtype: CONTAINER_LIST}))
        dispatch(getContainerList());
    },
    onUnload: () => {
        dispatch(CONTAINER_LIST_PAGE_UNLOADED())
    }
});


class ContainerList extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    render() {
        let {containerListInProgress, containers, profile} = this.props;
        let currentPage = this.props.currentPage || 1;
        let totalPages = Math.ceil(((containers && containers.count) || 0) / perPage);

        return (
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Containers</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                {this.props.containerListDisplayError && 
                    <Grid.Row>
                        <Grid.Column width="16">
                            <Message negative>{this.props.containerListDisplayError.message}</Message>
                        </Grid.Column>
                    </Grid.Row>
                }

                <Grid.Row>
                    <Grid.Column width="12">
                    <Header as='h1'>Containers {containerListInProgress && <Loader inline size="tiny" active />}</Header>
                    </Grid.Column>
                    <Grid.Column width="4">
                        <Button as={Link} to="/containers/create" floated='right' primary>Create</Button>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Hostname</Table.HeaderCell>
                                    <Table.HeaderCell>RAM</Table.HeaderCell>
                                    <Table.HeaderCell>Disk size</Table.HeaderCell>
                                    <Table.HeaderCell>CPU count</Table.HeaderCell>
                                    {profile.is_superuser && <Table.HeaderCell>User</Table.HeaderCell>}
                                    <Table.HeaderCell>Private IP</Table.HeaderCell>
                                    <Table.HeaderCell>State</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {containers && containers.results && containers.results.length > 0 && containers.results.map(container => {
                                    return (
                                        <Table.Row key={container.id}>
                                            <Table.Cell>
                                                <Link to={"/containers/"+container.id}>{container.name}</Link>
                                            </Table.Cell>
                                            <Table.Cell>{container.hostname}</Table.Cell>
                                            <Table.Cell>{container.ram}MB</Table.Cell>
                                            <Table.Cell>{container.disk_size}GB</Table.Cell>
                                            <Table.Cell>{container.num_cpus}</Table.Cell>
                                            {profile.is_superuser && <Table.Cell>{container.user_email}</Table.Cell>}
                                            <Table.Cell>{container.private_ipv4}</Table.Cell>
                                            <Table.Cell>{container.state}</Table.Cell>
                                        </Table.Row>
                                    );
                                })}

                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='8'>
                                {containers && containers.results && containers.results.length > 0 && 
                                <Pagination disabled={containerListInProgress} onPageChange={this.props.onPageChange} 
                                floated='right' defaultActivePage={currentPage} totalPages={totalPages} />}
                                </Table.HeaderCell>
                            </Table.Row>
                            </Table.Footer>
                        </Table>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

const connectedForm = reduxForm({
    form: 'container-list-filter',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(ContainerList));
