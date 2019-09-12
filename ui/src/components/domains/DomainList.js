import React from 'react';

import { Table, Grid, 
         Breadcrumb, Header, Button, Message, Pagination, Loader } from 'semantic-ui-react';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm} from 'redux-form';

import {getDomainList} from '../../actions/domains';
import {perPage} from '../../constants/pagination';
import {DOMAIN_LIST_PAGE_UNLOADED, PAGE, DOMAIN_LIST} from '../../constants/actionTypes';

const mapStateToProps = state => {
    let {profile} = state.profile;

    return { ...state.domains, profile: (profile || {}) }
};


const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getDomainList()),
    onPageChange: (e, { activePage }) => {
        dispatch(PAGE({activePage, subtype: DOMAIN_LIST}))
        dispatch(getDomainList());
    },
    onUnload: () => {
        dispatch(DOMAIN_LIST_PAGE_UNLOADED())
    }
});


class DomainList extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    render() {
        let {domainListInProgress, domains, profile} = this.props;
        let currentPage = this.props.currentPage || 1;
        let totalPages = Math.ceil(((domains && domains.count) || 0) / perPage);

        return (
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Domains</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                {this.props.domainListDisplayError && 
                    <Grid.Row>
                        <Grid.Column width="16">
                            <Message negative>{this.props.domainListDisplayError.message}</Message>
                        </Grid.Column>
                    </Grid.Row>
                }

                <Grid.Row>
                    <Grid.Column width="12">
                    <Header as='h1'>Domains {domainListInProgress && <Loader inline size="tiny" active />}</Header>
                    </Grid.Column>
                    <Grid.Column width="4">
                        <Button as={Link} to="/domains/create" floated='right' primary>Create</Button>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    {profile.is_superuser && <Table.HeaderCell>User</Table.HeaderCell>}
                                    <Table.HeaderCell>Include sub-domains</Table.HeaderCell>
                                    <Table.HeaderCell>State</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {domains && domains.results && domains.results.length > 0 && domains.results.map(domain => {
                                    return (
                                        <Table.Row key={domain.id}>
                                            <Table.Cell>
                                                <Link to={"/domains/"+domain.id}>{domain.name}</Link>
                                            </Table.Cell>
                                            {profile.is_superuser && <Table.Cell>{domain.user_email}</Table.Cell>}
                                            <Table.Cell>{String(domain.include_sub_domains)}</Table.Cell>
                                            <Table.Cell>{domain.state}</Table.Cell>
                                        </Table.Row>
                                    );
                                })}

                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='7'>
                                {domains && domains.results && domains.results.length > 0 && 
                                <Pagination disabled={domainListInProgress} onPageChange={this.props.onPageChange} 
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
    form: 'domain-list-filter',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(DomainList));
