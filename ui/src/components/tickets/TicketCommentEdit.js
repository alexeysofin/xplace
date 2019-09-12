import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {updateTicket} from '../../actions/tickets';
import {TICKET_SETTINGS_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import TicketBase from './TicketBase';

const mapStateToProps = state => {    
    let ticketComment = state.tickets.ticketComment;

    return {
        ...state.tickets,
        initialValues: {
            message: (ticketComment && ticketComment.message),
        },
    };
};

const mapDispatchToProps = dispatch => ({
    onSubmit: (ticketId, data) => dispatch(updateTicket(ticketId, data)),
    onUnload: () => {
        dispatch(TICKET_SETTINGS_PAGE_UNLOADED())
    }
});


class TicketSettings extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    render() {
        let ticket = this.props.ticket;

        let {updateOptions} = this.props;
        
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
                        <Field label="User" name="user" component={FieldContainer} options={userOptions} select={true} placeholder='User' />                        
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
