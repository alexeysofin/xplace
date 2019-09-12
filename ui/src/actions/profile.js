import React from 'react';

import {toast} from 'react-semantic-toasts';

import {
  ASYNC_START,
  PROFILE,
  TOKEN,
  PROFILE_UPDATE,
  PROFILE_UPDATE_PASSWORD,
} from '../constants/actionTypes';

import {api} from '../actions';

export const getProfile = (token='') => { 
    return (dispatch) => {
      dispatch(ASYNC_START({subtype: PROFILE}));
      return api(
        {
          url: 'api/v1.0/profile/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false
        }
      ).then((data)=>{
          dispatch(TOKEN({token}));
          dispatch(PROFILE({data}));
      }).catch(profileDisplayError => {
        dispatch(PROFILE({profileDisplayError}));
      })
  
    }
  }
  
  export const updateProfile = (data) => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: PROFILE_UPDATE}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/profile/', 
          method: "PUT", 
          body: data,
          headers: {
            'Authorization': 'Bearer '+token
          },
        }
      ).then((data)=>{
          dispatch(PROFILE_UPDATE({data}));
          toast(
            {
                title: 'Profile updated.',
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
          );
      }).catch(profileUpdateDisplayError => {
        dispatch(PROFILE_UPDATE({profileUpdateDisplayError}));
        throw profileUpdateDisplayError;
      });
  
    }
  }
  
  
  export const updateProfilePassword = (data) => { 
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: PROFILE_UPDATE_PASSWORD}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/profile/password/', 
          method: "PUT", 
          body: data,
          headers: {
            'Authorization': 'Bearer '+token
          },
        }
      ).then((data)=>{
          dispatch(PROFILE_UPDATE_PASSWORD({data}));
          toast(
            {
                title: 'Profile password updated.',
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
          );
      }).catch(profileUpdatePasswordDisplayError => {
        dispatch(PROFILE_UPDATE_PASSWORD({profileUpdatePasswordDisplayError}));
        throw profileUpdatePasswordDisplayError;
      });
  
    }
  }
  