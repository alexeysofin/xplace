import React from 'react';

import {serializeQueryParams} from '../Utils';

import {toast} from 'react-semantic-toasts';

import {api} from '../actions';

import {
    ASYNC_START,
    USER_LIST,
    USER_CREATE, 
    USER,
    USER_DELETE,
    USER_SETTINGS,
    USER_PASSWORD,
} from '../constants/actionTypes';

export const getUserList = () => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: USER_LIST}));
  
      let state = getState();
      let token = state.auth.token;
      let users = state.users;
      let currentPage = (users.currentPage || 1);
      let params = serializeQueryParams({'page': currentPage});
  
      return api(
        {
          url: 'api/v1.0/users/?'+params, 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      ).then((data)=>{
          dispatch(USER_LIST({data}));
      }).catch(userListDisplayError => {
        dispatch(USER_LIST({userListDisplayError}));
      });
    }
  }

export const createUser = (data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: USER_CREATE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/users/', 
        method: "POST", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(USER_CREATE({data, userCreateOk: true}));
        toast(
          {
              title: 'User has been created.',
              time: 10000
          },
          () => console.log('toast closed'),
          () => console.log('toast clicked')
        );
    }).catch(userCreateDisplayError => {
      dispatch(USER_CREATE({userCreateDisplayError}));
      throw userCreateDisplayError;
    });
  }
}


export const getUser = (userId) => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: USER}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/users/'+userId+'/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(USER({data}));
        return data

    }).catch(userDisplayError => {
      dispatch(USER({userDisplayError}));
    });
  }
}


export const updateUser = (userId, data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: USER_SETTINGS}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/users/'+userId+'/', 
        method: "PUT", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(USER_SETTINGS({data}));
        toast(
            {
                title: 'User has been updated!',
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );
    }).catch(userSettingsDisplayError => {
      dispatch(USER_SETTINGS({userSettingsDisplayError}));
      throw userSettingsDisplayError;
    });
  }
}


export const changeUserPassword = (userId, data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: USER_PASSWORD}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/users/'+userId+'/password/', 
        method: "PUT", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then(()=>{
        dispatch(USER_PASSWORD({userPasswordChangedId: userId}));
        toast(
            {
                title: 'User has password been changed!',
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );
    }).catch(userPasswordDisplayError => {
      dispatch(USER_PASSWORD({userPasswordDisplayError}));
      throw userPasswordDisplayError;
    });
  }
}

export const deleteUser = (userId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: USER_DELETE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/users/'+userId+'/', 
        method: "DELETE",
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false
      }
    ).then(()=>{
      dispatch(USER_DELETE({userDeletedId: userId}));
      toast(
        {
            title: 'User has been deleted!',
            time: 10000,
        },
        () => console.log('toast closed'),
        () => console.log('toast clicked')
    );
    }).catch(userDeleteDisplayError => {
      dispatch(USER_DELETE({userDeleteDisplayError}));
    })
  }
}
