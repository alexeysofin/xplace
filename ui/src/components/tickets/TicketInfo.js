import React from 'react';

import { connect } from 'react-redux';

import {Header, Grid, Segment, Button, Confirm, Form, Pagination} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {FieldContainer} from '../../components/presentational/field';
import {TICKET_COMMENT_LIST, PAGE} from '../../constants/actionTypes';
import {perPage} from '../../constants/pagination';
import {getTicketCommentList, deleteTicketComment, createTicketComment} from '../../actions/tickets';

import TicketBase from './TicketBase';

const mapStateToProps = state => {
    let {profile} = state.profile;

    return { ...state.tickets, profile: profile || {} }
};

const mapDispatchToProps = dispatch => ({
    getTicketCommentList: (ticketId) => dispatch(getTicketCommentList(ticketId)),
    onLoad: (ticketId) => dispatch(getTicketCommentList(ticketId)),
    onSubmit: (data) => dispatch(createTicketComment(data)),
    onPageChange: (ticketId, e, { activePage }) => {
        dispatch(PAGE({activePage, subtype: TICKET_COMMENT_LIST}))
        dispatch(getTicketCommentList(ticketId));
    },
    onDeleteConfirm: (commentId) => dispatch(deleteTicketComment(commentId))
});

class TicketInfo extends React.Component {
    state = {
        deleteConfirmOpen: false
    }

    closeDeleteConfirm = () => {this.setState({deleteConfirmOpen: false, commentId: undefined})}
    openDeleteConfirm = (commentId) => {
        this.setState({deleteConfirmOpen: true, commentId})
    }

    onDeleteConfirm = () => {
        let {commentId} = this.state;
        if (commentId) {
            this.props.onDeleteConfirm(commentId).then(() => {
                this.props.getTicketCommentList(this.props.match.params.id);
            })
        }
        this.closeDeleteConfirm();
    }


    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    submitForm = (values) => {
        let data = {
            ticket: this.props.match.params.id,
            ...values
        }
        return this.props.onSubmit(data).then(() => {
            this.props.getTicketCommentList(this.props.match.params.id);
        }) 
    }

    onPageChange = (e, { activePage }) => {
        this.props.onPageChange(this.props.match.params.id, e, {activePage})
    }

    render() {
        let {ticket, ticketCommentList, ticketCommentListInProgress, profile} = this.props;
        let currentPage = this.props.ticketCommentListCurrentPage || 1;
        let totalPages = Math.ceil(((ticketCommentList && ticketCommentList.count) || 0) / perPage);

        return (
            <TicketBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {ticket && 
                <div>
                
                <Confirm confirmButton={<Button negative>Delete</Button>} open={this.state.deleteConfirmOpen} onCancel={this.closeDeleteConfirm} onConfirm={this.onDeleteConfirm} />
                
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={5}>
                                <Header className="definition" as='h4'>Title</Header>
                                <p>{ticket.title}</p>
                                <Header className="definition" as='h4'>Created at</Header>
                                <p>{String(ticket.created_at)}</p>
                                <Header className="definition" as='h4'>Code</Header>
                                <p>{String(ticket.code)}</p>
                                <Header className="definition" as='h4'>Status</Header>
                                <p>{String(ticket.status)}</p>
                            </Grid.Column>
                            <Grid.Column width={5}>
                                {profile.is_superuser && <Header className="definition" as='h4'>User</Header>}
                                {profile.is_superuser && <p>{ticket.user_email}</p>}
                                <Header className="definition" as='h4'>Assignee</Header>
                                <p>{ticket.assignee_email}</p>
                            </Grid.Column>
                            <Grid.Column width={5}>
                                <Header className="definition" as='h4'>Container</Header>
                                <p>{ticket.container_name}</p>
                                <Header className="definition" as='h4'>Domain</Header>
                                <p>{ticket.domain_name}</p>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width="16">
                                <Header className="definition" as='h4'>Description</Header>
                                <p>{ticket.description}</p>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>

                <Segment loading={ticketCommentListInProgress}>
                    <Header as='h2'>Comments</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                        <Field label="Message" name="message" component={FieldContainer} isTextArea={true} placeholder='Message' type="text" />
                        <Button primary type='submit'>Comment</Button>
                    </Form>
                    
                    {ticketCommentList && ticketCommentList.results && ticketCommentList.results.length > 0 && ticketCommentList.results.map((comment) => {
                        return (
                            <Segment key={comment.id} basic>
                                <Header as='h4'>{comment.user_email} - {comment.created_at}</Header>
                                <p>{comment.message}</p>
                                {comment.is_author && 
                                    <p>
                                        {/* <Button compact size="mini" secondary>Edit</Button> */}
                                        <Button onClick={() => {this.openDeleteConfirm(comment.id)}} compact size="mini" secondary negative>Delete</Button>
                                    </p>                                
                                }

                            </Segment>
                        );
                    })}
                </Segment>

                
                    {ticketCommentList && ticketCommentList.results && ticketCommentList.results.length > 0 && 
                    <Segment attached clearing>
                        <Pagination disabled={ticketCommentListInProgress} onPageChange={this.onPageChange} 
                        floated='right' defaultActivePage={currentPage} totalPages={totalPages} />
                    </Segment>
                    }

                </div>
                }

            </TicketBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'ticket-comment-create',
    enableReinitialize: true
})


const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(TicketInfo));
