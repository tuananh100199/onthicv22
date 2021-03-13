import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllAddressByUser } from '../../module/fwAddress/redux.jsx'

class Footer extends React.Component {
    componentDidMount() {
        this.props.getAllAddressByUser();
    }
    render() {
        let { logo, facebook, youtube, twitter, instagram, todayViews, allViews, footer } =
            this.props.system ? this.props.system : { logo: '', todayViews: 0, allViews: 0, footer: '/img/footer.jpg' };
        facebook = facebook ? <li><a href={facebook} target='_blank'><i className='fa fa-facebook' aria-hidden='true' /></a></li> : '';
        youtube = youtube ? <li><a href={youtube} target='_blank'><i className='fa fa-youtube' aria-hidden='true' /></a></li> : '';
        twitter = twitter ? <li><a href={twitter} target='_blank'><i className='fa fa-twitter' aria-hidden='true' /></a></li> : '';
        instagram = instagram ? <li><a href={instagram} target='_blank'><i className='fa fa-instagram' aria-hidden='true' /></a></li> : '';

        return (
            <footer className='footer' style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <div className='footer_content'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-lg-5 footer_col'>
                                <div className='footer_about'>
                                    <div className='footer_logo'>
                                        <a href='#' onClick={e => e.preventDefault()}>
                                            <div>Lái xe<span>Hiệp Phát</span></div>
                                            <div>Trung tâm dạy nghề lái xe</div>
                                        </a>
                                    </div>
                                    <div className='footer_about_text'>
                                        <ul className=''>
                                            {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                                this.props.address.list.map((item, index) => (
                                                    <li key={index} className='mb-2'>
                                                        <div className='location_title'>{item.title}: {item.address}</div>
                                                        <div className='location_text mt-0'>Điện thoại: {item.phoneNumber}&nbsp;&nbsp;Di động:&nbsp;{item.mobile}</div>
                                                        <div className='location_text mt-0'>Email:&nbsp;<a href={'mailto:' + item.email}>{item.email}</a></div>
                                                    </li>
                                                )) : ''}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className='col-lg-3 footer_col'>
                                <div className='footer_location'>
                                    <div className='footer_title'>Thống kê truy cập</div>
                                    <ul className='locations_list'>
                                        <li>
                                            <div className='location_title'>Hôm nay:</div>
                                            <div className='location_text'>{todayViews}</div>
                                        </li>
                                        <li>
                                            <div className='location_title'>Tổng truy cập:</div>
                                            <div className='location_text'>{allViews}</div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className='col-lg-4 footer_col'>
                                {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                    <div className='google_map_row'>
                                        <div id='carouselFooter' className='carousel slide col' data-ride='carousel' data-interval='5000' style={{ height: 'auto' }}>
                                            <div className='carousel-inner'>
                                                {
                                                    this.props.address.list.map((item, index) => (
                                                        <div className={'carousel-item' + (index == 0 ? ' active' : '')}
                                                            key={index}
                                                            style={{
                                                                height: '200px',
                                                                backgroundImage: `url('${T.url(item.image)}')`,
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center center',
                                                                border: '1px solid gray',
                                                                backgroundSize: 'cover',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => window.open(item.mapURL, '_blank')}>
                                                            <span className='carousel-footer-title' style={{ position: 'fixed', bottom: '10px', left: '10px', color: '#4CA758', fontWeight: 'bold' }}>{item.title + ': ' + item.address}</span>
                                                        </div>))}
                                            </div>
                                            <a className='carousel-control-prev' href='#carouselFooter' role='button' data-slide='prev' style={{ opacity: 1 }}>
                                                <span className='carousel-control-prev-icon' style={{ backgroundColor: '#4ca758', backgroundSize: '70% 70%' }}/>
                                                <span className='sr-only'>Previous</span>
                                            </a>
                                            <a className='carousel-control-next' href='#carouselFooter' role='button' data-slide='next' style={{ opacity: 1 }}>
                                                <span className='carousel-control-next-icon' style={{ backgroundColor: '#4ca758', backgroundSize: '70% 70%' }}/>
                                                <span className='sr-only'>Next</span>
                                            </a>
                                        </div>
                                    </div> : <p>Chưa cập nhật địa chỉ</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='footer_bar'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col'>
                                <div className='footer_bar_content  d-flex flex-md-row flex-column align-items-md-center justify-content-start'>
                                    <div className='copyright'>
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
        )
    }
}

const mapStateToProps = state => ({ system: state.system, address: state.address });
const mapActionsToProps = { getAllAddressByUser };
export default connect(mapStateToProps, mapActionsToProps)(Footer);
