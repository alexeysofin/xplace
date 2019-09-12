import React from 'react';

import { Table, Grid, 
         Breadcrumb, Header, Button, Message, Pagination, Loader } from 'semantic-ui-react';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm} from 'redux-form';

import {getOrganizationList} from '../../actions/organizations';
import {perPage} from '../../constants/pagination';
import {ORGANIZATION_LIST_PAGE_UNLOADED, PAGE, ORGANIZATION_LIST} from '../../constants/actionTypes';

const mapStateToProps = state => ({ ...state.organizations });

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getOrganizationList()),
    onPageChange: (e, { activePage }) => {
        dispatch(PAGE({activePage, subtype: ORGANIZATION_LIST}))
        dispatch(getOrganizationList());
    },
    onUnload: () => {
        dispatch(ORGANIZATION_LIST_PAGE_UNLOADED())
    }
});


class OrganizationList extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    render() {
        let {organizationListInProgress, organizations} = this.props;
        let currentPage = this.props.currentPage || 1;
        let totalPages = Math.ceil(((organizations && organizations.count) || 0) / perPage);

        return (
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Organizations</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                {this.props.organizationListDisplayError && 
                    <Grid.Row>
                        <Grid.Column width="16">
                            <Message negative>{this.props.organizationListDisplayError.message}</Message>
                        </Grid.Column>
                    </Grid.Row>
                }

                <Grid.Row>
                    <Grid.Column width="12">
                    <Header as='h1'>Organizations {organizationListInProgress && <Loader inline size="tiny" active />}</Header>
                    </Grid.Column>
                    <Grid.Column width="4">
                        <Button as={Link} to="/organizations/create" floated='right' primary>Create</Button>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Owner</Table.HeaderCell>
                                    <Table.HeaderCell>Created at</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {organizations && organizations.results && organizations.results.length > 0 && organizations.results.map(organization => {
                                    return (
                                        <Table.Row key={organization.id}>
                                            <Table.Cell>
                                                <Link to={"/organizations/"+organization.id}>{organization.name}</Link>
                                            </Table.Cell>
                                            <Table.Cell>{String(organization.owner_email)}</Table.Cell>
                                            <Table.Cell>{organization.created_at}</Table.Cell>
                                        </Table.Row>
                                    );
                                })}

                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='5'>
                                {organizations && organizations.results && organizations.results.length > 0 && 
                                <Pagination disabled={organizationListInProgress} onPageChange={this.props.onPageChange} 
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
    form: 'organization-list-filter',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(OrganizationList));
