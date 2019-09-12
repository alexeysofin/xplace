import {
    ASYNC_START,
    PAGE,
    DOMAIN,
    DOMAIN_PAGE_UNLOADED,
    DOMAIN_LIST,
    DOMAIN_LIST_PAGE_UNLOADED,
    DOMAIN_CREATE,
    DOMAIN_CREATE_PAGE_UNLOADED,
    DOMAIN_DELETE,
    DOMAIN_DELETE_PAGE_UNLOADED,
    DOMAIN_CREATE_OPTIONS,
    DOMAIN_UPDATE_OPTIONS,
    DOMAIN_SETTINGS,
    DOMAIN_SETTINGS_PAGE_UNLOADED
} from '../constants/actionTypes';

import {handleActions, combineActions} from 'redux-actions';

export default handleActions({
    [DOMAIN_LIST]: (state, {payload: {domainListDisplayError, data}}) => {
        return {
            ...state,
            domainListInProgress: false,
            domainListDisplayError,
            domains: data
        }
    },
    [DOMAIN_CREATE_OPTIONS]: (state, {payload: {domainCreateOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            domainCreateOptionsInProgress: false,
            domainCreateOptionsDisplayError,
            createOptions: data
        }
    },
    [DOMAIN_UPDATE_OPTIONS]: (state, {payload: {domainUpdateOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            domainUpdateOptionsInProgress: false,
            domainUpdateOptionsDisplayError,
            updateOptions: data
        }
    },
    [DOMAIN_CREATE]: (state, {payload: {domainCreateDisplayError, data}}) => {
        return {
            ...state,
            domainCreateInProgress: false,
            domainCreateDisplayError,
            domainCreated: data
        }
    },
    [DOMAIN]: (state, {payload: {domainDisplayError, data}}) => {
        return {
            ...state,
            domainInProgress: false,
            domainDisplayError,
            domain: data
        }
    },
    [DOMAIN_SETTINGS]: (state, {payload: {domainUpdateDisplayError, data}}) => {
        let extra = {}
        if (data) {
            extra = {domain: data}
        }
        return {
            ...state,
            domainUpdateInProgress: false,
            domainUpdateDisplayError,
            ...extra
        }
    },
    [DOMAIN_DELETE]: (state, {payload: {domainDeleteDisplayError, domainDeletedId, data}}) => {
        let extra = {}

        if (data) {
            extra = {
                domain: data
            }
        }

        return {
            ...state,
            domainDeleteInProgress: false,
            domainDeleteDisplayError,
            domainDeletedId,
            ...extra
        }
    },
    [PAGE]: (state, {payload: {subtype, activePage}}) => {
        if (subtype === DOMAIN_LIST) {
            return {
                ...state,
                currentPage: activePage
            }
        }
        return state;
    },
    [ASYNC_START]: (state, {payload: {subtype}}) => {
        if (subtype === DOMAIN_LIST) {
            return {
                ...state,
                domainListInProgress: true,
                domainListDisplayError: null
            }
        } else if (subtype === DOMAIN_CREATE) {
            return {
                ...state,
                domainCreateInProgress: true,
                domainCreateDisplayError: null
            }
        } else if (subtype === DOMAIN_DELETE) {
            return {
                ...state,
                domainDeleteInProgress: true,
                domainDeleteDisplayError: null
            }
        } else if (subtype === DOMAIN) {
            return {
                ...state,
                domainInProgress: true,
                domainDisplayError: null
            }
        } else if (subtype === DOMAIN_CREATE_OPTIONS) {
            return {
                ...state,
                domainCreateOptionsInProgress: true,
                domainCreateOptionsDisplayError: null
            }
        } else if (subtype === DOMAIN_UPDATE_OPTIONS) {
            return {
                ...state,
                domainUpdateOptionsInProgress: true,
                domainUpdateOptionsDisplayError: null
            }
        }
 
        return state;
    },
    [combineActions(
        DOMAIN_LIST_PAGE_UNLOADED,
        DOMAIN_PAGE_UNLOADED,
        DOMAIN_SETTINGS_PAGE_UNLOADED,
        DOMAIN_DELETE_PAGE_UNLOADED,
        DOMAIN_CREATE_PAGE_UNLOADED)]: (state, action) => ({}),
}, {});
