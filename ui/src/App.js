import React, { Component } from 'react';

import { Route, Switch, HashRouter } from 'react-router-dom';

// import logo from './logo.svg';
import './App.css';

import { SemanticToastContainer } from 'react-semantic-toasts';

import Main from './components/Main';
import Private from './components/Private';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RegisterConfirm from './components/auth/RegisterConfirm';
import Reset from './components/auth/Reset';
import ResetConfirm from './components/auth/ResetConfirm';

import ContainerList from './components/containers/ContainerList';
import ContainerCreate from './components/containers/ContainerCreate';
import ContainerInfo from './components/containers/ContainerInfo';
import ContainerSettings from './components/containers/ContainerSettings';
import ContainerState from './components/containers/ContainerState';
import ContainerPassword from './components/containers/ContainerPassword';
import ContainerEvents from './components/containers/ContainerEvents';
import ContainerBackups from './components/containers/ContainerBackups';
import ContainerStorage from './components/containers/ContainerStorage';
import ContainerDelete from './components/containers/ContainerDelete';

import ProfileInfo from './components/profile/ProfileInfo';
import ProfilePassword from './components/profile/ProfilePassword';
import SshKeyList from './components/profile/SshKeyList';
import SshKeyUpdate from './components/profile/SshKeyUpdate';

import DomainList from './components/domains/DomainList';
import DomainCreate from './components/domains/DomainCreate';
import DomainInfo from './components/domains/DomainInfo';
import DomainSettings from './components/domains/DomainSettings';
import DomainDelete from './components/domains/DomainDelete';

import TicketList from './components/tickets/TicketList';
import TicketCreate from './components/tickets/TicketCreate';
import TicketInfo from './components/tickets/TicketInfo';
import TicketSettings from './components/tickets/TicketSettings';
import TicketDelete from './components/tickets/TicketDelete';

import UserList from './components/users/UserList';
import UserCreate from './components/users/UserCreate';
import UserInfo from './components/users/UserInfo';
import UserSettings from './components/users/UserSettings';
import UserDelete from './components/users/UserDelete';
import UserPassword from './components/users/UserPassword';

import OrganizationList from './components/organizations/OrganizationList';
import OrganizationCreate from './components/organizations/OrganizationCreate';
import OrganizationInfo from './components/organizations/OrganizationInfo';
import OrganizationSettings from './components/organizations/OrganizationSettings';
import OrganizationMembers from './components/organizations/OrganizationMembers';
import OrganizationDelete from './components/organizations/OrganizationDelete';


class App extends Component {
  render() {
    return (
        <div>
            <SemanticToastContainer/>
            <HashRouter>
              <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/register-confirm" component={RegisterConfirm} />
                <Route exact path="/reset" component={Reset} />
                <Route exact path="/reset-confirm" component={ResetConfirm} />

                <Private>
                  <Main>
                    <Switch>
                      <Route exact path="/" component={ContainerList} />  
                      <Route exact path="/containers" component={ContainerList} />  
                      <Route exact path="/containers/create" component={ContainerCreate} />  
                      <Route exact path="/containers/:id/settings" component={ContainerSettings} />  
                      <Route exact path="/containers/:id/state" component={ContainerState} />  
                      <Route exact path="/containers/:id/password" component={ContainerPassword} />
                      <Route exact path="/containers/:id/events" component={ContainerEvents} />
                      <Route exact path="/containers/:id/backups" component={ContainerBackups} />
                      <Route exact path="/containers/:id/delete" component={ContainerDelete} />
                      <Route exact path="/containers/:id/storage" component={ContainerStorage} />
                      <Route exact path="/containers/:id" component={ContainerInfo} />  

                      <Route exact path="/profile" component={ProfileInfo} />  
                      <Route exact path="/profile/password" component={ProfilePassword} />  
                      <Route exact path="/profile/ssh-keys" component={SshKeyList} />  
                      <Route exact path="/profile/ssh-keys/:id" component={SshKeyUpdate} />  
                      
                      <Route exact path="/domains" component={DomainList} />  
                      <Route exact path="/domains/create" component={DomainCreate} />  
                      <Route exact path="/domains/:id/settings" component={DomainSettings} />  
                      <Route exact path="/domains/:id/delete" component={DomainDelete} />  
                      <Route exact path="/domains/:id" component={DomainInfo} />  

                      <Route exact path="/tickets" component={TicketList} />  
                      <Route exact path="/tickets/create" component={TicketCreate} />  
                      <Route exact path="/tickets/:id/settings" component={TicketSettings} />  
                      <Route exact path="/tickets/:id/delete" component={TicketDelete} />  
                      <Route exact path="/tickets/:id" component={TicketInfo} />  

                      <Route exact path="/users" component={UserList} />  
                      <Route exact path="/users/create" component={UserCreate} />  
                      <Route exact path="/users/:id/settings" component={UserSettings} />  
                      <Route exact path="/users/:id/password" component={UserPassword} />  
                      <Route exact path="/users/:id/delete" component={UserDelete} />  
                      <Route exact path="/users/:id" component={UserInfo} />  

                      <Route exact path="/organizations" component={OrganizationList} />  
                      <Route exact path="/organizations/create" component={OrganizationCreate} />  
                      <Route exact path="/organizations/:id/settings" component={OrganizationSettings} />  
                      <Route exact path="/organizations/:id/members" component={OrganizationMembers} />  
                      <Route exact path="/organizations/:id/delete" component={OrganizationDelete} />  
                      <Route exact path="/organizations/:id" component={OrganizationInfo} />  

                    </Switch>
                  </Main>
                </Private>
              </Switch>
            </HashRouter>
        </div>
    );
  }
}

export default App;
