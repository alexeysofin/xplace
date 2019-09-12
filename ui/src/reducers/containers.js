import {
    CONTAINER_LIST,
    CONTAINER_LIST_PAGE_UNLOADED,
    ASYNC_START,
    PAGE,
    CONTAINER_CREATE_OPTIONS,
    CONTAINER_UPDATE_OPTIONS,
    CONTAINER_CREATE,
    CONTAINER_CREATE_PAGE_UNLOADED,
    CONTAINER_GET_PAGE_UNLOADED,
    CONTAINER_GET,
    CONTAINER_SETTINGS,
    CONTAINER_SETTINGS_PAGE_UNLOADED,
    CONTAINER_EVENT,
    CONTAINER_STATE,
    CONTAINER_STATE_PAGE_UNLOADED,
    CONTAINER_PASSWORD,
    CONTAINER_PASSWORD_PAGE_UNLOADED,
    CONTAINER_EVENTS,
    CONTAINER_EVENTS_PAGE_UNLOADED,
    CONTAINER_BACKUPS,
    CONTAINER_BACKUP,
    CONTAINER_RESTORE,
    CONTAINER_BACKUPS_PAGE_UNLOADED,
    CONTAINER_BACKUP_DELETE,
    CONTAINER_DELETE,
    CONTAINER_DELETE_PAGE_UNLOADED,
    CONTAINER_STORAGE_PAGE_UNLOADED,
    CONTAINER_STORAGE_OPTIONS,
    CONTAINER_STORAGE
} from '../constants/actionTypes';

import {handleActions, combineActions} from 'redux-actions';

export default handleActions({
    [CONTAINER_LIST]: (state, {payload: {containerListDisplayError, data={}}}) => {
        return {
            ...state,
            containerListInProgress: false,
            containerListDisplayError,
            containers: data
        }
    },
    [CONTAINER_STORAGE_OPTIONS]: (state, {payload: {containerStorageOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            containerStorageOptionsInProgress: false,
            containerStorageOptionsDisplayError,
            storageOptions: data
        }
    },
    [CONTAINER_CREATE_OPTIONS]: (state, {payload: {containerCreateOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            containerCreateOptionsInProgress: false,
            containerCreateOptionsDisplayError,
            createOptions: data
        }
    },
    [CONTAINER_UPDATE_OPTIONS]: (state, {payload: {containerUpdateOptionsDisplayError, data={}}}) => {
        return {
            ...state,
            containerUpdateOptionsInProgress: false,
            containerUpdateOptionsDisplayError,
            updateOptions: data
        }
    },
    [CONTAINER_CREATE]: (state, {payload: {containerCreateDisplayError, data}}) => {
        return {
            ...state,
            containerCreateInProgress: false,
            containerCreateDisplayError,
            containerCreated: data
        }
    },
    [CONTAINER_STATE]: (state, {payload: {containerStateDisplayError, data}}) => {
        let extra = {}

        if (data) {
            extra = {
                container: data
            }
        }

        return {
            ...state,
            containerStateInProgress: false,
            containerStateDisplayError,
            ...extra
        }
    },
    [CONTAINER_GET]: (state, {payload: {containerGetDisplayError, data}}) => {
        return {
            ...state,
            containerGetInProgress: false,
            containerGetDisplayError,
            container: data
        }
    },
    [CONTAINER_PASSWORD]: (state, {payload: {containerPasswordDisplayError, data}}) => {
        return {
            ...state,
            containerPasswordInProgress: false,
            containerPasswordDisplayError
        }
    },
    [CONTAINER_EVENT]: (state, {payload: {eventId}}) => {
        return {
            ...state,
            eventId: undefined,
        }
    },
    [CONTAINER_SETTINGS]: (state, {payload: {containerSettingsDisplayError, data}}) => {
        let extra = {};

        if (data) {
            extra = {container: data}
        }

        return {
            ...state,
            containerSettingsInProgress: false,
            containerSettingsDisplayError,
            ...extra
        }
    },
    [CONTAINER_EVENTS]: (state, {payload: {containerEventListDisplayError, data={}}}) => {
        return {
            ...state,
            containerEventListInProgress: false,
            containerEventListDisplayError,
            events: data
        }
    },
    [CONTAINER_BACKUPS]: (state, {payload: {containerBackupListDisplayError, data={}}}) => {
        return {
            ...state,
            containerBackupListInProgress: false,
            containerBackupListDisplayError,
            backups: data
        }
    },
    [CONTAINER_BACKUP]: (state, {payload: {containerBackupDisplayError, data=undefined}}) => {
        let extra = {}

        if (data) {
            extra = {container: data}
        }

        return {
            ...state,
            containerBackupInProgress: false,
            containerBackupDisplayError,
            ...extra
        }
    },
    [CONTAINER_RESTORE]: (state, {payload: {containerRestoreDisplayError, data=undefined}}) => {
        let extra = {}

        if (data) {
            extra = {container: data}
        }

        return {
            ...state,
            containerRestoreInProgress: false,
            containerRestoreDisplayError,
            ...extra
        }
    },
    [CONTAINER_STORAGE]: (state, {payload: {containerStorageDisplayError, data}}) => {
        let extra = {}

        if (data) {
            extra = {container: data}
        }

        return {
            ...state,
            containerStorageInProgress: false,
            containerStorageDisplayError,
            ...extra
        }
    },
    [CONTAINER_BACKUP_DELETE]: (state, {payload: {containerBackupDeleteDisplayError, data}}) => {
        return {
            ...state,
            containerBackupDeleteInProgress: false,
            containerBackupDeleteDisplayError
        }
    },
    [CONTAINER_DELETE]: (state, {payload: {containerDeleteDisplayError, data, containerDeletedId}}) => {
        let extra = {}

        if (data) {
            extra = {
                container: data
            }
        }

        return {
            ...state,
            containerDeleteInProgress: false,
            containerDeleteDisplayError,
            containerDeletedId,
            ...extra
        }
    },
    [ASYNC_START]: (state, {payload: {subtype, ...rest}}) => {
        if (subtype === CONTAINER_LIST) {
            return {
                ...state,
                containerListInProgress: true,
                containerListDisplayError: null
            }
        } else if (subtype === CONTAINER_CREATE_OPTIONS) {
            return {
                ...state,
                containerCreateOptionsInProgress: true,
                containerCreateOptionsDisplayError: null
            }
        } else if (subtype === CONTAINER_UPDATE_OPTIONS) {
            return {
                ...state,
                containerUpdateOptionsInProgress: true,
                containerUpdateOptionsDisplayError: null
            }
        } else if (subtype === CONTAINER_CREATE) {
            return {
                ...state,
                containerCreateInProgress: true,
                containerCreateDisplayError: null
            }
        } else if (subtype === CONTAINER_GET) {
            return {
                ...state,
                containerGetInProgress: true,
                containerGetDisplayError: null
            }
        } else if (subtype === CONTAINER_SETTINGS) {
            return {
                ...state,
                containerSettingsInProgress: true,
                containerSettingsDisplayError: null
            }
        } else if (subtype === CONTAINER_EVENT) {
            return {
                ...state,
                eventId: rest.eventId,
            }
        } else if (subtype === CONTAINER_STATE) {
            return {
                ...state,
                containerStateInProgress: true,
                containerStateDisplayError: null
            }
        } else if (subtype === CONTAINER_PASSWORD) {
            return {
                ...state,
                containerPasswordInProgress: true,
                containerPasswordDisplayError: null
            }
        } else if (subtype === CONTAINER_EVENTS) {
            return {
                ...state,
                containerEventListInProgress: true,
                containerEventListDisplayError: null
            }
        } else if (subtype === CONTAINER_BACKUPS) {
            return {
                ...state,
                containerBackupListInProgress: true,
                containerBackupListDisplayError: null
            }
        } else if (subtype === CONTAINER_BACKUP) {
            return {
                ...state,
                containerBackupInProgress: true,
                containerBackupDisplayError: null
            }
        } else if (subtype === CONTAINER_RESTORE) {
            return {
                ...state,
                containerRestoreInProgress: true,
                containerRestoreDisplayError: null
            }
        } else if (subtype === CONTAINER_BACKUP_DELETE) {
            return {
                ...state,
                containerBackupDeleteInProgress: true,
                containerBackupDeleteDisplayError: null
            }
        } else if (subtype === CONTAINER_DELETE) {
            return {
                ...state,
                containerDeleteInProgress: true,
                containerDeleteDisplayError: null
            }
        } else if (subtype === CONTAINER_STORAGE_OPTIONS) {
            return {
                ...state,
                containerStorageOptionsInProgress: true,
                containerStorageOptionsDisplayError: null
            }
        } else if (subtype === CONTAINER_STORAGE) {
            return {
                ...state,
                containerStorageInProgress: true,
                containerStorageDisplayError: null
            }
        }

        return state;
    },
    [PAGE]: (state, {payload: {subtype, activePage}}) => {
        if (subtype === CONTAINER_LIST) {
            return {
                ...state,
                currentPage: activePage
            }
        }  else if (subtype === CONTAINER_EVENTS) {
            return {
                ...state,
                eventsCurrentPage: activePage
            }
        }  else if (subtype === CONTAINER_BACKUPS) {
            return {
                ...state,
                backupsCurrentPage: activePage
            }
        }
        return state;
    },
    [combineActions(
        CONTAINER_LIST_PAGE_UNLOADED,
        CONTAINER_CREATE_PAGE_UNLOADED,
        CONTAINER_GET_PAGE_UNLOADED,
        CONTAINER_SETTINGS_PAGE_UNLOADED,
        CONTAINER_STATE_PAGE_UNLOADED,
        CONTAINER_PASSWORD_PAGE_UNLOADED,
        CONTAINER_EVENTS_PAGE_UNLOADED,
        CONTAINER_BACKUPS_PAGE_UNLOADED,
        CONTAINER_DELETE_PAGE_UNLOADED,
        CONTAINER_STORAGE_PAGE_UNLOADED)]: (state, action) => {
            return {}
        },
}, {});
