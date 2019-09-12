import React from 'react';

import { Table, Grid, 
         Breadcrumb, Header, Button, Message, Pagination, Loader } from 'semantic-ui-react';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm} from 'redux-form';

import {getTicketList} from '../../actions/tickets';
import {perPage} from '../../constants/pagination';
import {TICKET_LIST_PAGE_UNLOADED, PAGE, TICKET_LIST} from '../../constants/actionTypes';

const mapStateToProps = state => {
    let {profile} = state.profile;

    return { ...state.tickets, profile: profile || {} }
};

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getTicketList()),
    onPageChange: (e, { activePage }) => {
        dispatch(PAGE({activePage, subtype: TICKET_LIST}))
        dispatch(getTicketList());
    },
    onUnload: () => {
        dispatch(TICKET_LIST_PAGE_UNLOADED())
    }
});


class TicketList extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    render() {
        let {ticketListInProgress, tickets, profile} = this.props;
        let currentPage = this.props.currentPage || 1;
        let totalPages = Math.ceil(((tickets && tickets.count) || 0) / perPage);

        return (
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Tickets</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                {this.props.ticketListDisplayError && 
                    <Grid.Row>
                        <Grid.Column width="16">
                            <Message negative>{this.props.ticketListDisplayError.message}</Message>
                        </Grid.Column>
                    </Grid.Row>
                }

                <Grid.Row>
                    <Grid.Column width="12">
                    <Header as='h1'>Tickets {ticketListInProgress && <Loader inline size="tiny" active />}</Header>
                    </Grid.Column>
                    <Grid.Column width="4">
                        <Button as={Link} to="/tickets/create" floated='right' primary>Create</Button>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Code</Table.HeaderCell>
                                    <Table.HeaderCell>Title</Table.HeaderCell>
                                    {profile.is_superuser && <Table.HeaderCell>User</Table.HeaderCell>}
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {tickets && tickets.results && tickets.results.length > 0 && tickets.results.map(ticket => {
                                    return (
                                        <Table.Row key={ticket.id}>
                                            <Table.Cell>
                                                <Link to={"/tickets/"+ticket.id}>{ticket.code}</Link>
                                            </Table.Cell>
                                            <Table.Cell>{ticket.title}</Table.Cell>
                                            {profile.is_superuser && <Table.Cell>{ticket.user_email}</Table.Cell>}
                                            <Table.Cell>{String(ticket.status)}</Table.Cell>
                                        </Table.Row>
                                    );
                                })}

                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='4'>
                                {tickets && tickets.results && tickets.results.length > 0 && 
                                <Pagination disabled={ticketListInProgress} onPageChange={this.props.onPageChange} 
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
    form: 'ticket-list-filter',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(TicketList));
