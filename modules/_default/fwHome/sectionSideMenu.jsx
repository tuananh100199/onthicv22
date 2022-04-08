import React from 'react';
import { connect } from 'react-redux';
import { getAllDivisionByUser } from 'modules/mdDaoTao/fwDivision/redux';
import 'modules/_default/fwHome/style.css';
import CandidateModal from 'modules/mdDaoTao/fwCandidate/homeCandidateModal';
class SideMenu extends React.Component {
    state={isShowMenu:true}
    componentDidMount() {
        this.props.getAllDivisionByUser();
    }

    showCandidateModal = (e) => e.preventDefault() || this.candidateModal.show();

    scrollTo = (link)=>{
        const target = $(link);
        if(target.length){
            $('html, body').animate({
                scrollTop: target.offset().top-60+window.innerHeight
                }, 800, ()=>{
                // Add hash (#) to URL when done scrolling (default click behavior)
                // window.location.hash = hash;
                });
        }
    }
    render() {
        const {mobile} = this.props.system||{};
        return (
            <>
            <div className='intro-menu'>
                <ul className={`${this.state.isShowMenu?'intro-menu-move':''}`}>
                    <li>
                        <a href="#" onClick={this.props.showLoginModal}><i className='fa fa-user' aria-hidden='true'></i>
                        Đăng nhập</a>
                    </li>
                    <li>
                        <a href='#' onClick = {this.showCandidateModal}><i className='fa fa-paper-plane' aria-hidden='true'></i> 
                        Đăng ký tư vấn</a>
                    </li>
                    <li>
                        <a href={'tel:'+mobile}> <i className='fa fa-phone' aria-hidden='true'></i> 
                        {mobile}</a>
                    </li>
                    <li>
                        <a href='#dangKyNhanTin' onClick = {()=>this.scrollTo('#dangKyNhanTin')}><i className='fa fa-comments' aria-hidden='true'></i> 
                        Liên hệ</a>
                    </li>
                </ul>
                <div className='d-flex justify-content-end'>
                    <div className='intro-menu-bar' onClick={()=>this.setState({isShowMenu:!this.state.isShowMenu})}>
                        <i className={this.state.isShowMenu?'fa fa-times':'fa fa-bars'} aria-hidden='true'></i>
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
export default connect(mapStateToProps, mapActionsToProps)(SideMenu);
