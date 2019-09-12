import {
    PROFILE,
    ASYNC_START,
    PRIVATE_PAGE_UNLOADED,
    LOGOUT,
    PROFILE_UPDATE,
    PROFILE_UPDATE_PASSWORD
} from '../constants/actionTypes';

import {handleActions} from 'redux-actions';

export default handleActions({
    [LOGOUT]: (state, {payload: {logoutDisplayError, logoutOk=false, data={}}}) => {
        return {
            ...state,
            logoutInProgress: false,
            logoutDisplayError,
            logoutOk,
            ...data
        }
    },
    [PROFILE]: (state, {payload: {profileDisplayError, data={}}}) => {
        return {
            ...state,
            profileInProgress: false,
            profileDisplayError,
            profile: data
        }
    },
    [PROFILE_UPDATE]: (state, {payload: {profileUpdateDisplayError, data}}) => {
        let extra = {}

        if (data) {
            extra = {
                profile: data
            }
        }

        return {
            ...state,
            profileUpdateInProgress: false,
            profileUpdateDisplayError,
            ...extra
        }
    },
    [PROFILE_UPDATE_PASSWORD]: (state, {payload: {profileUpdatePasswordDisplayError}}) => {
        return {
            ...state,
            profileUpdatePasswordInProgress: false,
            profileUpdatePasswordDisplayError,
        }
    },
    [ASYNC_START]: (state, {payload: {subtype}}) => {
        if (subtype === PROFILE) {
            return {
                ...state,
                profileInProgress: true,
                profileDisplayError: null
            }
        } else if (subtype === LOGOUT) {
            return {
                ...state,
                logoutInProgress: true,
                logoutDisplayError: null
            }
        } else if (subtype === PROFILE_UPDATE) {
            return {
                ...state,
                profileUpdateInProgress: true,
                profileUpdateDisplayError: null
            }
        } else if (subtype === PROFILE_UPDATE_PASSWORD) {
            return {
                ...state,
                profileUpdatePasswordInProgress: true,
                profileUpdatePasswordDisplayError: null
            }
        }
        return state;
    },
    [PRIVATE_PAGE_UNLOADED]: (state, action) => ({}),
}, {});
