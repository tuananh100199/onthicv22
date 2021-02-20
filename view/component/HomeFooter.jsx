import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllAddressByUser } from '../../module/fwAddress/redux.jsx'

class Footer extends React.Component {
    componentDidMount() {
        this.props.getAllAddressByUser(() => {
            T.ftcoAnimate();
        });
    }
    render() {
        let { logo, facebook, youtube, twitter, instagram, todayViews, allViews, footer } =
            this.props.system ? this.props.system : { logo: '', todayViews: 0, allViews: 0, footer: '/img/footer.jpg' };
        facebook = facebook ? <li className='ftco-animate'><a href={facebook} target='_blank'><span className='icon-facebook'/></a></li> : '';
        youtube = youtube ? <li className='ftco-animate'><a href={youtube} target='_blank'><span className='icon-youtube'/></a></li> : '';
        twitter = twitter ? <li className='ftco-animate'><a href={twitter} target='_blank'><span className='icon-twitter'/></a></li> : '';
        instagram = instagram ? <li className='ftco-animate'><a href={instagram} target='_blank'><span className='icon-instagram'/></a></li> : '';
        return (
            <footer className='ftco-footer ftco-bg-dark ftco-section img' style={{ backgroundImage: `url('${T.url(footer)}')` }}>
                <div className='overlay'/>
                <div className='container-fluid'>
                    <div className='row mb-5'>
                        <div className='col-xl-6 col-lg-5 col-md-12 col-12'>
                            <div className='ftco-footer-widget mb-4'>
                                <h2 className='ftco-heading-2'>Trung tâm đào tạo lái xe Hiệp Phát</h2>
                                {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                    this.props.address.list.map((item, index) => (
                                        <div className='mb-1 ftco-animate' key={index}>
                                            <p><strong>{item.title}</strong>:&nbsp;{item.address}</p>
                                            <p>Điện thoại: {item.phoneNumber}&nbsp;&nbsp;Di động:&nbsp;{item.mobile}</p>
                                            <p>Email:&nbsp;<a href={'mailto:' + item.email}>{item.email}</a></p>
                                        </div>
                                    )) : <p>Chưa cập nhật địa chỉ</p>}
                            </div>
                        </div>
                        <div className='col-xl-3 col-lg-4 col-md-8 col-6'>
                            <div className='ftco-footer-widget mb-4 ml-md-5'>
                                <h2 className='ftco-heading-2'>Thống kê truy cập</h2>
                                <ul className='list-unstyled'>
                                    <li className='ftco-animate'><a href='#'><span>Hôm nay:</span> {todayViews}</a></li>
                                    <li className='ftco-animate'><a href='#'><span>Tổng truy cập:</span> {allViews}</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className='col-xl-3 col-lg-3 col-md-4 col-6 pl-0'>
                            <div className='ftco-footer-widget mb-4'>
                                <h2 className='ftco-heading-2'>Kết nối với chúng tôi</h2>
                                {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                    <div id='carouselFooter' className='carousel ftco-animate' data-ride='carousel' data-interval='5000' style={{ height: 'auto' }}>
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
                            
                                                        <span className='text-primary' style={{ position: 'fixed', bottom: '10px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>{item.title}</span>
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
                                    </div> : <p>Chưa cập nhật địa chỉ</p>
                                }
                                <ul className='ftco-footer-social list-unstyled float-md-left float-lft mt-5'>
                                    {twitter}
                                    {facebook}
                                    {youtube}
                                    {instagram}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-12 text-center ftco-animate'>
                            <Link to='/'><img src={logo} alt='Hiep Phat' style={{ height: '36px', width: 'auto' }} /></Link>
                            <p dangerouslySetInnerHTML={{ __html: 'Copyright &copy;' + new Date().getFullYear() + '. Bản quyền thuộc về Trung tâm đào tạo lái xe Hiệp Phát.' }} />
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
