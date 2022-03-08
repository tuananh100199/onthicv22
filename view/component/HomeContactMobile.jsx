import React from 'react';
import { connect } from 'react-redux';
import { getAllDivisionByUser } from 'modules/mdDaoTao/fwDivision/redux';
import 'modules/_default/fwHome/style.css';
import CandidateModal from 'modules/mdDaoTao/fwCandidate/homeCandidateModal';
class HomeContactMobile extends React.Component {
    componentDidMount() {
        this.props.getAllDivisionByUser();
    }

    showCandidateModal = (e) => e.preventDefault() || this.candidateModal.show();

    render() {
        const {mobile,activeZalo,zaloId} = this.props.system||{};
        const isActiveZalo = activeZalo && activeZalo!='0';
        return (
            <>
            <div className='home-contact'>
                <div className='d-flex justify-content-center align-items-center'>
                    <a className='home-contact-button' href={'tel:' + mobile}> 
                        <i className="fa fa-phone" aria-hidden="true"></i><span>Điện thoại: {T.mobileDisplay(mobile)}</span>                    
                    </a>
                    <a href='#' className='home-contact-button' onClick = {this.showCandidateModal}>
                    <i className="fa fa-comments-o" aria-hidden="true"></i><span>Đăng ký tư vấn</span>
                    </a>
                    {isActiveZalo?
                        <a href={`https://zalo.me/${zaloId}`} rel="noreferrer" target="_blank" className='home-contact-button'>
                            <i className="fa fa-comment zalo-icon" aria-hidden="true"></i>
                            <span>Zalo</span>
                        </a>
                    :null}
                    
                    <div>
                    </div>
                </div>                        
            </div>
            <CandidateModal ref={e => this.candidateModal = e} autoActive={true}/>
            </>
            
        );
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { getAllDivisionByUser };
export default connect(mapStateToProps, mapActionsToProps)(HomeContactMobile);
