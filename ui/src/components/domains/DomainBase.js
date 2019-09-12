import React from 'react';

import { Grid, 
         Breadcrumb, Header, Label, Loader, Menu } from 'semantic-ui-react';

import { connect } from 'react-redux';

import {NavLink, Link, Redirect} from 'react-router-dom';

import {getDomain} from '../../actions/domains';
import {DOMAIN_PAGE_UNLOADED} from '../../constants/actionTypes';

const mapStateToProps = state => ({ ...state.domains });

const mapDispatchToProps = dispatch => ({
    onLoad: (domainId) => dispatch(getDomain(domainId)),
    onUnload: () => {
        dispatch(DOMAIN_PAGE_UNLOADED())
    }
});


class DomainBase extends React.Component {
    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    componentWillUnmount() {
        this.props.onUnload();
    }

    render() {

        let {domain, domainDeletedId} = this.props;

        return (
            <Grid stackable>
            {this.props.domainGetInProgress && <Loader active></Loader>}

            <Grid.Row>
                <Grid.Column width="16">
                    <Breadcrumb size='small'>
                        <Breadcrumb.Section as={Link} to="/" link>Home</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section as={Link} to="/domains" link>Domains</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right chevron' />
                        <Breadcrumb.Section active>{this.props.match.params.id}</Breadcrumb.Section>
                    </Breadcrumb>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column width="13">
                    <Header as='h1'>Manage domain</Header>
                </Grid.Column>
                <Grid.Column width="3" textAlign='right'>
                    {domain && 
                        <Label color="teal">{domain.state} &nbsp;
                        {domain.event_id && <Loader inverted inline size="tiny" active />}</Label>}
                </Grid.Column>
            </Grid.Row>


            {this.props.domain && 
                <Grid.Row>
                    {(domainDeletedId && domainDeletedId === domain.id) && <Redirect to="/domains" />}
                    <Grid.Column width="16">
                            <Grid stackable>
                                <Grid.Column width={4}>
                                    <Menu fluid vertical tabular>
                                        <NavLink exact to={"/domains/"+domain.id} className="item">Information</NavLink>
                                        <NavLink to={"/domains/"+domain.id+"/settings"} className="item">Settings</NavLink>
                                        <NavLink to={"/domains/"+domain.id+"/delete"} className="item">Delete</NavLink>
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

export default connectedRedux(DomainBase);
