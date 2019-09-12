import {
    ASYNC_START,
    PAGE,
    TICKET,
    TICKET_PAGE_UNLOADED,
    TICKET_LIST,
    TICKET_LIST_PAGE_UNLOADED,
    TICKET_CREATE,
    TICKET_CREATE_PAGE_UNLOADED,
    TICKET_DELETE,
    TICKET_DELETE_PAGE_UNLOADED,
    TICKET_CREATE_OPTIONS,
    TICKET_UPDATE_OPTIONS,
    TICKET_SETTINGS,
    TICKET_SETTINGS_PAGE_UNLOADED,
    TICKET_COMMENT_LIST,
    TICKET_COMMENT_CREATE
} from '../constants/actionTypes';

import {handleActions, combineActions} from 'redux-actions';

export default handleActions({
    [TICKET_LIST]: (state, {payload: {ticketListDisplayError, data}}) => {
        return {
            ...state,
            ticketListInProgress: false,
            ticketListDisplayError,
            tickets: data
        }
    },
    [TICKET_CREATE_OPTIONS]: (state, {payload: {ticketCreateOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            ticketCreateOptionsInProgress: false,
            ticketCreateOptionsDisplayError,
            createOptions: data
        }
    },
    [TICKET_UPDATE_OPTIONS]: (state, {payload: {ticketUpdateOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            ticketUpdateOptionsInProgress: false,
            ticketUpdateOptionsDisplayError,
            updateOptions: data
        }
    },
    [TICKET_CREATE]: (state, {payload: {ticketCreateDisplayError, data}}) => {
        return {
            ...state,
            ticketCreateInProgress: false,
            ticketCreateDisplayError,
            ticketCreated: data
        }
    },
    [TICKET]: (state, {payload: {ticketDisplayError, data}}) => {
        return {
            ...state,
            ticketInProgress: false,
            ticketDisplayError,
            ticket: data
        }
    },
    [TICKET_SETTINGS]: (state, {payload: {ticketUpdateDisplayError, data}}) => {
        let extra = {}
        if (data) {
            extra = {ticket: data}
        }
        return {
            ...state,
            ticketUpdateInProgress: false,
            ticketUpdateDisplayError,
            ...extra
        }
    },
    [TICKET_DELETE]: (state, {payload: {ticketDeleteDisplayError, ticketDeletedId}}) => {
        return {
            ...state,
            ticketDeleteInProgress: false,
            ticketDeleteDisplayError,
            ticketDeletedId
        }
    },
    [PAGE]: (state, {payload: {subtype, activePage}}) => {
        if (subtype === TICKET_LIST) {
            return {
                ...state,
                currentPage: activePage
            }
        } else if (subtype === TICKET_COMMENT_LIST) {
            return {
                ...state,
                ticketCommentListCurrentPage: activePage
            }
        }
        return state;
    },
    [TICKET_COMMENT_LIST]: (state, {payload: {ticketCommentListDisplayError, data}}) => {
        return {
            ...state,
            ticketCommentListInProgress: false,
            ticketCommentListDisplayError,
            ticketCommentList: data
        }
    },
    [TICKET_COMMENT_CREATE]: (state, {payload: {ticketCommentCreateDisplayError, data}}) => {
        return {
            ...state,
            ticketCommentCreateInProgress: false,
            ticketCommentCreateDisplayError,
            ticketCommentCreated: data
        }
    },
    [ASYNC_START]: (state, {payload: {subtype}}) => {
        if (subtype === TICKET_LIST) {
            return {
                ...state,
                ticketListInProgress: true,
                ticketListDisplayError: null
            }
        } else if (subtype === TICKET_CREATE) {
            return {
                ...state,
                ticketCreateInProgress: true,
                ticketCreateDisplayError: null
            }
        } else if (subtype === TICKET_DELETE) {
            return {
                ...state,
                ticketDeleteInProgress: true,
                ticketDeleteDisplayError: null
            }
        } else if (subtype === TICKET) {
            return {
                ...state,
                ticketInProgress: true,
                ticketDisplayError: null
            }
        } else if (subtype === TICKET_CREATE_OPTIONS) {
            return {
                ...state,
                ticketCreateOptionsInProgress: true,
                ticketCreateOptionsDisplayError: null
            }
        } else if (subtype === TICKET_UPDATE_OPTIONS) {
            return {
                ...state,
                ticketUpdateOptionsInProgress: true,
                ticketUpdateOptionsDisplayError: null
            }
        } else if (subtype === TICKET_COMMENT_LIST) {
            return {
                ...state,
                ticketCommentListInProgress: true,
                ticketCommentListDisplayError: null
            }
        } else if (subtype === TICKET_COMMENT_CREATE) {
            return {
                ...state,
                ticketCommentCreateInProgress: true,
                ticketCommentCreateDisplayError: null
            }
        }
 
        return state;
    },
    [combineActions(
        TICKET_LIST_PAGE_UNLOADED,
        TICKET_PAGE_UNLOADED,
        TICKET_SETTINGS_PAGE_UNLOADED,
        TICKET_DELETE_PAGE_UNLOADED,
        TICKET_CREATE_PAGE_UNLOADED)]: (state, action) => ({}),
}, {});
