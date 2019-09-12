import { combineReducers } from 'redux';
import auth from './auth';
import profile from './profile';
import containers from './containers';
import sshKeys from './ssh_keys';
import domains from './domains';
import tickets from './tickets';
import users from './users';
import organizations from './organizations';
import { reducer as form } from 'redux-form';

export default combineReducers({
  auth,
  form,
  profile,
  containers,
  sshKeys,
  domains,
  tickets,
  users,
  organizations
})