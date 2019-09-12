import React from 'react';

import { Grid, 
         Breadcrumb, Header, Loader, Menu } from 'semantic-ui-react';

import { connect } from 'react-redux';

import {NavLink, Link, Redirect} from 'react-router-dom';

import {getUser} from '../../actions/users';
import {USER_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => ({ ...state.users });

const mapDispatchToProps = dispatch => ({
    onLoad: (userId) => dispatch(getUser(userId)),
    onUnload: () => {
        dispatch(USER_PAGE_UNLOADED())
    }
});


class UserBase extends React.Component {
    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    componentWillUnmount() {
        this.props.onUnload();
    }

    render() {

        let {user, userDeletedId} = this.props;

        return (
            <Grid stackable>
            {this.props.userGetInProgress && <Loader active></Loader>}

            <Grid.Row>
                <Grid.Column width="16">
                    <Breadcrumb size='small'>
                        <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section as={Link} to="/users" link>Users</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section active>{this.props.match.params.id}</Breadcrumb.Section>
                    </Breadcrumb>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column width="16">
                    <Header as='h1'>Manage user</Header>
                </Grid.Column>
            </Grid.Row>


            {user && 
                <Grid.Row>
                    {(userDeletedId && userDeletedId === user.id) && <Redirect to="/users" />}
                    <Grid.Column width="16">
                            <Grid stackable>
                                <Grid.Column width={4}>
                                    <Menu fluid vertical tabular>
                                        <NavLink exact to={"/users/"+user.id} className="item">Information</NavLink>
                                        <NavLink to={"/users/"+user.id+"/settings"} className="item">Settings</NavLink>
                                        <NavLink to={"/users/"+user.id+"/password"} className="item">Password</NavLink>
                                        <NavLink to={"/users/"+user.id+"/delete"} className="item">Delete</NavLink>
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

export default connectedRedux(UserBase);
