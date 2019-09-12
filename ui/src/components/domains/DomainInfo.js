import React from 'react';

import { connect } from 'react-redux';

import {Header, Grid, Segment} from 'semantic-ui-react';

import DomainBase from './DomainBase';

const mapStateToProps = state => {
    let {profile} = state.profile;

    return { ...state.domains, profile: profile || {}};
};

class DomainInfo extends React.Component {
    render() {
        let {domain, profile} = this.props;

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
                    <Grid>
                        <Grid.Column width={5}>
                            <Header className="definition" as='h4'>Name</Header>
                            <p>{domain.name}</p>
                            <Header className="definition" as='h4'>Include sub-domains</Header>
                            <p>{String(domain.include_sub_domains)}</p>
                            <Header className="definition" as='h4'>Public IP</Header>
                            <p>{domain.reverse_proxy_public_ipv4}</p>
                        </Grid.Column>
                        <Grid.Column width={5}>
                            <Header className="definition" as='h4'>Destination IP</Header>
                            <p>{domain.destination_ip}</p>
                            <Header className="definition" as='h4'>Destination HTTP port</Header>
                            <p>{domain.destination_http_port}</p>
                            <Header className="definition" as='h4'>Destination HTTPs port</Header>
                            <p>{domain.destination_https_port}</p>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            {profile.is_superuser && <Header className="definition" as='h4'>User</Header>}
                            {profile.is_superuser && <p>{domain.user_email}</p>}
                        </Grid.Column>
                    </Grid>
                </Segment>
                }

            </DomainBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
)

export default connectedRedux(DomainInfo);
