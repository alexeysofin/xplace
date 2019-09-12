import React from 'react';

import { connect } from 'react-redux';
import { Container, Segment, Sidebar, Menu, Image, Dropdown, Loader, Icon } from 'semantic-ui-react';

import {NavLink} from 'react-router-dom';

import { SemanticToastContainer } from 'react-semantic-toasts';

import {logout} from '../actions/auth'

const mapStateToProps = state => ({ ...state.profile });

const mapDispatchToProps = dispatch => ({
    onLogoutClick: () => dispatch(logout()),
});

class Main extends React.Component {
    state = { visible: true }

    handleToggleClick = () => this.setState({ visible: !this.state.visible })
    handleSidebarHide = () => this.setState({ visible: false })

    render() {
        let {profile} = this.props;

        return (
            <div>
                <Sidebar.Pushable basic as={Segment}>
                <Sidebar
                    as={Menu}
                    size="large"
                    animation='overlay'
                    direction='left'
                    inverted
                    vertical
                    visible={this.state.visible}
                >
                    <Menu.Item as='a' header className="borderless phantasm">
                        xplace
                    </Menu.Item>
                    <Menu.Item>
                        <Menu inverted>
                            <Menu.Item as='a' onClick={this.handleToggleClick}>
                                Hide side bar <Icon name="sidebar" />
                            </Menu.Item>
                        </Menu>
                    </Menu.Item>
                    <Menu.Item>
                        Compute
                        <Menu size="large" inverted vertical>
                            <Menu.Item as={NavLink} to="/containers">Containers</Menu.Item>
                        </Menu>
                    </Menu.Item>
                    <Menu.Item>
                        Network
                        <Menu size="large" inverted vertical>
                            <Menu.Item as={NavLink} to="/domains">Domains</Menu.Item>
                        </Menu>
                    </Menu.Item>
                    <Menu.Item>
                        Support
                        <Menu size="large" inverted vertical>
                            <Menu.Item as={NavLink} to="/tickets">Tickets</Menu.Item>
                        </Menu>
                    </Menu.Item>
                    {profile.is_superuser && 
                    <Menu.Item>
                        Users
                        <Menu size="large" inverted vertical>
                            <Menu.Item as={NavLink} to="/users">Users</Menu.Item>
                            <Menu.Item as={NavLink} to="/organizations">Organizations</Menu.Item>
                        </Menu>
                    </Menu.Item>
                    }
                </Sidebar>
                <Sidebar.Pusher dimmed={false}>
                    <Menu inverted stackable borderless attached="top">
                            <Menu inverted borderless>
                            <Menu.Item as='a' onClick={this.handleToggleClick}>
                                <Icon name='sidebar' size="large" />
                            </Menu.Item>
                        </Menu>
                        <Menu.Menu position="right">
                        <Dropdown item text={profile && profile.email}>
                            <Dropdown.Menu>
                                <Dropdown.Item as={NavLink} to="/profile">Profile</Dropdown.Item>
                                <Dropdown.Item onClick={this.props.onLogoutClick}>Logout {this.props.logoutInProgress && <Loader inline size="mini" active />}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        </Menu.Menu>
                    </Menu>
                    <Container basic as={Segment}>
                        {this.props.children}
                    </Container>
                </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps,
    mapDispatchToProps
)

export default connectedRedux(Main);