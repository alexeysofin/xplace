import fetch from 'cross-fetch';
import SubmissionError from 'redux-form/lib/SubmissionError';

import {toast} from 'react-semantic-toasts';

import {REACT_APP_API_BASE_URL} from '../settings';

export const delay = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  })
}

export const api = ({url, method='POST', body, headers={}, form=true}) => {
  return fetch(`${REACT_APP_API_BASE_URL}${url}`, {
      method: method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }).then((response) => {
      if (response.ok) {
        if (response.status === 204) {
          return {}
        }
        return response.json().then(data=> {
          return data
        }, (decodeError) => {
          throw decodeError.message
        })
      } else {
        return response.json().then((data) => {
          let error = data.non_field_errors;

          if (!error) {
            error = response.statusText;
          }

          if (form) {
            let err = new SubmissionError({...data})
            err.message = error;
            throw err;
          } else {
            throw new Error(error);
          }
        }
        )
        // .catch((err) => {
        //   throw err;
        // })
      }
      
    })
    .then(data => {
      return data;
    })
    .catch((displayError) => {
      toast(
        {
            title: displayError.message,
            type: 'error',
            time: 10000
        },
        () => console.log('toast closed'),
        () => console.log('toast clicked')
      );
      throw displayError;
    })
}
