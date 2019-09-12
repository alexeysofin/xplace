import React from 'react';

import { Grid, 
         Breadcrumb, Header, Loader, Menu } from 'semantic-ui-react';

import { connect } from 'react-redux';

import {NavLink, Link, Redirect} from 'react-router-dom';

import {getOrganization} from '../../actions/organizations';
import {ORGANIZATION_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => ({ ...state.organizations });

const mapDispatchToProps = dispatch => ({
    onLoad: (organizationId) => dispatch(getOrganization(organizationId)),
    onUnload: () => {
        dispatch(ORGANIZATION_PAGE_UNLOADED())
    }
});


class OrganizationBase extends React.Component {
    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    componentWillUnmount() {
        this.props.onUnload();
    }

    render() {

        let {organization, organizationDeletedId} = this.props;

        return (
            <Grid stackable>
            {this.props.organizationGetInProgress && <Loader active></Loader>}

            <Grid.Row>
                <Grid.Column width="16">
                    <Breadcrumb size='small'>
                        <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section as={Link} to="/organizations" link>Organizations</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section active>{this.props.match.params.id}</Breadcrumb.Section>
                    </Breadcrumb>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column width="16">
                    <Header as='h1'>Manage organization</Header>
                </Grid.Column>
            </Grid.Row>


            {organization && 
                <Grid.Row>
                    {(organizationDeletedId && organizationDeletedId === organization.id) && <Redirect to="/organizations" />}
                    <Grid.Column width="16">
                            <Grid stackable>
                                <Grid.Column width={4}>
                                    <Menu fluid vertical tabular>
                                        <NavLink exact to={"/organizations/"+organization.id} className="item">Information</NavLink>
                                        <NavLink to={"/organizations/"+organization.id+"/settings"} className="item">Settings</NavLink>
                                        <NavLink to={"/organizations/"+organization.id+"/members"} className="item">Members</NavLink>
                                        <NavLink to={"/organizations/"+organization.id+"/delete"} className="item">Delete</NavLink>
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

export default connectedRedux(OrganizationBase);
