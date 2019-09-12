import React from 'react';

import { connect } from 'react-redux';

import {Header, Grid, Segment} from 'semantic-ui-react';

import {getOrganizationUserList} from '../../actions/organizations';

import OrganizationBase from './OrganizationBase';

const mapStateToProps = state => ({ ...state.organizations });

const mapDispatchToProps = dispatch => ({
    onLoad: (organizationId) => dispatch(getOrganizationUserList(organizationId)),
});

class OrganizationInfo extends React.Component {
    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    render() {
        let {organization, organizationUserList} = this.props;


        return (
            <OrganizationBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {organization &&     
                <Segment>
                    <Header as='h2'>Information</Header>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={8}>
                                <Header className="definition" as='h4'>Name</Header>
                                <p>{organization.name}</p>
                                <Header className="definition" as='h4'>Owner</Header>
                                <p>{String(organization.owner_email)}</p>
                                <Header className="definition" as='h4'>Created at</Header>
                                <p>{String(organization.created_at)}</p>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Header className="definition" as='h4'>Users</Header>
                                {organizationUserList && organizationUserList.results && organizationUserList.results.length > 0 
                                    && organizationUserList.results.map((orgUser) => {
                                        return <p>{orgUser.user_email}</p>
                                    })}
                                
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                }

            </OrganizationBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(OrganizationInfo);
