import React from 'react';

import { Grid, 
         Breadcrumb, Header, Menu } from 'semantic-ui-react';

import { connect } from 'react-redux';

import {NavLink, Link} from 'react-router-dom';

const mapStateToProps = state => ({ ...state.profile });

const mapDispatchToProps = dispatch => ({
    
});


class ProfileBase extends React.Component {
    render() {
        let {profile} = this.props;

        return (
            <Grid stackable>
            <Grid.Row>
                <Grid.Column width="16">
                    <Breadcrumb size='small'>
                        <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section active>Profile</Breadcrumb.Section>
                    </Breadcrumb>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column width="16">
                    <Header as='h1'>Manage profile</Header>
                </Grid.Column>
            </Grid.Row>


            {profile && 
                <Grid.Row>
                    <Grid.Column width="16">
                            <Grid stackable>
                                <Grid.Column width={4}>
                                    <Menu fluid vertical tabular>
                                        <NavLink exact to={"/profile"} className="item">Information</NavLink>
                                        <NavLink exact to={"/profile/password"} className="item">Password</NavLink>
                                        <NavLink exact to={"/profile/ssh-keys"} className="item">SSH keys</NavLink>
                                    </Menu>
                                </Grid.Column>

                                <Grid.Column width={12}>
                                    {this.props.children}
                                </Grid.Column>
                            </Grid>
                    </Grid.Column>
                </Grid.Row>
            }
            </Grid>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(ProfileBase);
