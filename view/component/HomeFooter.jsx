import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Footer extends React.Component {
    render() {
        let { map, latitude, longitude, logo, facebook, youtube, twitter, instagram, todayViews, allViews, addressList, mobile, email } =
            this.props.system ? this.props.system : { map: '', latitude: 0, longitude: 0, logo: '', todayViews: 0, allViews: 0, addressList: JSON.stringify([]), mobile:'', email:'' };
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
                <div className='top-footer-area text-left'>
                    <div className='container'>
                       <div className='row' >
                            <div className="col-md-4" >
                                {addressList.map((item, index) => <div className='mb-1' key={index}>
                                        <p><strong>{item.addressTitle}</strong>:&nbsp;&nbsp;
                                            <span >{item.address}</span>
                                        </p>
                                        <p>Điện thoại: 
                                            <span >{item.phoneNumber}</span>
                                            &nbsp;&nbsp;
                                            <span >Di động: </span>
                                            <span >{item.mobile}</span>
                                        </p>
                                        <p>Email: 
                                            <span >{item.email}</span>
                                        </p>
                                </div>)}
                            </div>
                            <div className="col-md-4">
                                <h5>Thông tin liên hệ</h5>
                                    <div>
                                        <h6 className='pt-2'><i className='fa fa-phone' aria-hidden='true' /> Điện thoại</h6>
                                        <a href={'tel:' + email}>{mobile}</a>
                                    </div>
                                    <div>
                                        <h6 className='pt-2'><i className='fa fa-envelope' aria-hidden='true' />Email</h6>
                                        <a href={'mailto:' + email}>{email}</a>
                                    </div>
                            </div>
                            <div className="col-md-4">
                                <a href={mapUrl} target='_blank'>
                                    <div className='map-area' style={{ height: '200px', background: 'url(' + map + ') no-repeat center center' }} />
                                </a>
                            </div>
                        </div>
                        <div className="row">
                            <div className='col-12 text-center'>
                                        <Link to='/'><img src={logo} alt='Hiep Phat' style={{ height: '36px', width: 'auto' }} /></Link>
                                        <p dangerouslySetInnerHTML={{ __html: 'Copyright &copy;' + new Date().getFullYear() + '. Bản quyền thuộc về Trung tâm đào tạo lái xe Hiệp Phát.' }} />
                                    </div>
                            </div>
                    </div>
                </div>

                <div className='bottom-footer-area d-flex justify-content-between align-items-center'>
                    <div className='contact-info'>
                        <a href='#'><span>Hôm nay:</span> {todayViews}</a>
                        <a href='#'><span>Tổng truy cập:</span> {allViews}</a>
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
