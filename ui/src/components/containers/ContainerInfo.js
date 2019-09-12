import React from 'react';

import { connect } from 'react-redux';

import {Header, Grid, Segment} from 'semantic-ui-react';

import ContainerBase from './ContainerBase';

const mapStateToProps = state => {
    let {profile} = state.profile;

    return { ...state.containers, profile: (profile || {}) }
};

class ContainerInfo extends React.Component {
    render() {
        let {container, profile} = this.props;

        return (
            <ContainerBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {container && 
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Grid>
                        <Grid.Column width={5}>
                            <Header className="definition" as='h4'>Hostname</Header>
                            <p>{container.hostname}</p>
                            <Header className="definition" as='h4'>Image</Header>
                            <p>{container.image_name}</p>
                            <Header className="definition" as='h4'>State</Header>
                            <p>{container.state}</p>
                            {profile.is_superuser && <Header className="definition" as='h4'>Host</Header>}
                            {profile.is_superuser && <p>{container.host_hostname}</p>}
                        </Grid.Column>
                        <Grid.Column width={5}>
                            <Header className="definition" as='h4'>SSH Public IP</Header>
                            <p>{container.host_public_ipv4}</p>
                            <Header className="definition" as='h4'>SSH Public PORT</Header>
                            <p>{container.ssh_port || "Known after first boot"}</p>
                            <Header className="definition" as='h4'>Public IP</Header>
                            <p>{container.public_ipv4 || "none"}</p>
                            <Header className="definition" as='h4'>Private IP</Header>
                            <p>{container.private_ipv4 || "Known after first boot"}</p>
                        </Grid.Column>
                        <Grid.Column width={6}>
                        <Header className="definition" as='h4'>RAM</Header>
                            <p>{container.ram} MB</p>
                            <Header className="definition" as='h4'>Disk size</Header>
                            <p>{container.disk_size} GB</p>
                            {profile.is_superuser && <Header className="definition" as='h4'>CPUs</Header>}
                            {profile.is_superuser && <p>{container.cpus}</p>}
                            <Header className="definition" as='h4'>CPU count</Header>
                            <p>{container.num_cpus}</p>
                            {profile.is_superuser && <Header className="definition" as='h4'>User</Header>}
                            {profile.is_superuser && <p>{container.user_email}</p>}
                        </Grid.Column>
                    </Grid>
                </Segment>
                }

            </ContainerBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
)

export default connectedRedux(ContainerInfo);
