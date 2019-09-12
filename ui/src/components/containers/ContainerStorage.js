import React from 'react';

import { connect } from 'react-redux';

import {Header, Segment, Form, Button} from 'semantic-ui-react';

import {reduxForm, Field} from 'redux-form';

import {resizeContainerStorage, getContainerStorageOptions} from '../../actions/containers';
import {CONTAINER_SETTINGS_PAGE_UNLOADED} from '../../constants/actionTypes';
import {FieldContainer} from '../presentational/field';

import ContainerBase from './ContainerBase';

const mapStateToProps = state => {    
    return {
        ...state.containers,
    };
};

const mapDispatchToProps = dispatch => ({
    onLoad: () => dispatch(getContainerStorageOptions()),
    onSubmit: (containerId, data) => dispatch(resizeContainerStorage(containerId, data)),
    onUnload: () => {
        dispatch(CONTAINER_SETTINGS_PAGE_UNLOADED())
    }
});


class ContainerStorage extends React.Component {
    componentDidMount() {
        this.props.onLoad();
    }

    submitForm = values => {
        return this.props.onSubmit(this.props.match.params.id, values);        
    }

    render() {
        let {container, storageOptions} = this.props;

        if (!storageOptions) {
            storageOptions = {}
        }

        let {disk_sizes} = storageOptions;
        
        let diskSizeOptions = []
        if (container && disk_sizes) {
            disk_sizes = disk_sizes.filter((disk_size) => {
                return disk_size.size > container.disk_size;
            });
            diskSizeOptions = disk_sizes.map((disk_size) => {
                return { key: disk_size.size, text: disk_size.size+"GB", value: disk_size.size };
            });
        }

        return (
            <ContainerBase {...this.props}>
                <style>{`
                .ui.header.definition {
                    margin-bottom: 0em;
                }
                `}</style>
                {container && 
                <Segment>
                    <Header as='h2'>Resize container storage</Header>
                    <Form onSubmit={this.props.handleSubmit(this.submitForm)}>
                        <Field label="Disk size" name="disk_size" component={FieldContainer} options={diskSizeOptions} select={true} placeholder='Disk size' />                        
                        <Button primary type='submit'>Save</Button>
                    </Form>
                </Segment>
                }

            </ContainerBase>
        );
    }
}

const connectedForm = reduxForm({
    form: 'container-storage',
    enableReinitialize: true
})

const connectedRedux = connect(
    mapStateToProps, 
    mapDispatchToProps
)

export default connectedRedux(connectedForm(ContainerStorage));
