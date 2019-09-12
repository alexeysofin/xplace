import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {updateDomain, getDomainUpdateOptions} from '../../actions/domains';
import {DOMAIN_SETTINGS_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import DomainBase from './DomainBase';

const mapStateToProps = state => {    
    let {domain} = state.domains;

    let {profile} = state.profile;

    return {
        ...state.domains,
        profile: profile || {},
        initialValues: {
            name: (domain && domain.name),
            user: (domain && domain.user),
            include_sub_domains: (domain && domain.include_sub_domains),
            destination_ip: (domain && domain.destination_ip),
            destination_http_port: (domain && domain.destination_http_port),
            destination_https_port: (domain && domain.destination_https_port),
        },
    };
};

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getDomainUpdateOptions()),
    onSubmit: (domainId, data) => dispatch(updateDomain(domainId, data)),
    onUnload: () => {
        dispatch(DOMAIN_SETTINGS_PAGE_UNLOADED())
    }
});


class DomainSettings extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }
    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    render() {
        let {domain, profile} = this.props;

        let {updateOptions} = this.props;
        
        let userOptions = []
        if (updateOptions && updateOptions.users) {
            userOptions = updateOptions.users.map((user) => {
                return { key: user.id, text: user.email, value: user.id };
            });
        }

        return (
            <DomainBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {domain && 
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                        <Field label="Domain name" name="name" component={FieldContainer} isInput={true} placeholder='Domain name' type="text" />
                        <Field label="Include sub-domains" name="include_sub_domains" component={FieldContainer} isCheckbox={true} placeholder='Include sub-domains' type="text" />
                        <Field label="Destination IP" name="destination_ip" component={FieldContainer} isInput={true} placeholder='Destination IP' type="text" />
                        <Field label="Destination HTTP port" name="destination_http_port" component={FieldContainer} isInput={true} placeholder='Destination HTTP port' type="text" />
                        <Field label="Destination HTTPs port" name="destination_https_port" component={FieldContainer} isInput={true} placeholder='Destination HTTPs port' type="text" />                
                        {profile.is_superuser && <Field label="User" name="user" component={FieldContainer} options={userOptions} select={true} placeholder='User' />}
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </DomainBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'domain-settings',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(DomainSettings));
