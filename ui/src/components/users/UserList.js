import React from 'react';

import { Table, Grid, 
         Breadcrumb, Header, Button, Message, Pagination, Loader } from 'semantic-ui-react';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm} from 'redux-form';

import {getUserList} from '../../actions/users';
import {perPage} from '../../constants/pagination';
import {USER_LIST_PAGE_UNLOADED, PAGE, USER_LIST} from '../../constants/actionTypes';

const mapStateToProps = state => ({ ...state.users });

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getUserList()),
    onPageChange: (e, { activePage }) => {
        dispatch(PAGE({activePage, subtype: USER_LIST}))
        dispatch(getUserList());
    },
    onUnload: () => {
        dispatch(USER_LIST_PAGE_UNLOADED())
    }
});


class UserList extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    render() {
        let {userListInProgress, users} = this.props;
        let currentPage = this.props.currentPage || 1;
        let totalPages = Math.ceil(((users && users.count) || 0) / perPage);

        return (
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Users</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                {this.props.userListDisplayError && 
                    <Grid.Row>
                        <Grid.Column width="16">
                            <Message negative>{this.props.userListDisplayError.message}</Message>
                        </Grid.Column>
                    </Grid.Row>
                }

                <Grid.Row>
                    <Grid.Column width="12">
                    <Header as='h1'>Users {userListInProgress && <Loader inline size="tiny" active />}</Header>
                    </Grid.Column>
                    <Grid.Column width="4">
                        <Button as={Link} to="/users/create" floated='right' primary>Create</Button>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Email</Table.HeaderCell>
                                    <Table.HeaderCell>Is superuser</Table.HeaderCell>
                                    <Table.HeaderCell>Last login</Table.HeaderCell>
                                    <Table.HeaderCell>RAM</Table.HeaderCell>
                                    <Table.HeaderCell>Disk size</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {users && users.results && users.results.length > 0 && users.results.map(user => {
                                    return (
                                        <Table.Row key={user.id}>
                                            <Table.Cell>
                                                <Link to={"/users/"+user.id}>{user.email}</Link>
                                            </Table.Cell>
                                            <Table.Cell>{String(user.is_superuser)}</Table.Cell>
                                            <Table.Cell>{user.last_login}</Table.Cell>
                                            <Table.Cell>{user.available_ram}</Table.Cell>
                                            <Table.Cell>{user.available_disk_size}</Table.Cell>
                                        </Table.Row>
                                    );
                                })}

                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='5'>
                                {users && users.results && users.results.length > 0 && 
                                <Pagination disabled={userListInProgress} onPageChange={this.props.onPageChange} 
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
    form: 'user-list-filter',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(UserList));
