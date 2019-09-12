import React from 'react';

import {serializeQueryParams} from '../Utils';

import {toast} from 'react-semantic-toasts';

import {api} from '../actions';

import {
  ASYNC_START,
  SSH_KEY_LIST,
  SSH_KEY_CREATE,
  SSH_KEY_DELETE,
  SSH_KEY,
  SSH_KEY_UPDATE
} from '../constants/actionTypes';

export const getSshKeyList = () => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: SSH_KEY_LIST}));
  
      let state = getState();
      let token = state.auth.token;
      let sshKeys = state.sshKeys;
      let currentPage = (sshKeys.currentPage || 1);
      let params = serializeQueryParams({'page': currentPage});
  
      return api(
        {
          url: 'api/v1.0/ssh-keys/?'+params, 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      ).then((data)=>{
          dispatch(SSH_KEY_LIST({data}));
      }).catch(sshKeyListDisplayError => {
        dispatch(SSH_KEY_LIST({sshKeyListDisplayError}));
      });
    }
  }
  
  export const createSshKey = (data) => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: SSH_KEY_CREATE}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/ssh-keys/?', 
          method: "POST", 
          body: data,
          headers: {
            'Authorization': 'Bearer '+token
          },
        }
      ).then((data)=>{
          dispatch(SSH_KEY_CREATE({data}));
          dispatch(getSshKeyList()).then(() => {
            toast(
                {
                    title: `SSH key created!`,
                    time: 10000,
                },
                () => console.log('toast closed'),
                () => console.log('toast clicked')
            );  
          })
      }).catch(sshKeyCreateDisplayError => {
        dispatch(SSH_KEY_CREATE({sshKeyCreateDisplayError}));
        throw sshKeyCreateDisplayError;
      });
    }
  }
  
  export const deleteSshKey = (sshKeyId) => {
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: SSH_KEY_DELETE}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/ssh-keys/'+sshKeyId+'/', 
          method: "DELETE",
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false
        }
      ).then((data)=>{
        dispatch(SSH_KEY_DELETE({data}));
        dispatch(getSshKeyList()).then(() => {
          toast(
            {
                title: `SSH key has been deleted.`,
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        ); 
        });
      }).catch(sshKeyDeleteDisplayError => {
        dispatch(SSH_KEY_DELETE({sshKeyDeleteDisplayError}));
      })
    }
  }
  
  
  export const getSshKey = (sshKeyId) => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: SSH_KEY}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/ssh-keys/'+sshKeyId+'/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      ).then((data)=>{
          dispatch(SSH_KEY({data}));
      }).catch(sshKeyDisplayError => {
        dispatch(SSH_KEY({sshKeyDisplayError}));
      });
    }
  }
  
  
  export const updateSshKey = (sshKeyId, data) => {
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: SSH_KEY_UPDATE}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/ssh-keys/'+sshKeyId+'/', 
          method: "PUT", 
          body: data,
          headers: {
            'Authorization': 'Bearer '+token
          },
        }
      ).then((data)=>{
          dispatch(SSH_KEY_UPDATE({data}));
          toast(
              {
                  title: 'SSH key updated!',
                  time: 10000,
              },
              () => console.log('toast closed'),
              () => console.log('toast clicked')
          );
  
      }).catch(sshKeyUpdateDisplayError => {
        dispatch(SSH_KEY_UPDATE({sshKeyUpdateDisplayError}));
        throw sshKeyUpdateDisplayError;
      });
    }
  }