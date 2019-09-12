import React from 'react';

import {serializeQueryParams} from '../Utils';

import {toast} from 'react-semantic-toasts';

import {api} from '../actions';

import {
    ASYNC_START,
    ORGANIZATION_LIST,
    ORGANIZATION_CREATE_OPTIONS,
    ORGANIZATION_CREATE, 
    ORGANIZATION,
    ORGANIZATION_DELETE,
    ORGANIZATION_SETTINGS,
    ORGANIZATION_UPDATE_OPTIONS,
    ORGANIZATION_USER_LIST,
    ORGANIZATION_USER_DELETE,
    ORGANIZATION_USER_CREATE,
} from '../constants/actionTypes';


export const getOrganizationList = () => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_LIST}));

    let state = getState();
    let token = state.auth.token;
    let organizations = state.organizations;
    let currentPage = (organizations.currentPage || 1);
    let params = serializeQueryParams({'page': currentPage});

    return api(
      {
        url: 'api/v1.0/organizations/?'+params, 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(ORGANIZATION_LIST({data}));
    }).catch(organizationListDisplayError => {
      dispatch(ORGANIZATION_LIST({organizationListDisplayError}));
    });
  }
}


export const getOrganizationCreateOptions = () => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_CREATE_OPTIONS}));

    let state = getState();
    let token = state.auth.token;

    let users = api(
      {
        url: 'api/v1.0/users/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    );

    return Promise.all([users]).then((objects) => {
      let [users] = objects;
      
      dispatch(ORGANIZATION_CREATE_OPTIONS({
        data: {
          users: users.results,
        }
      }))

    }).catch(organizationCreateOptionsDisplayError => {
        dispatch(ORGANIZATION_CREATE_OPTIONS({organizationCreateOptionsDisplayError}));
    });

  }
}


export const getOrganizationUpdateOptions = () => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_UPDATE_OPTIONS}));

    let state = getState();
    let token = state.auth.token;

    let users = api(
      {
        url: 'api/v1.0/users/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    );

    return Promise.all([users]).then((objects) => {
      let [users] = objects;
      
      dispatch(ORGANIZATION_UPDATE_OPTIONS({
        data: {
          users: users.results,
        }
      }))

    }).catch(organizationUpdateOptionsDisplayError => {
        dispatch(ORGANIZATION_UPDATE_OPTIONS({organizationUpdateOptionsDisplayError}));
    });

  }
}

export const createOrganization = (data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_CREATE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/organizations/', 
        method: "POST", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(ORGANIZATION_CREATE({data, organizationCreateOk: true}));
        toast(
          {
              title: 'Organization has been created.',
              time: 10000
          },
          () => console.log('toast closed'),
          () => console.log('toast clicked')
        );
    }).catch(organizationCreateDisplayError => {
      dispatch(ORGANIZATION_CREATE({organizationCreateDisplayError}));
      throw organizationCreateDisplayError;
    });
  }
}


export const getOrganization = (organizationId) => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/organizations/'+organizationId+'/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(ORGANIZATION({data}));
        return data

    }).catch(organizationDisplayError => {
      dispatch(ORGANIZATION({organizationDisplayError}));
    });
  }
}


export const updateOrganization = (organizationId, data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_SETTINGS}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/organizations/'+organizationId+'/', 
        method: "PUT", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(ORGANIZATION_SETTINGS({data}));
        toast(
            {
                title: 'Organization has been updated!',
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );
    }).catch(organizationSettingsDisplayError => {
      dispatch(ORGANIZATION_SETTINGS({organizationSettingsDisplayError}));
      throw organizationSettingsDisplayError;
    });
  }
}

export const deleteOrganization = (organizationId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_DELETE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/organizations/'+organizationId+'/', 
        method: "DELETE",
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false
      }
    ).then(()=>{
      dispatch(ORGANIZATION_DELETE({organizationDeletedId: organizationId}));
      toast(
        {
            title: 'Organization has been deleted!',
            time: 10000,
        },
        () => console.log('toast closed'),
        () => console.log('toast clicked')
    );
    }).catch(organizationDeleteDisplayError => {
      dispatch(ORGANIZATION_DELETE({organizationDeleteDisplayError}));
    })
  }
}


export const getOrganizationUserList = (organizationId) => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_USER_LIST}));

    let state = getState();
    let token = state.auth.token;
    let organizations = state.organizations;
    let currentPage = (organizations.organizationUserListcurrentPage || 1);
    let params = serializeQueryParams({'page': currentPage, 'organization': organizationId});

    return api(
      {
        url: 'api/v1.0/organization-memberships/?'+params, 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(ORGANIZATION_USER_LIST({data}));
    }).catch(organizationListDisplayError => {
      dispatch(ORGANIZATION_USER_LIST({organizationListDisplayError}));
    });
  }
}


export const deleteOrganizationUser = (deleteOrganizationUserId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_USER_DELETE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/organization-memberships/'+deleteOrganizationUserId+'/', 
        method: "DELETE",
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false
      }
    ).then(()=>{
      dispatch(ORGANIZATION_USER_DELETE({organizationUserDeletedId: deleteOrganizationUserId}));
      toast(
        {
            title: 'Organization user has been deleted!',
            time: 10000,
        },
        () => console.log('toast closed'),
        () => console.log('toast clicked')
    );
    }).catch(organizationUserDeleteDisplayError => {
      dispatch(ORGANIZATION_USER_DELETE({organizationUserDeleteDisplayError}));
    })
  }
}

export const createOrganizationUser = (data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: ORGANIZATION_USER_CREATE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/organization-memberships/', 
        method: "POST", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(ORGANIZATION_CREATE({data, organizationUserCreateOk: true}));
        toast(
          {
              title: 'Organization user has been created.',
              time: 10000
          },
          () => console.log('toast closed'),
          () => console.log('toast clicked')
        );
    }).catch(organizationUserCreateDisplayError => {
      dispatch(ORGANIZATION_CREATE({organizationUserCreateDisplayError}));
      throw organizationUserCreateDisplayError;
    });
  }
}