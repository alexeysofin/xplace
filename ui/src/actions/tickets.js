import React from 'react';

import {serializeQueryParams} from '../Utils';

import {toast} from 'react-semantic-toasts';

import {api, delay} from '../actions';

import {
    ASYNC_START,
    TICKET_LIST,
    TICKET_CREATE_OPTIONS,
    TICKET_CREATE, 
    TICKET,
    TICKET_DELETE,
    TICKET_SETTINGS,
    TICKET_UPDATE_OPTIONS,
    TICKET_COMMENT_LIST,
    TICKET_COMMENT_DELETE,
    TICKET_COMMENT_CREATE
} from '../constants/actionTypes';

export const getTicketList = () => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: TICKET_LIST}));
  
      let state = getState();
      let token = state.auth.token;
      let tickets = state.tickets;
      let currentPage = (tickets.currentPage || 1);
      let params = serializeQueryParams({'page': currentPage});
  
      return api(
        {
          url: 'api/v1.0/tickets/?'+params, 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      ).then((data)=>{
          dispatch(TICKET_LIST({data}));
      }).catch(ticketListDisplayError => {
        dispatch(TICKET_LIST({ticketListDisplayError}));
      });
    }
  }


  export const getTicketCreateOptions = () => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: TICKET_CREATE_OPTIONS}));
  
      let state = getState();
      let token = state.auth.token;
      
      let {profile} = state.profile;
  
      let containers = api(
        {
          url: 'api/v1.0/containers/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      );
  
      let domains = api(
        {
          url: 'api/v1.0/domains/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      );

      let users = [];
      if (profile.is_superuser) {
        users = api(
          {
            url: 'api/v1.0/users/', 
            method: "GET", 
            headers: {
              'Authorization': 'Bearer '+token
            },
            form: false,
          }
        );
      }
  
      return Promise.all([containers, domains, users]).then((objects) => {
        let [containers, domains, users] = objects;
        
        dispatch(TICKET_CREATE_OPTIONS({
          data: {
            containers: containers.results,
            users: users.results,
            domains: domains.results
          }
        }))
  
      }).catch(ticketCreateOptionsDisplayError => {
          dispatch(TICKET_CREATE_OPTIONS({ticketCreateOptionsDisplayError}));
      });
  
    }
  }
  
  
  export const getTicketUpdateOptions = () => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: TICKET_UPDATE_OPTIONS}));
  
      let state = getState();
      let token = state.auth.token;

      let {profile} = state.profile;

      let containers = api(
        {
          url: 'api/v1.0/containers/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      );
  
      let domains = api(
        {
          url: 'api/v1.0/domains/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      );

      let users = [];

      if (profile.is_superuser) {
        users = api(
          {
            url: 'api/v1.0/users/', 
            method: "GET", 
            headers: {
              'Authorization': 'Bearer '+token
            },
            form: false,
          }
        );
      }
  
      return Promise.all([containers, domains, users]).then((objects) => {
        let [containers, domains, users] = objects;
        
        dispatch(TICKET_UPDATE_OPTIONS({
          data: {
            users: users.results,
            containers: containers.results,
            domains: domains.results,
          }
        }))
  
      }).catch(ticketUpdateOptionsDisplayError => {
          dispatch(TICKET_UPDATE_OPTIONS({ticketUpdateOptionsDisplayError}));
      });
  
    }
  }

export const createTicket = (data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: TICKET_CREATE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/tickets/', 
        method: "POST", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(TICKET_CREATE({data, ticketCreateOk: true}));
        toast(
          {
              title: 'Ticket has been created.',
              time: 10000
          },
          () => console.log('toast closed'),
          () => console.log('toast clicked')
        );
    }).catch(ticketCreateDisplayError => {
      dispatch(TICKET_CREATE({ticketCreateDisplayError}));
      throw ticketCreateDisplayError;
    });
  }
}


export const getTicket = (ticketId) => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: TICKET}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/tickets/'+ticketId+'/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(TICKET({data}));
        return data

    }).catch(ticketDisplayError => {
      dispatch(TICKET({ticketDisplayError}));
    });
  }
}


export const updateTicket = (ticketId, data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: TICKET_SETTINGS}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/tickets/'+ticketId+'/', 
        method: "PUT", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(TICKET_SETTINGS({data}));
        toast(
            {
                title: 'Ticket has been updated!',
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );
    }).catch(ticketSettingsDisplayError => {
      dispatch(TICKET_SETTINGS({ticketSettingsDisplayError}));
      throw ticketSettingsDisplayError;
    });
  }
}


export const deleteTicket = (ticketId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: TICKET_DELETE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/tickets/'+ticketId+'/', 
        method: "DELETE",
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false
      }
    ).then(()=>{
      dispatch(TICKET_DELETE({ticketDeletedId: ticketId}));
      toast(
        {
            title: 'Ticket has been deleted!',
            time: 10000,
        },
        () => console.log('toast closed'),
        () => console.log('toast clicked')
    );
    }).catch(ticketDeleteDisplayError => {
      dispatch(TICKET_DELETE({ticketDeleteDisplayError}));
    })
  }
}


export const getTicketCommentList = (ticketId) => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: TICKET_COMMENT_LIST}));

    let state = getState();
    let token = state.auth.token;
    let tickets = state.tickets;
    let currentPage = (tickets.ticketCommentListCurrentPage || 1);
    let params = serializeQueryParams({'page': currentPage, 'ticket': ticketId});

    return api(
      {
        url: 'api/v1.0/ticket-comments/?'+params, 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(TICKET_COMMENT_LIST({data}));
    }).catch(ticketCommentListDisplayError => {
      dispatch(TICKET_COMMENT_LIST({ticketCommentListDisplayError}));
    });

  }
}


export const deleteTicketComment = (commentId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: TICKET_COMMENT_DELETE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/ticket-comments/'+commentId+'/', 
        method: "DELETE",
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false
      }
    ).then(()=>{
      dispatch(TICKET_COMMENT_DELETE({ticketCommentDeletedId: commentId}));
    }).catch(ticketCommentDeleteDisplayError => {
      dispatch(TICKET_COMMENT_DELETE({ticketCommentDeleteDisplayError}));
    })
  }
}


export const createTicketComment = (data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: TICKET_COMMENT_CREATE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/ticket-comments/', 
        method: "POST", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(TICKET_COMMENT_CREATE({data}));
        toast(
          {
              title: 'Ticket comment has been created.',
          },
          () => console.log('toast closed'),
          () => console.log('toast clicked')
        );
    }).catch(ticketCommentCreateDisplayError => {
      dispatch(TICKET_COMMENT_CREATE({ticketCommentCreateDisplayError}));
      throw ticketCommentCreateDisplayError;
    });
  }
}
