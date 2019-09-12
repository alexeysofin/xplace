import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Feed, Icon, Pagination} from 'semantic-ui-react';

import {CONTAINER_EVENTS_PAGE_UNLOADED, CONTAINER_EVENTS, PAGE} from '../../constants/actionTypes';
import {getContainerEventList} from '../../actions/containers';
import {perPage} from '../../constants/pagination';

import ContainerBase from './ContainerBase';

const mapStateToProps = state => ({ ...state.containers });

const mapDispatchToProps = dispatch => ({
    onLoad: (containerId) => dispatch(getContainerEventList(containerId)),
    onPageChange: (containerId, e, { activePage }) => {
        dispatch(PAGE({activePage, subtype: CONTAINER_EVENTS}))
        dispatch(getContainerEventList(containerId));
    },
    onUnload: () => {
        dispatch(CONTAINER_EVENTS_PAGE_UNLOADED())
    }
});

const ICONS = {
    STARTED: 'play circle',
    STOPPED: 'pause circle',
    PASSWORD_RESET: 'user secret',
    REBOOTED: 'redo',
    BACKED_UP: 'disk',
    RESTORED: 'check circle',
    RESIZED: 'resize horizontal',
    UPDATED: 'resize vertical'
}

const TETXS = {
    STARTED: 'Container was started',
    STOPPED: 'Container was stopped',
    PASSWORD_RESET: 'Password was reset',
    REBOOTED: 'Container was rebooted',
    BACKED_UP: 'Container was backed up',
    RESTORED: 'Container was restored from backup',
    RESIZED: 'Container storage was resized',
    UPDATED: 'Container parameters were updated'
}

class ContainerEvents extends React.Component {
    componentDidMount() {
        this.props.onLoad(this.props.match.params.id);
    }

    onPageChange = (e, { activePage }) => {
        this.props.onPageChange(this.props.match.params.id, e, {activePage})
    }

    render() {
        let {container, events, containerEventListInProgress} = this.props;
        let currentPage = this.props.eventsCurrentPage || 1;
        let totalPages = Math.ceil(((events && events.count) || 0) / perPage);

        return (
            <ContainerBase {...this.props}>
                {container && 
                <div>
                    <Segment attached loading={containerEventListInProgress}>
                        <Header as='h2'>Container events</Header>
                        <Feed>
                            {events && events.results && events.results.length > 0 && events.results.map(event => {
                                return (
                                    <Feed.Event key={event.id}>
                                        <Feed.Label><Icon name={ICONS[event.type] || 'check circle'} /></Feed.Label>
                                        <Feed.Content date={event.created_at} summary={TETXS[event.type] || event.type} />
                                    </Feed.Event>
                                );
                            })}
                        </Feed>
                    </Segment>
                    <Segment padded clearing attached>
                    {events && events.results.length > 0 && 
                        <Pagination disabled={containerEventListInProgress} size="small" onPageChange={this.onPageChange} 
                        floated='right' defaultActivePage={currentPage} totalPages={totalPages} />}
                            
                    </Segment>
                </div>
                }

            </ContainerBase>
        );
    }
}

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(ContainerEvents);
