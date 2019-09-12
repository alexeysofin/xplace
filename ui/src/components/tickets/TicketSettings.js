import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {updateTicket, getTicketUpdateOptions} from '../../actions/tickets';
import {TICKET_SETTINGS_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import TicketBase from './TicketBase';

const mapStateToProps = state => {    
    let ticket = state.tickets.ticket;

    let {profile} = state.profile;

    return {
        ...state.tickets,
        profile: profile || {},
        initialValues: {
            title: (ticket && ticket.title),
            user: (ticket && ticket.user),
            container: (ticket && ticket.container),
            domain: (ticket && ticket.domain),
            description: (ticket && ticket.description),
            assignee: (ticket && ticket.assignee),
            status: (ticket && ticket.status),
        },
    };
};

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getTicketUpdateOptions()),
    onSubmit: (ticketId, data) => dispatch(updateTicket(ticketId, data)),
    onUnload: () => {
        dispatch(TICKET_SETTINGS_PAGE_UNLOADED())
    }
});


const statusOptions = [
    {key: 'OPEN', value: 'OPEN', text: 'OPEN'},
    {key: 'CLOSED', value: 'CLOSED', text: 'CLOSED'}
]

class TicketSettings extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    render() {
        let {ticket, updateOptions, profile} = this.props;
        
        let userOptions = []
        if (updateOptions && updateOptions.users) {
            userOptions = updateOptions.users.map((user) => {
                return { key: user.id, text: user.email, value: user.id };
            });
        }

        let containerOptions = []
        if (updateOptions && updateOptions.containers) {
            containerOptions = updateOptions.containers.map((container) => {
                return { key: container.id, text: container.name, value: container.id };
            });
        }

        let domainOptions = []
        if (updateOptions && updateOptions.domains) {
            domainOptions = updateOptions.domains.map((domain) => {
                return { key: domain.id, text: domain.name, value: domain.id };
            });
        }

        return (
            <TicketBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {ticket && 
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                    <Field label="Title" name="title" component={FieldContainer} isInput={true} placeholder='Title' type="text" />
                        <Field label="Description" name="description" component={FieldContainer} isTextArea={true} placeholder='Description' type="text" />
                        <Field label="Container" name="container" component={FieldContainer} options={containerOptions} select={true} placeholder='Container' />                        
                        <Field label="Domain" name="domain" component={FieldContainer} options={domainOptions} select={true} placeholder='Domain' />                        
                        {profile.is_superuser && <Field label="Status" name="status" component={FieldContainer} options={statusOptions} select={true} placeholder='Status' />}
                        {profile.is_superuser && <Field label="User" name="user" component={FieldContainer} options={userOptions} select={true} placeholder='User' />}
                        {profile.is_superuser && <Field label="Assignee" name="assignee" component={FieldContainer} options={userOptions} select={true} placeholder='Assignee' />}
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </TicketBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'ticket-settings',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(TicketSettings));
