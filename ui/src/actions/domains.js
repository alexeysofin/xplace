import React from 'react';

import {serializeQueryParams} from '../Utils';

import {toast} from 'react-semantic-toasts';

import {api} from '../actions';

import {
    ASYNC_START,
    DOMAIN_LIST,
    DOMAIN_CREATE_OPTIONS,
    DOMAIN_CREATE, 
    DOMAIN,
    DOMAIN_EVENT,
    DOMAIN_DELETE,
    DOMAIN_SETTINGS,
    DOMAIN_UPDATE_OPTIONS
} from '../constants/actionTypes';

export const getDomainList = () => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: DOMAIN_LIST}));
  
      let state = getState();
      let token = state.auth.token;
      let domains = state.domains;
      let currentPage = (domains.currentPage || 1);
      let params = serializeQueryParams({'page': currentPage});
  
      return api(
        {
          url: 'api/v1.0/domains/?'+params, 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      ).then((data)=>{
          dispatch(DOMAIN_LIST({data}));
      }).catch(domainListDisplayError => {
        dispatch(DOMAIN_LIST({domainListDisplayError}));
      });
    }
  }


  export const getDomainCreateOptions = () => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: DOMAIN_CREATE_OPTIONS}));
  
      let state = getState();
      let token = state.auth.token;
      
      let {profile} = state.profile;
      
      profile = profile || {};

      let reverse_proxies = [];
      if (profile.is_superuser) {
        reverse_proxies = api(
          {
            url: 'api/v1.0/reverse-proxies/', 
            method: "GET", 
            headers: {
              'Authorization': 'Bearer '+token
            },
            form: false,
          }
        );  
      }
      
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
  
      return Promise.all([reverse_proxies, users]).then((objects) => {
        let [reverse_proxies, users] = objects;
        
        dispatch(DOMAIN_CREATE_OPTIONS({
          data: {
            reverse_proxies: reverse_proxies.results,
            users: users.results,
          }
        }))
  
      }).catch(domainCreateOptionsDisplayError => {
          dispatch(DOMAIN_CREATE_OPTIONS({domainCreateOptionsDisplayError}));
      });
  
    }
  }
  
  
  export const getDomainUpdateOptions = () => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: DOMAIN_UPDATE_OPTIONS}));
  
      let state = getState();
      let token = state.auth.token;

      let {profile} = state.profile;

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
  
      return Promise.all([users]).then((objects) => {
        let [users] = objects;
        
        dispatch(DOMAIN_UPDATE_OPTIONS({
          data: {
            users: users.results,
          }
        }))
  
      }).catch(domainUpdateOptionsDisplayError => {
          dispatch(DOMAIN_UPDATE_OPTIONS({domainUpdateOptionsDisplayError}));
      });
  
    }
  }

  export const createDomain = (data) => {
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: DOMAIN_CREATE}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/domains/', 
          method: "POST", 
          body: data,
          headers: {
            'Authorization': 'Bearer '+token
          },
        }
      ).then((data)=>{
          dispatch(DOMAIN_CREATE({data, domainCreateOk: true}));
          toast(
            {
                title: 'Domain is being created.',
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
          );
      }).catch(domainCreateDisplayError => {
        dispatch(DOMAIN_CREATE({domainCreateDisplayError}));
        throw domainCreateDisplayError;
      });
    }
  }
  

  export const getDomain = (domainId) => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: DOMAIN}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/domains/'+domainId+'/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      ).then((data)=>{
          dispatch(DOMAIN({data}));
  
          if (data.event_id) {
            dispatch(pollDomainEvent(data.event_id));
          }
  
          return data
  
      }).catch(domainDisplayError => {
        dispatch(DOMAIN({domainDisplayError}));
      });
    }
  }


  export const pollDomainEvent = (eventId) => { 

    // Taken from https://github.com/consbio/cookbook/blob/master/javascript/react-redux/polling-with-redux-thunk-and-promises/io.js
  
    return (dispatch, getState) => {
      let state = getState();
      let token = state.auth.token;
  
      if (state.domains.eventId === eventId) return;
  
      dispatch(ASYNC_START({subtype: DOMAIN_EVENT, eventId}));
      
      return new Promise(resolve => {  // The promise will resolve when the entire task is complete
        let pollStatus = () => {  // pollStatus is called 1s after the last poll completes
          api(
            {
              url: 'api/v1.0/events/'+eventId+'/', 
              method: "GET", 
              headers: {
                'Authorization': 'Bearer '+token
              },
              form: false,
            }
          ).then(data => {
              if (data.ready) {
                  dispatch(DOMAIN_EVENT({eventId: data.id}))
                  // At this point, we know the server has completed the task and we can resolve the promise
                  if (!data.failed) {
                    resolve(data);
                    
                    if (data.result.task === 'UPDATE_DOMAIN') {
                      dispatch(getDomain(data.result.domain_id)).then(() => {
                        toast(
                            {
                                title: 'Domain was updated!',
                                time: 10000,
                            },
                            () => console.log('toast closed'),
                            () => console.log('toast clicked')
                        ); 
                      })
                    } else if (data.result.task === 'CREATE_DOMAIN') {
                      dispatch(getDomain(data.result.domain_id)).then(() => {
                        toast(
                            {
                                title: 'Domain was created!',
                                time: 10000,
                            },
                            () => console.log('toast closed'),
                            () => console.log('toast clicked')
                        ); 
                      })
                    } else if (data.result.task === 'DELETE_DOMAIN') {
                      toast(
                          {
                              title: `Domain has been deleted.`,
                              time: 10000,
                          },
                          () => console.log('toast closed'),
                          () => console.log('toast clicked')
                      ); 

                      dispatch(DOMAIN_DELETE({domainDeletedId: data.result.domain_id}));

                    }
                    
                    
                  } else {
                    let err = new Error(data.result)
                    err.data = data
                    throw err
                  }
              }
              else {
                  setTimeout(pollStatus, 1000)
              }
            })
        }
  
        setTimeout(pollStatus, 1000)
    });
    }
  }


  export const updateDomain = (domainId, data) => {
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: DOMAIN_SETTINGS}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/domains/'+domainId+'/', 
          method: "PUT", 
          body: data,
          headers: {
            'Authorization': 'Bearer '+token
          },
        }
      ).then((data)=>{
          dispatch(DOMAIN_SETTINGS({data}));
          toast(
              {
                  title: 'Domain is being updated!',
                  description: <p>This should about 5 seconds</p>,
                  time: 10000,
              },
              () => console.log('toast closed'),
              () => console.log('toast clicked')
          );
  
        dispatch(pollDomainEvent(data.event_id));
      }).catch(domainSettingsDisplayError => {
        dispatch(DOMAIN_SETTINGS({domainSettingsDisplayError}));
        throw domainSettingsDisplayError;
      });
    }
  }
  

  export const deleteDomain = (domainId) => {
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: DOMAIN_DELETE}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/domains/'+domainId+'/', 
          method: "DELETE",
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false
        }
      ).then((data)=>{
        dispatch(DOMAIN_DELETE({data}));
        dispatch(pollDomainEvent(data.event_id));
      }).catch(domainDeleteDisplayError => {
        dispatch(DOMAIN_DELETE({domainDeleteDisplayError}));
      })
    }
  }