import {
    ASYNC_START,
    PAGE,
    USER,
    USER_PAGE_UNLOADED,
    USER_LIST,
    USER_LIST_PAGE_UNLOADED,
    USER_CREATE,
    USER_CREATE_PAGE_UNLOADED,
    USER_DELETE,
    USER_DELETE_PAGE_UNLOADED,
    USER_SETTINGS,
    USER_SETTINGS_PAGE_UNLOADED,
    USER_PASSWORD,
    USER_PASSWORD_PAGE_UNLOADED
} from '../constants/actionTypes';

import {handleActions, combineActions} from 'redux-actions';

export default handleActions({
    [USER_LIST]: (state, {payload: {userListDisplayError, data}}) => {
        return {
            ...state,
            userListInProgress: false,
            userListDisplayError,
            users: data
        }
    },
    [USER_CREATE]: (state, {payload: {userCreateDisplayError, data}}) => {
        return {
            ...state,
            userCreateInProgress: false,
            userCreateDisplayError,
            userCreated: data
        }
    },
    [USER]: (state, {payload: {userDisplayError, data}}) => {
        return {
            ...state,
            userInProgress: false,
            userDisplayError,
            user: data
        }
    },
    [USER_SETTINGS]: (state, {payload: {userUpdateDisplayError, data}}) => {
        let extra = {}
        if (data) {
            extra = {user: data}
        }
        return {
            ...state,
            userUpdateInProgress: false,
            userUpdateDisplayError,
            ...extra
        }
    },
    [USER_PASSWORD]: (state, {payload: {userPasswordDisplayError, userPasswordChangedId}}) => {
        return {
            ...state,
            userPasswordInProgress: false,
            userPasswordDisplayError,
            userPasswordChangedId
        }
    },
    [USER_DELETE]: (state, {payload: {userDeleteDisplayError, userDeletedId}}) => {
        return {
            ...state,
            userDeleteInProgress: false,
            userDeleteDisplayError,
            userDeletedId
        }
    },
    [PAGE]: (state, {payload: {subtype, activePage}}) => {
        if (subtype === USER_LIST) {
            return {
                ...state,
                currentPage: activePage
            }
        }
        return state;
    },
    [ASYNC_START]: (state, {payload: {subtype}}) => {
        if (subtype === USER_LIST) {
            return {
                ...state,
                userListInProgress: true,
                userListDisplayError: null
            }
        } else if (subtype === USER_CREATE) {
            return {
                ...state,
                userCreateInProgress: true,
                userCreateDisplayError: null
            }
        } else if (subtype === USER_DELETE) {
            return {
                ...state,
                userDeleteInProgress: true,
                userDeleteDisplayError: null
            }
        } else if (subtype === USER) {
            return {
                ...state,
                userInProgress: true,
                userDisplayError: null
            }
        }
 
        return state;
    },
    [combineActions(
        USER_LIST_PAGE_UNLOADED,
        USER_PAGE_UNLOADED,
        USER_SETTINGS_PAGE_UNLOADED,
        USER_DELETE_PAGE_UNLOADED,
        USER_CREATE_PAGE_UNLOADED,
        USER_PASSWORD_PAGE_UNLOADED)]: (state, action) => ({}),
}, {});
