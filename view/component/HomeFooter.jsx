import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Footer extends React.Component {
    render() {
        let { map, latitude, longitude, logo, facebook, youtube, twitter, instagram, todayViews, allViews, addressList, footer } =
            this.props.system ? this.props.system : { map: '', latitude: 0, longitude: 0, logo: '', todayViews: 0, allViews: 0, addressList: JSON.stringify([]), footer: '/img/footer.jpg' };
        facebook = facebook ? <a href={facebook} target='_blank'><i className='fa fa-facebook' /></a> : '';
        youtube = youtube ? <a href={youtube} target='_blank'><i className='fa fa-youtube' /></a> : '';
        twitter = twitter ? <a href={twitter} target='_blank'><i className='fa fa-twitter' /></a> : '';
        instagram = instagram ? <a href={instagram} target='_blank'><i className='fa fa-instagram' /></a> : '';

        const mapUrl = 'https://www.google.com/maps/@' + latitude + ',' + longitude + ',16z';
        try {
            addressList = JSON.parse(addressList);
        } catch (e) {
            console.error(e)
        }

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
                                {addressList.map((item, index) => (
                                    <div className='mb-1' key={index}>
                                        <p><strong>{item.addressTitle}</strong>:&nbsp;{item.address}</p>
                                        <p>Điện thoại: {item.phoneNumber}&nbsp;&nbsp;Di động:&nbsp;{item.mobile}</p>
                                        <p>Email:&nbsp;{item.email}</p>
                                    </div>
                                ))}
                            </div>
                            <div className='col-xl-3 col-lg-4 col-md-8 col-6'>
                                <h5 className='text-primary'>Thống kê truy cập</h5>
                                <div><a href='#'><span>Hôm nay:</span> {todayViews}</a></div>
                                <div><a href='#'><span>Tổng truy cập:</span> {allViews}</a></div>
                            </div>
                            <div id="carouselExampleControls" class="carousel slide col-xl-3 col-lg-3 col-md-4 col-6"
                                data-ride="carousel"
                                data-interval="20000"
                                style={{
                                    height: 'auto',
                                }}>
                                <div class="carousel-inner">
                                    <div class="carousel-item active"
                                        style={{
                                            height: '200px',
                                            backgroundImage: `url('${T.url(footer)}')`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center center',
                                            border: '1px solid gray',
                                            backgroundSize: 'cover'
                                        }}>
                                        <a href={mapUrl} target='_blank'>
                                            <div style={{ height: '100%', width: '100%' }}></div>
                                        </a>
                                    </div>
                                    <div class="carousel-item"
                                        style={{
                                            height: '200px',
                                            backgroundImage: `url('${T.url(logo)}')`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center center',
                                            border: '1px solid gray',
                                            backgroundSize: 'cover'
                                        }}>
                                        <a href={mapUrl} target='_blank'>
                                            <div style={{ height: '100%', width: '100%' }}></div>
                                        </a>
                                    </div>
                                    <div class="carousel-item"
                                        style={{
                                            height: '200px',
                                            backgroundImage: `url('${T.url(logo)}')`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center center',
                                            border: '1px solid gray',
                                            backgroundSize: 'cover'
                                        }}>
                                        <a href={mapUrl} target='_blank'>
                                            <div style={{ height: '100%', width: '100%' }}></div>
                                        </a>
                                    </div>
                                </div>
                                <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
                                    <span class="carousel-control-prev-icon"></span>
                                    <span class="sr-only">Previous</span>
                                </a>
                                <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
                                    <span class="carousel-control-next-icon" ></span>
                                    <span class="sr-only">Next</span>
                                </a>
                            </div>
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
                    <div className='contact-info'>
                        {/*<a href='#'><span>Hôm nay:</span> {todayViews}</a>*/}
                        {/*<a href='#'><span>Tổng truy cập:</span> {allViews}</a>*/}
                    </div>
                    <div className='follow-us'>
                        <span>Kết nối với chúng tôi:</span>
                        {facebook} {youtube} {twitter} {instagram}
                    </div>
                </div>
            </footer>
        )
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(Footer);
