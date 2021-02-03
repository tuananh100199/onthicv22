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
        facebook = facebook ? <a href={facebook} target='_blank'><i className='fa fa-facebook' /></a> : '';
        youtube = youtube ? <a href={youtube} target='_blank'><i className='fa fa-youtube' /></a> : '';
        twitter = twitter ? <a href={twitter} target='_blank'><i className='fa fa-twitter' /></a> : '';
        instagram = instagram ? <a href={instagram} target='_blank'><i className='fa fa-instagram' /></a> : '';
        return (
            <footer className='footer-area' style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <div className='top-footer-area text-left' style={{
                    backgroundImage: `url('${T.url(footer)}')`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover'
                }}>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-xl-6 col-lg-5 col-md-12 col-12'>
                                <h5 className='text-primary'>Trung tâm đào tạo lái xe Hiệp Phát</h5>
                                {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                    this.props.address.list.map((item, index) => (
                                        <div className='mb-1' key={index}>
                                            <p><strong>{item.title}</strong>:&nbsp;{item.address}</p>
                                            <p>Điện thoại: {item.phoneNumber}&nbsp;&nbsp;Di động:&nbsp;{item.mobile}</p>
                                            <p>Email:&nbsp;<a href={'mailto:' + item.email}>{item.email}</a></p>
                                        </div>
                                    )) : <p>Chưa cập nhật địa chỉ</p>}
                            </div>
                            <div className='col-xl-3 col-lg-4 col-md-8 col-6'>
                                <h5 className='text-primary'>Thống kê truy cập</h5>
                                <div><a href='#'><span>Hôm nay:</span> {todayViews}</a></div>
                                <div><a href='#'><span>Tổng truy cập:</span> {allViews}</a></div>
                            </div>
                            {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                <div id='carouselFooter' className='carousel slide col-xl-3 col-lg-3 col-md-4 col-6 pl-0'
                                    data-ride='carousel'
                                    data-interval='5000'
                                    style={{
                                        height: 'auto',
                                    }}>
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

                                                    <span className='text-primary' style={{ position: 'fixed', bottom: '10px', left: '10px', color: 'red', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>{item.title}</span>
                                                </div>))}
                                    </div>
                                    <a className='carousel-control-prev' href='#carouselFooter' role='button' data-slide='prev' style={{ opacity: 1 }}>
                                        <span className='carousel-control-prev-icon' style={{ backgroundColor: '#4ca758', backgroundSize: '70% 70%' }}></span>
                                        <span className='sr-only'>Previous</span>
                                    </a>
                                    <a className='carousel-control-next mr-3' href='#carouselFooter' role='button' data-slide='next' style={{ opacity: 1 }}>
                                        <span className='carousel-control-next-icon' style={{ backgroundColor: '#4ca758', backgroundSize: '70% 70%' }}></span>
                                        <span className='sr-only'>Next</span>
                                    </a>
                                </div> : <p>Chưa cập nhật địa chỉ</p>
                            }

                        </div>
                        <div className='row'>
                            <div className='col-12 text-center'>
                                <Link to='/'><img src={logo} alt='Hiep Phat' style={{ height: '36px', width: 'auto' }} /></Link>
                                <p dangerouslySetInnerHTML={{ __html: 'Copyright &copy;' + new Date().getFullYear() + '. Bản quyền thuộc về Trung tâm đào tạo lái xe Hiệp Phát.' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bottom-footer-area d-flex justify-content-between align-items-center'>
                    <div className='follow-us'>
                        <span>Kết nối với chúng tôi:</span>
                        {facebook} {youtube} {twitter} {instagram}
                    </div>
                </div>
            </footer>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, address: state.address });
const mapActionsToProps = { getAllAddressByUser };
export default connect(mapStateToProps, mapActionsToProps)(Footer);
