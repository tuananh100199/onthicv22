import React from 'react';
import  SectionAdvisoryForm from 'modules/mdDaoTao/fwCandidate/sectionAdvisoryForm'

export default class CandidateModal extends React.Component {
    show = () => {
        $(this.modal).modal('show');
    }
    hideModal = () => {
        $(this.modal).modal('hide');
    }

    render() {
        return (
            <div ref={e => this.modal = e} className='modal fade' tabIndex='-1' role='dialog' >
                <div className='modal-dialog modal-lg'>
                    <div className='modal-content'>
                     <SectionAdvisoryForm hide={this.hideModal}/>
                    
                        {/* <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div> */}
                    </div> 
                </div>
            </div>
        )
    }
}