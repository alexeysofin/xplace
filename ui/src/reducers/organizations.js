import {
    ASYNC_START,
    PAGE,
    ORGANIZATION,
    ORGANIZATION_PAGE_UNLOADED,
    ORGANIZATION_LIST,
    ORGANIZATION_LIST_PAGE_UNLOADED,
    ORGANIZATION_CREATE,
    ORGANIZATION_CREATE_PAGE_UNLOADED,
    ORGANIZATION_DELETE,
    ORGANIZATION_DELETE_PAGE_UNLOADED,
    ORGANIZATION_CREATE_OPTIONS,
    ORGANIZATION_UPDATE_OPTIONS,
    ORGANIZATION_SETTINGS,
    ORGANIZATION_SETTINGS_PAGE_UNLOADED,
    ORGANIZATION_USER_LIST,
    ORGANIZATION_USER_LIST_PAGE_UNLOADED,
    ORGANIZATION_USER_CREATE
} from '../constants/actionTypes';

import {handleActions, combineActions} from 'redux-actions';

export default handleActions({
    [ORGANIZATION_LIST]: (state, {payload: {organizationListDisplayError, data}}) => {
        return {
            ...state,
            organizationListInProgress: false,
            organizationListDisplayError,
            organizations: data
        }
    },
    [ORGANIZATION_USER_LIST]: (state, {payload: {organizationUserListDisplayError, data}}) => {
        return {
            ...state,
            organizationUserListInProgress: false,
            organizationUserListDisplayError,
            organizationUserList: data
        }
    },
    [ORGANIZATION_CREATE_OPTIONS]: (state, {payload: {organizationCreateOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            organizationCreateOptionsInProgress: false,
            organizationCreateOptionsDisplayError,
            createOptions: data
        }
    },
    [ORGANIZATION_UPDATE_OPTIONS]: (state, {payload: {organizationUpdateOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            organizationUpdateOptionsInProgress: false,
            organizationUpdateOptionsDisplayError,
            updateOptions: data
        }
    },
    [ORGANIZATION_CREATE]: (state, {payload: {organizationCreateDisplayError, data}}) => {
        return {
            ...state,
            organizationCreateInProgress: false,
            organizationCreateDisplayError,
            organizationCreated: data
        }
    },
    [ORGANIZATION_USER_CREATE]: (state, {payload: {organizationUserCreateDisplayError, data}}) => {
        return {
            ...state,
            organizationUserCreateInProgress: false,
            organizationUserCreateDisplayError,
            organizationUserCreated: data
        }
    },
    [ORGANIZATION]: (state, {payload: {organizationDisplayError, data}}) => {
        return {
            ...state,
            organizationInProgress: false,
            organizationDisplayError,
            organization: data
        }
    },
    [ORGANIZATION_SETTINGS]: (state, {payload: {organizationUpdateDisplayError, data}}) => {
        let extra = {}
        if (data) {
            extra = {organization: data}
        }
        return {
            ...state,
            organizationUpdateInProgress: false,
            organizationUpdateDisplayError,
            ...extra
        }
    },
    [ORGANIZATION_DELETE]: (state, {payload: {organizationDeleteDisplayError, organizationDeletedId}}) => {
        return {
            ...state,
            organizationDeleteInProgress: false,
            organizationDeleteDisplayError,
            organizationDeletedId
        }
    },
    [PAGE]: (state, {payload: {subtype, activePage}}) => {
        if (subtype === ORGANIZATION_LIST) {
            return {
                ...state,
                currentPage: activePage
            }
        } else if (subtype === ORGANIZATION_USER_LIST) {
            return {
                ...state,
                organizationUserListcurrentPage: activePage
            }
        }
        return state;
    },
    [ASYNC_START]: (state, {payload: {subtype}}) => {
        if (subtype === ORGANIZATION_LIST) {
            return {
                ...state,
                organizationListInProgress: true,
                organizationListDisplayError: null
            }
        } else if (subtype === ORGANIZATION_CREATE) {
            return {
                ...state,
                organizationCreateInProgress: true,
                organizationCreateDisplayError: null
            }
        } else if (subtype === ORGANIZATION_DELETE) {
            return {
                ...state,
                organizationDeleteInProgress: true,
                organizationDeleteDisplayError: null
            }
        } else if (subtype === ORGANIZATION) {
            return {
                ...state,
                organizationInProgress: true,
                organizationDisplayError: null
            }
        } else if (subtype === ORGANIZATION_CREATE_OPTIONS) {
            return {
                ...state,
                organizationCreateOptionsInProgress: true,
                organizationCreateOptionsDisplayError: null
            }
        } else if (subtype === ORGANIZATION_UPDATE_OPTIONS) {
            return {
                ...state,
                organizationUpdateOptionsInProgress: true,
                organizationUpdateOptionsDisplayError: null
            }
        } else if (subtype === ORGANIZATION_USER_LIST) {
            return {
                ...state,
                organizationUserListInProgress: true,
                organizationUserListDisplayError: null
            }
        } else if (subtype === ORGANIZATION_USER_CREATE) {
            return {
                ...state,
                organizationUserCreateInProgress: true,
                organizationUserCreateDisplayError: null
            }
        }
 
        return state;
    },
    [combineActions(
        ORGANIZATION_LIST_PAGE_UNLOADED,
        ORGANIZATION_PAGE_UNLOADED,
        ORGANIZATION_SETTINGS_PAGE_UNLOADED,
        ORGANIZATION_DELETE_PAGE_UNLOADED,
        ORGANIZATION_CREATE_PAGE_UNLOADED,
        ORGANIZATION_USER_LIST_PAGE_UNLOADED)]: (state, action) => ({}),
}, {});
