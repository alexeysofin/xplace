import {createAction} from 'redux-actions';

export const ASYNC_START = createAction('ASYNC_START');

export const LOGOUT = createAction('LOGOUT');

export const LOGIN = createAction('LOGIN');
export const LOGIN_PAGE_UNLOADED = createAction('LOGIN_PAGE_UNLOADED');

export const REGISTER = createAction('REGISTER');
export const REGISTER_PAGE_UNLOADED = createAction('REGISTER_PAGE_UNLOADED');

export const REGISTER_CONFIRM = createAction('REGISTER_CONFIRM');
export const REGISTER_CONFIRM_PAGE_UNLOADED = createAction('REGISTER_CONFIRM_PAGE_UNLOADED');

export const RESET = createAction('RESET');
export const RESET_PAGE_UNLOADED = createAction('RESET_PAGE_UNLOADED');

export const RESET_CONFIRM = createAction('RESET_CONFIRM');
export const RESET_CONFIRM_PAGE_UNLOADED = createAction('RESET_CONFIRM_PAGE_UNLOADED');

export const PROFILE = createAction('PROFILE');
export const PROFILE_UPDATE = createAction('PROFILE_UPDATE');
export const PROFILE_UPDATE_PASSWORD = createAction('PROFILE_UPDATE_PASSWORD');
export const PRIVATE_PAGE_UNLOADED = createAction('PRIVATE_PAGE_UNLOADED');

export const TOKEN = createAction('TOKEN');

export const CONTAINER_LIST = createAction('CONTAINER_LIST');
export const CONTAINER_LIST_PAGE_UNLOADED = createAction('CONTAINER_LIST_PAGE_UNLOADED');

export const CONTAINER_EVENTS = createAction('CONTAINER_EVENTS');
export const CONTAINER_EVENTS_PAGE_UNLOADED = createAction('CONTAINER_EVENTS_PAGE_UNLOADED');

export const CONTAINER_STORAGE = createAction('CONTAINER_STORAGE');
export const CONTAINER_STORAGE_OPTIONS = createAction('CONTAINER_STORAGE_OPTIONS');
export const CONTAINER_STORAGE_PAGE_UNLOADED = createAction('CONTAINER_STORAGE_PAGE_UNLOADED');

export const CONTAINER_CREATE_OPTIONS = createAction('CONTAINER_CREATE_OPTIONS');
export const CONTAINER_UPDATE_OPTIONS = createAction('CONTAINER_UPDATE_OPTIONS');

export const CONTAINER_CREATE = createAction('CONTAINER_CREATE');
export const CONTAINER_CREATE_PAGE_UNLOADED = createAction('CONTAINER_CREATE_PAGE_UNLOADED');

export const CONTAINER_DELETE = createAction('CONTAINER_DELETE');
export const CONTAINER_DELETE_PAGE_UNLOADED = createAction('CONTAINER_DELETE_PAGE_UNLOADED');

export const CONTAINER_GET = createAction('CONTAINER_GET');
export const CONTAINER_GET_PAGE_UNLOADED = createAction('CONTACONTAINER_GET_PAGE_UNLOADEDINER_GET');

export const CONTAINER_EVENT = createAction('CONTAINER_EVENT');

export const CONTAINER_SETTINGS = createAction('CONTAINER_SETTINGS');
export const CONTAINER_SETTINGS_PAGE_UNLOADED = createAction('CONTAINER_SETTINGS_PAGE_UNLOADED');

export const CONTAINER_STATE = createAction('CONTAINER_STATE');
export const CONTAINER_STATE_PAGE_UNLOADED = createAction('CONTAINER_STATE_PAGE_UNLOADED');

export const CONTAINER_PASSWORD = createAction('CONTAINER_PASSWORD');
export const CONTAINER_PASSWORD_PAGE_UNLOADED = createAction('CONTAINER_PASSWORD_PAGE_UNLOADED');

export const CONTAINER_BACKUP = createAction('CONTAINER_BACKUP');
export const CONTAINER_BACKUP_DELETE = createAction('CONTAINER_BACKUP_DELETE');
export const CONTAINER_RESTORE = createAction('CONTAINER_RESTORE');
export const CONTAINER_BACKUPS = createAction('CONTAINER_BACKUPS');
export const CONTAINER_BACKUPS_PAGE_UNLOADED = createAction('CONTAINER_BACKUPS_PAGE_UNLOADED');

export const SSH_KEY = createAction('SSH_KEY');
export const SSH_KEY_UPDATE = createAction('SSH_KEY_UPDATE');
export const SSH_KEY_LIST = createAction('SSH_KEY_LIST');
export const SSH_KEY_CREATE = createAction('SSH_KEY_CREATE');
export const SSH_KEY_DELETE = createAction('SSH_KEY_DELETE');
export const SSH_KEY_LIST_PAGE_UNLOADED = createAction('SSH_KEY_LIST_PAGE_UNLOADED');
export const SSH_KEY_PAGE_UNLOADED = createAction('SSH_KEY_PAGE_UNLOADED')

export const PAGE = createAction('PAGE');

export const DOMAIN_EVENT = createAction('DOMAIN_EVENT');

export const DOMAIN = createAction('DOMAIN');
export const DOMAIN_PAGE_UNLOADED = createAction('DOMAIN_PAGE_UNLOADED')

export const DOMAIN_SETTINGS = createAction('DOMAIN_SETTINGS');
export const DOMAIN_SETTINGS_PAGE_UNLOADED = createAction('DOMAIN_SETTINGS_PAGE_UNLOADED')

export const DOMAIN_LIST = createAction('DOMAIN_LIST');
export const DOMAIN_LIST_PAGE_UNLOADED = createAction('DOMAIN_LIST_PAGE_UNLOADED');

export const DOMAIN_CREATE_OPTIONS = createAction('DOMAIN_CREATE_OPTIONS');
export const DOMAIN_UPDATE_OPTIONS = createAction('DOMAIN_UPDATE_OPTIONS');

export const DOMAIN_CREATE = createAction('DOMAIN_CREATE');
export const DOMAIN_CREATE_PAGE_UNLOADED = createAction('DOMAIN_CREATE_PAGE_UNLOADED');

export const DOMAIN_DELETE = createAction('DOMAIN_DELETE');
export const DOMAIN_DELETE_PAGE_UNLOADED = createAction('DOMAIN_DELETE_PAGE_UNLOADED');


export const TICKET = createAction('TICKET');
export const TICKET_PAGE_UNLOADED = createAction('TICKET_PAGE_UNLOADED')

export const TICKET_SETTINGS = createAction('TICKET_SETTINGS');
export const TICKET_SETTINGS_PAGE_UNLOADED = createAction('TICKET_SETTINGS_PAGE_UNLOADED')

export const TICKET_LIST = createAction('TICKET_LIST');
export const TICKET_LIST_PAGE_UNLOADED = createAction('TICKET_LIST_PAGE_UNLOADED');

export const TICKET_CREATE_OPTIONS = createAction('TICKET_CREATE_OPTIONS');
export const TICKET_UPDATE_OPTIONS = createAction('TICKET_UPDATE_OPTIONS');

export const TICKET_CREATE = createAction('TICKET_CREATE');
export const TICKET_CREATE_PAGE_UNLOADED = createAction('TICKET_CREATE_PAGE_UNLOADED');

export const TICKET_DELETE = createAction('TICKET_DELETE');
export const TICKET_DELETE_PAGE_UNLOADED = createAction('TICKET_DELETE_PAGE_UNLOADED');

export const TICKET_COMMENT_LIST = createAction('TICKET_COMMENT_LIST');
export const TICKET_COMMENT_DELETE = createAction('TICKET_COMMENT_DELETE');
export const TICKET_COMMENT_CREATE = createAction('TICKET_COMMENT_CREATE');
export const TICKET_COMMENT_UPDATE = createAction('TICKET_COMMENT_UPDATE');
export const TICKET_COMMENT_UPDATE_PAGE_UNLOADED = createAction('TICKET_COMMENT_UPDATE_PAGE_UNLOADED');

export const USER = createAction('USER');
export const USER_PAGE_UNLOADED = createAction('USER_PAGE_UNLOADED')

export const USER_SETTINGS = createAction('USER_SETTINGS');
export const USER_SETTINGS_PAGE_UNLOADED = createAction('USER_SETTINGS_PAGE_UNLOADED')

export const USER_LIST = createAction('USER_LIST');
export const USER_LIST_PAGE_UNLOADED = createAction('USER_LIST_PAGE_UNLOADED');

export const USER_CREATE = createAction('USER_CREATE');
export const USER_CREATE_PAGE_UNLOADED = createAction('USER_CREATE_PAGE_UNLOADED');

export const USER_DELETE = createAction('USER_DELETE');
export const USER_DELETE_PAGE_UNLOADED = createAction('USER_DELETE_PAGE_UNLOADED');

export const USER_PASSWORD = createAction('USER_PASSWORD');
export const USER_PASSWORD_PAGE_UNLOADED = createAction('USER_PASSWORD_PAGE_UNLOADED');


export const ORGANIZATION = createAction('ORGANIZATION');
export const ORGANIZATION_PAGE_UNLOADED = createAction('ORGANIZATION_PAGE_UNLOADED')

export const ORGANIZATION_SETTINGS = createAction('ORGANIZATION_SETTINGS');
export const ORGANIZATION_SETTINGS_PAGE_UNLOADED = createAction('ORGANIZATION_SETTINGS_PAGE_UNLOADED')

export const ORGANIZATION_LIST = createAction('ORGANIZATION_LIST');
export const ORGANIZATION_LIST_PAGE_UNLOADED = createAction('ORGANIZATION_LIST_PAGE_UNLOADED');

export const ORGANIZATION_CREATE_OPTIONS = createAction('ORGANIZATION_CREATE_OPTIONS');
export const ORGANIZATION_UPDATE_OPTIONS = createAction('ORGANIZATION_UPDATE_OPTIONS');

export const ORGANIZATION_CREATE = createAction('ORGANIZATION_CREATE');
export const ORGANIZATION_CREATE_PAGE_UNLOADED = createAction('ORGANIZATION_CREATE_PAGE_UNLOADED');

export const ORGANIZATION_DELETE = createAction('ORGANIZATION_DELETE');
export const ORGANIZATION_DELETE_PAGE_UNLOADED = createAction('ORGANIZATION_DELETE_PAGE_UNLOADED');

export const ORGANIZATION_USER_LIST = createAction('ORGANIZATION_USER_LIST');
export const ORGANIZATION_USER_CREATE = createAction('ORGANIZATION_USER_CREATE');
export const ORGANIZATION_USER_DELETE = createAction('ORGANIZATION_USER_DELETE');

export const ORGANIZATION_USER_LIST_PAGE_UNLOADED = createAction('ORGANIZATION_USER_LIST_PAGE_UNLOADED')