import React from 'react';

import { Form, Grid, 
         Breadcrumb, Header, Button, Segment } from 'semantic-ui-react';

import { Redirect, Link } from 'react-router-dom';

import { connect } from 'react-redux';
import {reduxForm, Field} from 'redux-form';

import {getDomainCreateOptions, createDomain} from '../../actions/domains';
import {FieldContainer} from '../presentational/field';
import {DOMAIN_CREATE_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => {
    let {profile} = state.profile;

    return {
        ...state.domains,
        profile: profile || {},
        initialValues: {
            destination_http_port: "80",
            destination_https_port: "443",
        }
   }
}

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getDomainCreateOptions()),
    onSubmit: (data) => dispatch(createDomain(data)),
    onUnload: () => {
        dispatch(DOMAIN_CREATE_PAGE_UNLOADED())
    }
});


class DomainCreate extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    submitForm = values => {
        return this.props.onSubmit(values);        
    }

    render() {
        let {createOptions, profile} = this.props;
        
        let reverseProxiesOptions = []
        if (createOptions && createOptions.reverse_proxies) {
            reverseProxiesOptions = createOptions.reverse_proxies.map((rv) => {
                return { key: rv.id, text: rv.hostname, value: rv.id };
            });
        }

        let userOptions = []
        if (createOptions && createOptions.users) {
            userOptions = createOptions.users.map((user) => {
                return { key: user.id, text: user.email, value: user.id };
            });
        }

        return (
            <div>
            {this.props.domainCreated && <Redirect to={"/domains/"+this.props.domainCreated.id}></Redirect>}
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        <Breadcrumb size='small'>
                            <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section as={Link} to="/domains" link>Domains</Breadcrumb.Section>
                            <Breadcrumb.Divider icon='right chevron' />
                            <Breadcrumb.Section active>Create</Breadcrumb.Section>
                        </Breadcrumb>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Header as='h1'>Create domain</Header>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width="16">
                    <Segment>
                        <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                            <Field label="Domain name" name="name" component={FieldContainer} isInput={true} placeholder='Domain name' type="text" />
                            <Field label="Include sub-domains" name="include_sub_domains" component={FieldContainer} isCheckbox={true} placeholder='Include sub-domains' type="text" />
                            <Field label="Destination IP" name="destination_ip" component={FieldContainer} isInput={true} placeholder='Destination IP' type="text" />
                            <Field label="Destination HTTP port" name="destination_http_port" component={FieldContainer} isInput={true} placeholder='Destination HTTP port' type="text" />
                            <Field label="Destination HTTPs port" name="destination_https_port" component={FieldContainer} isInput={true} placeholder='Destination HTTPs port' type="text" />
                            {profile.is_superuser && <Field label="Reverse proxy" name="reverse_proxy" component={FieldContainer} options={reverseProxiesOptions} select={true} placeholder='Reverse proxy' />}
                            {profile.is_superuser && <Field label="User" name="user" component={FieldContainer} options={userOptions} select={true} placeholder='User' />}
                            <Button primary type='submit'>Submit</Button>
                        </Form>
                    </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            </div>
        );
    }
}

const connectedForm = reduxForm({
    form: 'domain-create',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(DomainCreate));
