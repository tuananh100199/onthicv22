import React from 'react';
import RateSection from './RateUserSection';
import { AdminModal } from 'view/component/AdminPage';

export default class RateModal extends AdminModal {
    state = {isSubmitted:false};

    onSubmit = () => {
        this.setState({isSubmitted:true},() => {this.hide();
        });
    }

    render = () => this.renderModal({
        title: this.props.title,
        body: <>
        <RateSection type={this.props.type} _refId={this.props._refId} isSubmitted={this.state.isSubmitted} isButtonHidden={true} />
        </>,
        size:'small'
    });
}