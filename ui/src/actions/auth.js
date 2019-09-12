import {
  ASYNC_START,
  LOGIN,
  LOGOUT,
  REGISTER,
  REGISTER_CONFIRM,
  RESET,
  RESET_CONFIRM,
} from '../constants/actionTypes';

import {api} from '../actions';

export const login = (data) => {
    return (dispatch) => {
      dispatch(ASYNC_START({subtype: LOGIN}));
  
      return api({url: 'api/v1.0/auth-token/', method: "POST", body: data}).then((data)=>{
        localStorage.setItem('token', data.token);
        dispatch(LOGIN({data, loginOk: true}));
      }).catch(loginDisplayError => {
        dispatch(LOGIN({loginDisplayError}));
        throw loginDisplayError;
      })
    }
  }
  
  export const logout = () => {
    return (dispatch, getState) => {
      dispatch(ASYNC_START({subtype: LOGOUT}));
  
      let state = getState();
      let token = state.auth.token;
  
      return api(
        {
          url: 'api/v1.0/auth-token/'+token+'/', 
          method: "DELETE",
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false
        }
      ).then((data)=>{
        localStorage.removeItem('token');
        dispatch(LOGOUT({data, logoutOk: true}));
      }).catch(logoutDisplayError => {
        localStorage.removeItem('token');
        dispatch(LOGOUT({data: {}, logoutOk: true}));
      })
    }
  }
  
  export const register = (data) => {
    return (dispatch) => {
      dispatch(ASYNC_START({subtype: REGISTER}));
  
      return api({url: 'api/v1.0/registration/', method: "POST", body: data}).then((data)=>{
        dispatch(REGISTER({data, registerOK: true}));
      }).catch(registerDisplayError => {
        dispatch(REGISTER({registerDisplayError}));
        throw registerDisplayError;
      })
  
    }
  }
  
  
  export const registerConfirm = (data) => {
    return (dispatch) => {
      dispatch(ASYNC_START({subtype: REGISTER_CONFIRM}));
      return api({url: 'api/v1.0/email-verification/', method: "POST", body: data}).then((data)=>{
        localStorage.setItem('token', data.token);
        dispatch(REGISTER_CONFIRM({data, registerConfirmOK: true}));
      }).catch(registerConfirmDisplayError => {
        dispatch(REGISTER_CONFIRM({registerConfirmDisplayError}));
      });
    }
  }
  
  
  export const reset = (data) => {
    return (dispatch) => {
      dispatch(ASYNC_START({subtype: RESET}));
  
      return api({url: 'api/v1.0/reset-password-token/', method: "POST", body: data}).then((data)=>{
        dispatch(RESET({data, resetOK: true}));
      }).catch(resetDisplayError => {
        dispatch(RESET({resetDisplayError}));
        throw resetDisplayError;
      })
  
    }
  }
  
  
  export const resetConfirm = (data) => {
    return (dispatch) => {
      dispatch(ASYNC_START({subtype: RESET_CONFIRM}));
      return api({url: 'api/v1.0/password-reset/', method: "POST", body: data}).then((data)=>{
        localStorage.setItem('token', data.token);
        dispatch(RESET_CONFIRM({data, resetConfirmOK: true}));
      }).catch(resetConfirmDisplayError => {
        dispatch(RESET_CONFIRM({resetConfirmDisplayError}));
      }); 
    }
  }