import {
    LOGIN,
    LOGIN_PAGE_UNLOADED,
    ASYNC_START,
    REGISTER,
    REGISTER_CONFIRM,
    REGISTER_PAGE_UNLOADED,
    REGISTER_CONFIRM_PAGE_UNLOADED,
    RESET,
    RESET_PAGE_UNLOADED,
    RESET_CONFIRM,
    RESET_CONFIRM_PAGE_UNLOADED,
    TOKEN,
} from '../constants/actionTypes';

import {handleActions, combineActions} from 'redux-actions';

export default handleActions({
    [TOKEN]: (state, {payload: {token}}) => {
        return {
            ...state,
            token
        }
    },
    [LOGIN]: (state, {payload: {loginDisplayError, loginOk=false, data={}}}) => {
        return {
            ...state,
            loginInProgress: false,
            loginDisplayError,
            loginOk,
            ...data
        }
    },
    [REGISTER]: (state, {payload: {registerDisplayError, registerOK=false, data={}}}) => {
        return {
            ...state,
            registerInProgress: false,
            registerDisplayError,
            registerOK,
            ...data
        }
    },
    [RESET]: (state, {payload: {resetDisplayError, resetOK=false, data={}}}) => {
        return {
            ...state,
            resetInProgress: false,
            resetDisplayError,
            resetOK,
            ...data
        }
    },
    [REGISTER_CONFIRM]: (state, {payload: {registerConfirmDisplayError, registerConfirmOK=false, data={}}}) => {
        return {
            ...state,
            registerConfirmInProgress: false,
            registerConfirmDisplayError,
            registerConfirmOK,
            ...data
        }
    },
    [RESET_CONFIRM]: (state, {payload: {resetConfirmDisplayError, resetConfirmOK=false, data={}}}) => {
        return {
            ...state,
            resetConfirmInProgress: false,
            resetConfirmDisplayError,
            resetConfirmOK,
            ...data
        }
    },
    [ASYNC_START]: (state, {payload: {subtype}}) => {
        if (subtype === LOGIN) {
            return {
                ...state,
                loginInProgress: true,
                loginDisplayError: null
            }
        } else if (subtype === REGISTER) {
            return {
                ...state,
                registerInProgress: true,
                registerDisplayError: null
            }
        } else if (subtype === REGISTER_CONFIRM) {
            return {
                ...state,
                registerConfirmInProgress: true,
                registerConfirmDisplayError: null
            }
        } else if (subtype === RESET) {
            return {
                ...state,
                resetInProgress: true,
                resetDisplayError: null
            }
        } else if (subtype === RESET_CONFIRM) {
            return {
                ...state,
                resetConfirmInProgress: true,
                resetConfirmDisplayError: null
            }
        }
        return state
    },
    [combineActions(
        LOGIN_PAGE_UNLOADED,
        REGISTER_PAGE_UNLOADED,
        REGISTER_CONFIRM_PAGE_UNLOADED,
        RESET_PAGE_UNLOADED,
        RESET_CONFIRM_PAGE_UNLOADED)]: (state, action) => {
            return {}
        },
}, {});
