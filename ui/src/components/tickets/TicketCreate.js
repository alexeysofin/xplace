import React from 'react';

import { Form, Grid, 
         Breadcrumb, Header, Button, Segment } from 'semantic-ui-react';

import { Redirect, Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm, Field} from 'redux-form';

import {getTicketCreateOptions, createTicket} from '../../actions/tickets';
import {FieldContainer} from '../presentational/field';
import {TICKET_CREATE_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => {
    let {profile} = state.profile;
    return {
        ...state.tickets,
        profile: profile || {},
        initialValues: {
            destination_http_port: "80",
            destination_https_port: "443",
        }
   }
}

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getTicketCreateOptions()),
    onSubmit: (data) => dispatch(createTicket(data)),
    onUnload: () => {
        dispatch(TICKET_CREATE_PAGE_UNLOADED())
    }
});


class TicketCreate extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    submitForm = values => {
        return this.props.onSubmit(values);        
    }

    render() {
        let {createOptions, profile} = this.props;
        
        let userOptions = []
        if (createOptions && createOptions.users) {
            userOptions = createOptions.users.map((user) => {
                return { key: user.id, text: user.email, value: user.id };
            });
        }

        let containerOptions = []
        if (createOptions && createOptions.containers) {
            containerOptions = createOptions.containers.map((container) => {
                return { key: container.id, text: container.name, value: container.id };
            });
        }

        let domainOptions = []
        if (createOptions && createOptions.domains) {
            domainOptions = createOptions.domains.map((domain) => {
                return { key: domain.id, text: domain.name, value: domain.id };
            });
        }

        return (
            <div>
            {this.props.ticketCreated && <Redirect to={"/tickets/"+this.props.ticketCreated.id}></Redirect>}
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section as={Link} to="/tickets" link>Tickets</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Create</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Header as='h1'>Create ticket</Header>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Segment>
                        <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                            <Field label="Title" name="title" component={FieldContainer} isInput={true} placeholder='Title' type="text" />
                            <Field label="Description" name="description" component={FieldContainer} isTextArea={true} placeholder='Description' type="text" />
                            <Field label="Container" name="container" component={FieldContainer} options={containerOptions} select={true} placeholder='Container' />                        
                            <Field label="Domain" name="domain" component={FieldContainer} options={domainOptions} select={true} placeholder='Domain' />                        
                            {profile.is_superuser && <Field label="User" name="user" component={FieldContainer} options={userOptions} select={true} placeholder='User' />}
                            {profile.is_superuser && <Field label="Assignee" name="assignee" component={FieldContainer} options={userOptions} select={true} placeholder='Assignee' />}
                            <Button primary type='submit'>Submit</Button>
                        </Form>
                    </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            </div>
        );
    }
}

const connectedForm = reduxForm({
    form: 'ticket-create',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(TicketCreate));
