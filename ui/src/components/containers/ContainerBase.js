import React from 'react';

import { Grid, 
         Breadcrumb, Header, Label, Loader, Menu } from 'semantic-ui-react';

import { connect } from 'react-redux';

import {NavLink, Link, Redirect} from 'react-router-dom';

import {getContainer} from '../../actions/containers';
import {CONTAINER_GET_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => ({ ...state.containers });

const mapDispatchToProps = dispatch => ({
    onLoad: (containerId) => dispatch(getContainer(containerId)),
    onUnload: () => {
        dispatch(CONTAINER_GET_PAGE_UNLOADED())
    }
});


class ContainerBase extends React.Component {
    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    componentWillUnmount() {
        this.props.onUnload();
    }

    render() {

        let {container, containerDeletedId} = this.props;

        return (
            <Grid stackable>
            {this.props.containerGetInProgress && <Loader active></Loader>}

            <Grid.Row>
                <Grid.Column width="16">
                    <Breadcrumb size='small'>
                        <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section as={Link} to="/containers" link>Containers</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section active>{this.props.match.params.id}</Breadcrumb.Section>
                    </Breadcrumb>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column width="13">
                    <Header as='h1'>Manage container</Header>
                </Grid.Column>
                <Grid.Column width="3" textAlign='right'>
                    {container && 
                        <Label color="teal">{container.state} &nbsp;
                        {container.event_id && <Loader inverted inline size="tiny" active />}</Label>}
                </Grid.Column>
            </Grid.Row>


            {this.props.container && 
                <Grid.Row>
                    {(containerDeletedId && containerDeletedId === container.id) && <Redirect to="/containers" />}
                    <Grid.Column width="16">
                            <Grid stackable>
                                <Grid.Column width={4}>
                                    <Menu fluid vertical tabular>
                                        <NavLink exact to={"/containers/"+container.id} className="item">Information</NavLink>
                                        <NavLink to={"/containers/"+container.id+"/settings"} className="item">Settings</NavLink>
                                        <NavLink to={"/containers/"+container.id+"/state"} className="item">Power</NavLink>
                                        <NavLink to={"/containers/"+container.id+"/password"} className="item">Reset password</NavLink>
                                        <NavLink to={"/containers/"+container.id+"/events"} className="item">Events</NavLink>
                                        <NavLink to={"/containers/"+container.id+"/backups"} className="item">Backups</NavLink>
                                        <NavLink to={"/containers/"+container.id+"/storage"} className="item">Storage</NavLink>
                                        <NavLink to={"/containers/"+container.id+"/delete"} className="item">Delete</NavLink>
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

export default connectedRedux(ContainerBase);
