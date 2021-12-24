import React from 'react';
import { connect } from 'react-redux';
import { getGioiThieu } from './redux/reduxGioiThieuHiepPhat';
import './style.css';

class SectionGioiThieuHiepPhat extends React.Component {
    state = {};
    componentDidMount() {
        if (this.props.viewId) {
            this.props.getGioiThieu(this.props.viewId, data => {
                data && data.item && this.setState(data.item);
            });
        }
    }
    render() {
        const { image1, image2, image3, abstract, title } = this.state;
        return (
            <div className='section-intro-hp' style={{ backgroundColor: '#199d76', paddingTop: '80px', paddingBottom: '80px' }}>
                <div className='container' style={{ padding: '50px'}}>
                    <div className='warp_gioi_thieu_HP'>
                        <div className='row'>
                            <div className='col-lg-5 col-md-12'>
                                <div className='title_gioi_thieu'>
                                    Giới thiệu
                                    <span>{title}</span>
                                </div>
                                <div className='description'>
                                    {abstract}<a href='/ve-chung-toi'> Xem thêm &gt;&gt;</a>
                                </div>
                                {/* <div className='social_gioi_thieu'>
                                    <ul className='social-menu'>
                                        <li><a href='https://facebook.com/'><i className='fa fa-facebook' /></a></li>
                                        <li><a href='https://instagram.com/'><i className='fa fa-instagram' /> </a></li>
                                        <li><a href='https://twitter.com/'><i className='fa fa-twitter' /></a></li>
                                        <li><a href='https://youtube.com/'><i className='fa fa-youtube' /> </a></li>
                                    </ul>
                                </div> */}
                            </div>
                            <div className='col-lg-7 col-md-12 img-gioi-thieu'>
                                <div>
                                    <img src={image1} className='img-intro1' alt='image 1'></img>
                                </div>
                                <div>
                                    <img src={image2} className='img-intro2' alt='image 2'></img>
                                </div>
                                <div>
                                    <img src={image3} className='img-intro3' alt='image 3'></img>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getGioiThieu };
export default connect(mapStateToProps, mapActionsToProps)(SectionGioiThieuHiepPhat);
