import React from 'react';

import {serializeQueryParams} from '../Utils';

import {toast} from 'react-semantic-toasts';

import {
  ASYNC_START,
  CONTAINER_LIST,
  CONTAINER_CREATE_OPTIONS,
  CONTAINER_UPDATE_OPTIONS,
  CONTAINER_CREATE,
  CONTAINER_GET,
  CONTAINER_SETTINGS,
  CONTAINER_EVENT,
  CONTAINER_STATE,
  CONTAINER_PASSWORD,
  CONTAINER_EVENTS,
  CONTAINER_BACKUPS,
  CONTAINER_BACKUP,
  CONTAINER_RESTORE,
  CONTAINER_BACKUP_DELETE,
  CONTAINER_DELETE,
  CONTAINER_STORAGE_OPTIONS,
  CONTAINER_STORAGE,
} from '../constants/actionTypes';

import {api} from '../actions';

export const getContainerList = () => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_LIST}));

    let state = getState();
    let token = state.auth.token;
    let containers = state.containers;
    let currentPage = (containers.currentPage || 1);
    let params = serializeQueryParams({'page': currentPage});

    return api(
      {
        url: 'api/v1.0/containers/?'+params, 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(CONTAINER_LIST({data}));
    }).catch(containerListDisplayError => {
      dispatch(CONTAINER_LIST({containerListDisplayError}));
    });
  }
}



export const getContainerCreateOptions = () => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_CREATE_OPTIONS}));

    let state = getState();
    let token = state.auth.token;
    
    let {profile} = state.profile;

    profile = profile || {};

    let images = api(
      {
        url: 'api/v1.0/images/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    );

    let hosts = []
    if (profile.is_superuser) {
      hosts = api(
        {
          url: 'api/v1.0/hosts/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      );
    }

    let users = [];
    if (profile.is_superuser) {
      users = api(
        {
          url: 'api/v1.0/users/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      );
    }

    let ram_sizes = api(
      {
        url: 'api/v1.0/ram-sizes/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    );

    let disk_sizes = api(
      {
        url: 'api/v1.0/disk-sizes/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    );

    let ssh_keys = api(
      {
        url: 'api/v1.0/ssh-keys/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    );
    
    return Promise.all([images, hosts, users, ram_sizes, disk_sizes, ssh_keys]).then((objects) => {
      let [images, hosts, users, ram_sizes, disk_sizes, ssh_keys] = objects;
      
      dispatch(CONTAINER_CREATE_OPTIONS({
        data: {
          images: images.results, 
          hosts: hosts.results,
          users: users.results,
          ram_sizes: ram_sizes.results,
          disk_sizes: disk_sizes.results,
          ssh_keys: ssh_keys.results,
        }
      }))

    }).catch(containerCreateOptionsDisplayError => {
        dispatch(CONTAINER_CREATE_OPTIONS({containerCreateOptionsDisplayError}));
    });

  }
}


export const createContainer = (data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_CREATE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/', 
        method: "POST", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(CONTAINER_CREATE({data, containerCreateOk: true}));
        toast(
          {
              title: 'Container is being created.',
              description: <p>This should take about 10 seconds.</p>
          },
          () => console.log('toast closed'),
          () => console.log('toast clicked')
        );
    }).catch(containerCreateDisplayError => {
      dispatch(CONTAINER_CREATE({containerCreateDisplayError}));
      throw containerCreateDisplayError;
    });
  }
}


export const getContainer = (containerId) => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_GET}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/'+containerId+'/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(CONTAINER_GET({data}));

        if (data.event_id) {
          dispatch(pollContainerEvent(data.event_id));
        }

        return data

    }).catch(containerGetDisplayError => {
      dispatch(CONTAINER_GET({containerGetDisplayError}));
    });
  }
}


export const getContainerUpdateOptions = () => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_UPDATE_OPTIONS}));

    let state = getState();
    let token = state.auth.token;

    let {profile} = state.profile;
    profile = profile || {};

    let users = []
    if (profile.is_superuser) {
      users = api(
        {
          url: 'api/v1.0/users/', 
          method: "GET", 
          headers: {
            'Authorization': 'Bearer '+token
          },
          form: false,
        }
      );
    }

    let ram_sizes = api(
      {
        url: 'api/v1.0/ram-sizes/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    );
    
    return Promise.all([users, ram_sizes]).then((objects) => {
      let [users, ram_sizes] = objects;
      
      dispatch(CONTAINER_UPDATE_OPTIONS({
        data: {
          users: users.results,
          ram_sizes: ram_sizes.results,
        }
      }))

    }).catch(containerUpdateOptionsDisplayError => {
        dispatch(CONTAINER_UPDATE_OPTIONS({containerUpdateOptionsDisplayError}));
    });

  }
}


export const updateContainer = (containerId, data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_SETTINGS}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/'+containerId+'/', 
        method: "PUT", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(CONTAINER_SETTINGS({data}));
        toast(
            {
                title: 'Container is being updated!',
                description: <p>This should about 5 seconds</p>,
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );

      dispatch(pollContainerEvent(data.event_id));
    }).catch(containerSettingsDisplayError => {
      dispatch(CONTAINER_SETTINGS({containerSettingsDisplayError}));
      throw containerSettingsDisplayError;
    });
  }
}


export const resetContainerPassword = (containerId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_PASSWORD}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/'+containerId+'/password/', 
        method: "PUT", 
        body: {},
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false
      }
    ).then((data)=>{
        dispatch(CONTAINER_PASSWORD({data}));
        toast(
            {
                title: 'We have emailed you new container password!',
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );
    }).catch(containerPasswordDisplayError => {
      dispatch(CONTAINER_PASSWORD({containerPasswordDisplayError}));
    });
  }
}

export const changeContainerState = (containerId, data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_STATE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/'+containerId+'/state/', 
        method: "PUT", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(CONTAINER_STATE({data}));
        toast(
            {
                title: `Container is ${data.state}!`,
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );

      dispatch(pollContainerEvent(data.event_id));
    }).catch(containerSettingsDisplayError => {
      dispatch(CONTAINER_STATE({containerSettingsDisplayError}));
    });
  }
}


export const pollContainerEvent = (eventId) => { 

  // Taken from https://github.com/consbio/cookbook/blob/master/javascript/react-redux/polling-with-redux-thunk-and-promises/io.js

  return (dispatch, getState) => {
    let state = getState();
    let token = state.auth.token;
    
    if (!eventId) return;
    if (state.containers.eventId === eventId) return;

    dispatch(ASYNC_START({subtype: CONTAINER_EVENT, eventId}));
    
    return new Promise(resolve => {  // The promise will resolve when the entire task is complete
      let pollStatus = () => {  // pollStatus is called 1s after the last poll completes
        api(
          {
            url: 'api/v1.0/events/'+eventId+'/', 
            method: "GET", 
            headers: {
              'Authorization': 'Bearer '+token
            },
            form: false,
          }
        ).then(data => {
            if (data.ready) {
                dispatch(CONTAINER_EVENT({eventId: data.id}))
                // At this point, we know the server has completed the task and we can resolve the promise
                if (!data.failed) {
                  resolve(data);
                  
                  if (data.result.task === 'UPDATE_CONTAINER') {
                    dispatch(getContainer(data.result.container_id)).then(() => {
                      toast(
                          {
                              title: 'Container was updated!',
                              time: 10000,
                          },
                          () => console.log('toast closed'),
                          () => console.log('toast clicked')
                      ); 
                    })
                  } else if (data.result.task === 'CREATE_CONTAINER') {
                    dispatch(getContainer(data.result.container_id)).then(() => {
                      toast(
                          {
                              title: 'Container was created!',
                              time: 10000,
                          },
                          () => console.log('toast closed'),
                          () => console.log('toast clicked')
                      ); 
                    })
                  } else if (data.result.task === 'CHANGE_CONTAINER_STATE') {
                    dispatch(getContainer(data.result.container_id)).then((container) => {
                      toast(
                          {
                              title: `Container is now ${container.state}!`,
                              time: 10000,
                          },
                          () => console.log('toast closed'),
                          () => console.log('toast clicked')
                      ); 
                    })
                  } else if (data.result.task === 'BACKUP_CONTAINER') {
                    dispatch(getContainerBackupList(data.result.container_id));
                    dispatch(getContainer(data.result.container_id)).then((container) => {
                      toast(
                          {
                              title: `Container has been backed up.`,
                              time: 10000,
                          },
                          () => console.log('toast closed'),
                          () => console.log('toast clicked')
                      ); 
                    })
                  } else if (data.result.task === 'RESTORE_CONTAINER') {
                    dispatch(getContainerBackupList(data.result.container_id));
                    dispatch(getContainer(data.result.container_id)).then((container) => {
                      toast(
                          {
                              title: `Container has been restored.`,
                              time: 10000,
                          },
                          () => console.log('toast closed'),
                          () => console.log('toast clicked')
                      ); 
                    })
                  } else if (data.result.task === 'DELETE_CONTAINER') {
                    toast(
                        {
                            title: `Container has been deleted.`,
                            time: 10000,
                        },
                        () => console.log('toast closed'),
                        () => console.log('toast clicked')
                    ); 

                    dispatch(CONTAINER_DELETE({containerDeletedId: data.result.container_id}))

                  } else if (data.result.task === 'RESIZE_CONTAINER_STORAGE') {
                    dispatch(getContainer(data.result.container_id)).then((container) => {
                      toast(
                          {
                              title: `Container has been resized.`,
                              time: 10000,
                          },
                          () => console.log('toast closed'),
                          () => console.log('toast clicked')
                      ); 
                    })
                  }
                  
                  
                } else {

                  toast(
                      {
                          title: data.result,
                          time: 10000,
                          type: 'error',
                      },
                      () => console.log('toast closed'),
                      () => console.log('toast clicked')
                  ); 

                }
            }
            else {
                setTimeout(pollStatus, 1000)
            }
          })
      }

      setTimeout(pollStatus, 1000)
  });
  }
}

export const getContainerEventList = (containerId) => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_EVENTS}));

    let state = getState();
    let token = state.auth.token;
    let containers = state.containers;
    let currentPage = (containers.eventsCurrentPage || 1);
    let params = serializeQueryParams({'page': currentPage, 'container': containerId});

    return api(
      {
        url: 'api/v1.0/container-events/?'+params, 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(CONTAINER_EVENTS({data}));
    }).catch(containerEventListDisplayError => {
      dispatch(CONTAINER_EVENTS({containerEventListDisplayError}));
    });

  }
}

export const getContainerBackupList = (containerId) => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_BACKUPS}));

    let state = getState();
    let token = state.auth.token;
    let containers = state.containers;
    let currentPage = (containers.eventsCurrentPage || 1);
    let params = serializeQueryParams({'page': currentPage, 'container': containerId});

    return api(
      {
        url: 'api/v1.0/backups/?'+params, 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(CONTAINER_BACKUPS({data}));
    }).catch(containerBackupListDisplayError => {
      dispatch(CONTAINER_BACKUPS({containerBackupListDisplayError}));
    });
    
  }
}

export const backupContainer = (containerId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_BACKUP}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/'+containerId+'/', 
        method: "PATCH", 
        body: {'action': 'backup'},
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(CONTAINER_BACKUP({data}));
        dispatch(getContainerBackupList(data.id));
        toast(
            {
                title: `Container is ${data.state}!`,
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );

      dispatch(pollContainerEvent(data.event_id));
    }).catch(containerBackupDisplayError => {
      dispatch(CONTAINER_BACKUP({containerBackupDisplayError}));
    });
  }
}

export const restoreContainer = (containerId, backupId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_RESTORE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/'+containerId+'/', 
        method: "PATCH", 
        body: {restore: backupId},
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    ).then((data)=>{
        dispatch(CONTAINER_RESTORE({data}));
        dispatch(getContainerBackupList(data.id));
        toast(
            {
                title: `Container is ${data.state}!`,
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );

      dispatch(pollContainerEvent(data.event_id));
    }).catch(containerRestoreDisplayError => {
      dispatch(CONTAINER_RESTORE({containerRestoreDisplayError}));
    });
  }
}

export const deleteContainer = (containerId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_DELETE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/'+containerId+'/', 
        method: "DELETE",
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false
      }
    ).then((data)=>{
      dispatch(CONTAINER_DELETE({data}));
      dispatch(pollContainerEvent(data.event_id));
    }).catch(containerDeleteDisplayError => {
      dispatch(CONTAINER_DELETE({containerDeleteDisplayError}));
    })
  }
}

export const deleteBackup = (containerId, backupId) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_BACKUP_DELETE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/backups/'+backupId+'/', 
        method: "DELETE",
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false
      }
    ).then((data)=>{
      dispatch(CONTAINER_BACKUP_DELETE({data}));
      dispatch(getContainerBackupList(containerId));
    }).catch(containerBackupDeleteDisplayError => {
      dispatch(CONTAINER_BACKUP_DELETE({containerBackupDeleteDisplayError}));
    })
  }
}


export const getContainerStorageOptions = () => { 
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_STORAGE_OPTIONS}));

    let state = getState();
    let token = state.auth.token;

    let disk_sizes = api(
      {
        url: 'api/v1.0/disk-sizes/', 
        method: "GET", 
        headers: {
          'Authorization': 'Bearer '+token
        },
        form: false,
      }
    );
    
    return Promise.all([disk_sizes]).then((objects) => {
      let [disk_sizes] = objects;
      
      dispatch(CONTAINER_STORAGE_OPTIONS({
        data: {
          disk_sizes: disk_sizes.results,
        }
      }))

    }).catch(containerStorageOptionsDisplayError => {
        dispatch(CONTAINER_STORAGE_OPTIONS({containerStorageOptionsDisplayError}));
    });

  }
}


export const resizeContainerStorage = (containerId, data) => {
  return (dispatch, getState) => {
    dispatch(ASYNC_START({subtype: CONTAINER_STORAGE}));

    let state = getState();
    let token = state.auth.token;

    return api(
      {
        url: 'api/v1.0/containers/'+containerId+'/storage/', 
        method: "PUT", 
        body: data,
        headers: {
          'Authorization': 'Bearer '+token
        },
      }
    ).then((data)=>{
        dispatch(CONTAINER_STORAGE({data}));
        toast(
            {
                title: 'Container is being resized!',
                time: 10000,
            },
            () => console.log('toast closed'),
            () => console.log('toast clicked')
        );

      dispatch(pollContainerEvent(data.event_id));
    }).catch(containerStorageDisplayError => {
      dispatch(CONTAINER_STORAGE({containerStorageDisplayError}));
      throw containerStorageDisplayError;
    });
  }
}