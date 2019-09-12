import {
    ASYNC_START,
    SSH_KEY_LIST,
    SSH_KEY_CREATE,
    SSH_KEY_DELETE,
    SSH_KEY_LIST_PAGE_UNLOADED,
    SSH_KEY_PAGE_UNLOADED,
    SSH_KEY,
    SSH_KEY_UPDATE
} from '../constants/actionTypes';

import {handleActions, combineActions} from 'redux-actions';

export default handleActions({
    [SSH_KEY_LIST]: (state, {payload: {sshKeyListDisplayError, data}}) => {
        return {
            ...state,
            sshKeyListInProgress: false,
            sshKeyListDisplayError,
            sshKeys: data
        }
    },
    [SSH_KEY_CREATE]: (state, {payload: {sshKeyCreateDisplayError, data}}) => {
        return {
            ...state,
            sshKeyCreateInProgress: false,
            sshKeyCreateDisplayError,
            sshKeyCreated: data
        }
    },
    [SSH_KEY]: (state, {payload: {sshKeyDisplayError, data}}) => {
        return {
            ...state,
            sshKeyInProgress: false,
            sshKeyDisplayError,
            sshKey: data
        }
    },
    [SSH_KEY_UPDATE]: (state, {payload: {sshKeyUpdateDisplayError, data}}) => {
        let extra = {}
        if (data) {
            extra = {sshKey: data}
        }
        return {
            ...state,
            sshKeyUpdateInProgress: false,
            sshKeyUpdateDisplayError,
            ...extra
        }
    },
    [SSH_KEY_DELETE]: (state, {payload: {sshKeyDeleteDisplayError, data}}) => {
        return {
            ...state,
            sshKeyDeleteInProgress: false,
            sshKeyDeleteDisplayError,
        }
    },
    [ASYNC_START]: (state, {payload: {subtype}}) => {
        if (subtype === SSH_KEY_LIST) {
            return {
                ...state,
                sshKeyListInProgress: true,
                sshKeyListDisplayError: null
            }
        } else if (subtype === SSH_KEY_CREATE) {
            return {
                ...state,
                sshKeyCreateInProgress: true,
                sshKeyCreateDisplayError: null
            }
        } else if (subtype === SSH_KEY_DELETE) {
            return {
                ...state,
                sshKeyDeleteInProgress: true,
                sshKeyDeleteDisplayError: null
            }
        } else if (subtype === SSH_KEY) {
            return {
                ...state,
                sshKeyInProgress: true,
                sshKeyDisplayError: null
            }
        }

 
        return state;
    },
    [combineActions(
        SSH_KEY_LIST_PAGE_UNLOADED,
        SSH_KEY_PAGE_UNLOADED)]: (state, action) => ({}),
}, {});
