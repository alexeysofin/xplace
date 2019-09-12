import React from 'react';

import {Form, Label, Dropdown, Checkbox} from 'semantic-ui-react';

export const FieldContainer = ({meta, input: {value, ...rest_input}, select=false, isInput=false, isTextArea=false, isCheckbox=false, ...props}) => {
    return (
        <Form.Field style={{'textAlign': 'left' }} error={Boolean(meta.error)}>
            {props.label && <label>{props.label}</label>}
            {isInput && <input {...rest_input} value={value} {...props} />}
            {isTextArea && <textarea {...rest_input} value={value} {...props} />}
            {select && <Dropdown selection fluid {...rest_input} value={value} {...props} onChange={(param, data) => rest_input.onChange(data.value)}  />}

            {isCheckbox && <Checkbox
                {...rest_input}
                {...props}
                checked={!!value}
                onChange={(e, data) => rest_input.onChange(data.checked)}
                type="checkbox"
                />
            }

            {meta.error && 
            <Label color='red' basic pointing>{meta.error}</Label>}
        </Form.Field>
    );
}
