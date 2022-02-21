import React from 'react';
import { connect } from 'react-redux';
import { getAllDivisionByUser } from 'modules/mdDaoTao/fwDivision/redux';
import 'modules/_default/fwHome/style.css';

class Footer extends React.Component {
    componentDidMount() {
        this.props.getAllDivisionByUser();
    }

    renderContact = (contact,index)=>
        <li key={index} className='mb-2'>
            <div className='location_title'><i className="fa fa-map-marker" aria-hidden="true"></i> {contact.title}: {contact.address ? contact.address : ''}</div>
            <div className='location_text mt-0'>
                <i className="fa fa-phone" aria-hidden="true"></i> Điện thoại: <a href={'tel:' + contact.phoneNumber}>{T.mobileDisplay(contact.phoneNumber)}
                </a> &nbsp;&nbsp;
                <i className="fa fa-mobile" aria-hidden="true"></i> Di động:&nbsp;<a href={'tel:' + contact.mobile}>{T.mobileDisplay(contact.mobile)}</a></div>
            <div className='location_text mt-0'><i className="fa fa-envelope-o" aria-hidden="true"></i> Email:&nbsp;<a href={'mailto:' + contact.email}>{contact.email}</a></div>
        </li>;

    render() {
        let { facebook, youtube, twitter, instagram, footer,logo } = this.props.system ? this.props.system : { footer: '/img/footer.jpg'};
        facebook = facebook ? <li><a href={facebook} target='_blank' rel='noreferrer'><i className='fa fa-facebook' aria-hidden='true' /></a></li> : '';
        youtube = youtube ? <li><a href={youtube} target='_blank' rel='noreferrer'><i className='fa fa-youtube' aria-hidden='true' /></a></li> : '';
        twitter = twitter ? <li><a href={twitter} target='_blank' rel='noreferrer'><i className='fa fa-twitter' aria-hidden='true' /></a></li> : '';
        instagram = instagram ? <li><a href={instagram} target='_blank' rel='noreferrer'><i className='fa fa-instagram' aria-hidden='true' /></a></li> : '';
        const {email,mobile} = this.props.system||{};
        const divisionsInside = this.props.division && this.props.division.list ?
            this.props.division.list.filter(division => !division.isOutside)
            : [];
        return (
            <footer className='footer' style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <div className='footer_content'>    
                    <div className='pc'>
                        <div className='container'>
                            {/* <div className='row'>
                                <div className='col-lg-6 footer_col'>
                                    <div className='footer_about'>
                                        <div className='footer_logo'>
                                            <a href='#' onClick={e => e.preventDefault()}>
                                                <div className='title1' style={{}}>Trung tâm dạy nghề lái xe</div>
                                                <div className='title2' style={{}}>HIỆP PHÁT</div>
                                            </a>
                                        </div>
                                        <div className='footer_about_text'>
                                            <ul className=''>
                                                {divisionsInside.length > 0 ?
                                                    divisionsInside.map((item, index) => (
                                                        <li key={index} className='mb-2' style={{color:'#4ca758', fontSize: 15, fontWeight: 500}}>
                                                            <div className='location_title'>{item.title}: {item.address ? item.address : ''}</div>
                                                            <div className='location_text mt-0'>Điện thoại: <a style={{color:'#4ca758'}} href={'tel:' + item.phoneNumber}>{T.mobileDisplay(item.phoneNumber)}</a> &nbsp;&nbsp;Di động:&nbsp;<a style={{color:'#4ca758'}} href={'tel:' + item.mobile}>{T.mobileDisplay(item.mobile)}</a></div>
                                                            <div className='location_text mt-0'>Email:&nbsp;<a style={{color:'#4ca758'}} href={'mailto:' + item.email}>{item.email}</a></div>
                                                        </li>
                                                    )) : ''}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-6' 
                                    style={{
                                            backgroundImage: `url('${T.url(divisionsInside[0] && divisionsInside[0].image)}')`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center center',
                                            backgroundSize: 'cover',
                                            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 29% 100%)'
                                        }}>
                                </div>
                            </div> */}

                            <div className='row'>
                                <div className='col-md-4'>
                                    <div className='footer_about'>
                                        <div className='footer_logo d-flex flex-column align-items-center'>
                                            <h5>Trung tâm dạy nghề lái xe</h5>
                                            <h2 className='footer_logo__title'>HIỆP PHÁT</h2>
                                            <img src={logo} alt='logo' />
                                        </div>
                                        
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className='footer_about_text'>
                                        <ul className='footer_about_contact'>
                                            {divisionsInside.length > 0 ?
                                                divisionsInside.map((item, index) => this.renderContact(item,index)):''}
                                        </ul>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className='footer_about_text'>
                                        <ul className='footer_hotline'>
                                            <li>
                                                <a href={'mailto:' + email}>
                                                    <span className='footer_hotline__icon'><i className="fa fa-link" aria-hidden="true"></i></span>
                                                    {email}</a>
                                            </li>
                                            <li>
                                                <a href={'tel:' + mobile}>
                                                    <span className="footer_hotline__icon"><i className="fa fa-phone" aria-hidden="true"></i></span>
                                                    {T.mobileDisplay(mobile)}
                                                </a>
                                            </li>

                                            <li>
                                                <div className="footer_hotline__app-wrap">
                                                    <div className="footer_hotline__app">
                                                        <div className="footer_hotline__app-image">
                                                            <img src='/img/ch-play.jpg' alt="image" />
                                                        </div>
                                                        <div className="footer_hotline__app-content">
                                                            <p>Get it on</p>
                                                            <h5>Google Play</h5>
                                                        </div>
                                                    </div>
                                                    <div className="footer_hotline__app">
                                                        <div className="footer_hotline__app-image">
                                                        <img src='/img/app-store.jpg' alt="image" />
                                                        </div>
                                                        <div className="footer_hotline__app-content">
                                                            <p>Download on the</p>
                                                            <h5>App Store</h5>
                                                            </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mobile'>
                        <div className='row'> 
                            <div className='col-12'>
                                <div className='wrap_title'>
                                    <div className='title1'>HIỆP PHÁT</div>
                                    <p className='title2'>Hệ thống đào tạo trực tuyến</p>
                                    <div className='strike'></div>
                                    <p className='description'>Hệ thống phục vụ cho công tác dạy - học trực tuyến &  quản lý đào tạo, sử dụng cho chương trình đào tạo và cấp giấy phép lái xe ôtô</p>
                                </div>
                            </div>
                            <div className='col-12' 
                                    // style={{
                                    //         backgroundImage: `url('${T.url(footer)}')`,
                                    //         backgroundRepeat: 'no-repeat',
                                    //         backgroundPosition: 'center center',
                                    //         backgroundSize: 'cover',
                                    //         clipPath: 'polygon(0 0, 100% 0, 100% 100%, 29% 99%)'
                                    //     }}
                                        >
                                <div className='wrap-img'>
                                    <img alt='Loading' className='listViewLoading' src={footer}
                                        style={{ width: '100%', height: 'auto' }} />
                                    </div>
                                </div>
                               
                        </div>
                       
                    </div>
                    
                </div>
                <div className='footer_bar'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col'>
                                <div className='footer_bar_content  d-flex flex-md-row flex-column align-items-md-center justify-content-start'>
                                    <div className='copyright' style={{width: '100%', textAlign: 'center'}}>
                                        Copyright &copy; {new Date().getFullYear()}. Bản quyền thuộc về <a href='#' onClick={e => e.preventDefault()}>Trung tâm dạy nghề lái xe Hiệp Phát.</a>
                                    </div>
                                    <nav className='footer_nav ml-md-auto'>
                                        <ul className='d-flex flex-row align-items-center justify-content-start'>
                                            {twitter}
                                            {facebook}
                                            {youtube}
                                            {instagram}
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { getAllDivisionByUser };
export default connect(mapStateToProps, mapActionsToProps)(Footer);
