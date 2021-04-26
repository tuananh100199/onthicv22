import React from 'react';
import SectionAdvisoryForm from 'modules/mdDaoTao/fwCandidate/sectionAdvisoryForm';

export default class CandidateModal extends React.Component {
    show = () => $(this.modal).modal('show');

    hide = () => $(this.modal).modal('hide');

    render() {
        return (
            <div ref={e => this.modal = e} className='modal fade' tabIndex='-1' role='dialog' >
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <SectionAdvisoryForm hide={this.hide} />
                    </div>
                </div>
            </div>
        );
    }
}