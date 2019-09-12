import React from 'react'

import {
  Dropdown,
  Menu,
  Container,
  Loader,
} from 'semantic-ui-react'

const MainMenu = (props) => {
  let {profile} = props;

  return (
    <Menu stackable inverted borderless attached="top">
      <Container>
          <Menu.Menu position="right">
          <Dropdown item text={profile && profile.email}>
              <Dropdown.Menu>
                  <Dropdown.Item as={NavLink} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Item>Admin</Dropdown.Item>
                  <Dropdown.Item onClick={props.onLogoutClick}>Logout {props.logoutInProgress && <Loader inline size="mini" active />}</Dropdown.Item>
              </Dropdown.Menu>
          </Dropdown>
          </Menu.Menu>
      </Container>
    </Menu>
  )
}

export default MainMenu