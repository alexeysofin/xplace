import React from 'react';

import { connect } from 'react-redux';

import {Header, Grid, Segment} from 'semantic-ui-react';

import UserBase from './UserBase';

const mapStateToProps = state => ({ ...state.users });

const mapDispatchToProps = dispatch => ({
    
});

class UserInfo extends React.Component {
    render() {
        let {user} = this.props;

        return (
            <UserBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {user &&     
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={5}>
                                <Header className="definition" as='h4'>Email</Header>
                                <p>{user.email}</p>
                                <Header className="definition" as='h4'>Created at</Header>
                                <p>{String(user.date_joined)}</p>
                                <Header className="definition" as='h4'>Last login</Header>
                                <p>{String(user.last_login)}</p>
                            </Grid.Column>
                            <Grid.Column width={5}>
                                <Header className="definition" as='h4'>Fist name</Header>
                                <p>{user.fist_name}</p>
                                <Header className="definition" as='h4'>Last name</Header>
                                <p>{user.last_name}</p>
                                <Header className="definition" as='h4'>Language</Header>
                                <p>{user.language}</p>
                            </Grid.Column>
                            <Grid.Column width={5}>
                                <Header className="definition" as='h4'>RAM</Header>
                                <p>{user.available_ram}MB</p>
                                <Header className="definition" as='h4'>Disk size</Header>
                                <p>{user.available_disk_size}GB</p>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                }

            </UserBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(UserInfo);
