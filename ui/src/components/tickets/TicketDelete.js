import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Button, Confirm} from 'semantic-ui-react';

import {deleteTicket} from '../../actions/tickets';
import {TICKET_DELETE_PAGE_UNLOADED} from '../../constants/actionTypes';

import TicketBase from './TicketBase';

const mapStateToProps = state => {    
    return {
        ...state.tickets
    };
};

const mapDispatchToProps = dispatch => ({
    onDeleteConfirm: (ticketId) => dispatch(deleteTicket(ticketId)),
    onUnload: () => {
        dispatch(TICKET_DELETE_PAGE_UNLOADED())
    }
});


class TicketDelete extends React.Component {
    state = {
        deleteConfirmOpen: false
    }

    closeDeleteConfirm = () => {this.setState({deleteConfirmOpen: false})}
    openDeleteConfirm = () => {this.setState({deleteConfirmOpen: true})}

    onDeleteConfirm = () => {
        this.props.onDeleteConfirm(this.props.match.params.id);
        this.closeDeleteConfirm();
    }

    render() {
        let ticket = this.props.ticket;
        return (
            <TicketBase {...this.props}>
            <Confirm confirmButton={<Button negative>Delete</Button>} open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />
            {ticket && 
                <Segment>
                    <Header as='h2'>Delete ticket</Header>
                    <Button disabled={this.props.ticketDeleteInProgress} 
                            loading={this.props.ticketDeleteInProgress} 
                            onClick={this.openDeleteConfirm} primary type="button" negative>Delete ticket</Button>
                </Segment>
            }
            </TicketBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(TicketDelete);
