import React from 'react';

import { Grid, 
         Breadcrumb, Header, Loader, Menu } from 'semantic-ui-react';

import { connect } from 'react-redux';

import {NavLink, Link, Redirect} from 'react-router-dom';

import {getTicket} from '../../actions/tickets';
import {TICKET_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => ({ ...state.tickets });

const mapDispatchToProps = dispatch => ({
    onLoad: (ticketId) => dispatch(getTicket(ticketId)),
    onUnload: () => {
        dispatch(TICKET_PAGE_UNLOADED())
    }
});


class TicketBase extends React.Component {
    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    render() {

        let {ticket, ticketDeletedId} = this.props;

        return (
            <Grid stackable>
            {this.props.ticketGetInProgress && <Loader active></Loader>}

            <Grid.Row>
                <Grid.Column width="16">
                    <Breadcrumb size='small'>
                        <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section as={Link} to="/tickets" link>Tickets</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section active>{this.props.match.params.id}</Breadcrumb.Section>
                    </Breadcrumb>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column width="16">
                    <Header as='h1'>Manage ticket</Header>
                </Grid.Column>
            </Grid.Row>


            {ticket && 
                <Grid.Row>
                    {(ticketDeletedId && ticketDeletedId === ticket.id) && <Redirect to="/tickets" />}
                    <Grid.Column width="16">
                            <Grid stackable>
                                <Grid.Column width={4}>
                                    <Menu fluid vertical tabular>
                                        <NavLink exact to={"/tickets/"+ticket.id} className="item">Information</NavLink>
                                        <NavLink to={"/tickets/"+ticket.id+"/settings"} className="item">Settings</NavLink>
                                        <NavLink to={"/tickets/"+ticket.id+"/delete"} className="item">Delete</NavLink>
                                    </Menu>
                                </Grid.Column>

                                <Grid.Column width={12}>
                                    {this.props.children}
                                </Grid.Column>
                            </Grid>
                    </Grid.Column>
                </Grid.Row>
            }
            </Grid>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(TicketBase);
