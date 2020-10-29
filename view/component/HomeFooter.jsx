import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        addressPhone: 'Di động:  ',
        addressLine: 'Điện thoại:  ',
        addressEmail: 'Email:  ',
        facultyName: 'Công ty SV Sport',
        contactUs: 'Thông tin liên hệ:',
        socialNetworks: 'Kết nối với chúng tôi:',
        allViews: 'Tổng truy cập: ',
        todayViews: 'Hôm nay: ',
        quickMenu: 'Menu nhanh',
        copyright: 'Copyright &copy;' + new Date().getFullYear() + '. Bản quyền thuộc về Trung tâm đào tạo lái xe Hiệp Phát.',
    },
    en: {
        addressPhone: 'Tel:  ',
        addressLine: 'Fixed Tel:  ',
        addressEmail: 'Email:  ',
        facultyName: 'SV Sport company',
        contactUs: 'Contact us:',
        socialNetworks: 'Let us be social:',
        allViews: 'All views: ',
        todayViews: 'Today views: ',
        quickMenu: 'Quick menus',
        copyright: 'Copyright &copy;' + new Date().getFullYear() + '. All rights reserved.',
    }
};

class Footer extends React.Component {
    render() {
        let { logo, facebook, youtube, twitter, instagram, todayViews, allViews, addressList } =
            this.props.system ? this.props.system :
                { logo: '', todayViews: 0, allViews: 0, addressList: JSON.stringify([]) };
        facebook = facebook ? <a href={facebook} target='_blank'><i className='fa fa-facebook' /></a> : '';
        youtube = youtube ? <a href={youtube} target='_blank'><i className='fa fa-youtube' /></a> : '';
        twitter = twitter ? <a href={twitter} target='_blank'><i className='fa fa-twitter' /></a> : '';
        instagram = instagram ? <a href={instagram} target='_blank'><i className='fa fa-instagram' /></a> : '';
        addressList = JSON.parse(addressList);

        try {
            addressList = JSON.parse(addressList);
        } catch (e) {
            console.log(e)
        }

        const language = T.language(texts);
        return (
            <footer className='footer-area' style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
            }}>

                <div className='top-footer-area' style={{
                    textAlign: "left",
                }}>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-12' style={{
                                color: '#fff',
                                lineHeight: 22,
                                float: "left",
                                // marginLeft: -40,
                            }}>
                                {
                                    addressList.map(item => <div
                                        style={{
                                            float: "left",
                                        }}
                                    >
                                        <p>{item.addressTitle}:&nbsp;&nbsp;
                                            <span >{item.address}</span>
                                        </p>
                                        <p>{language.addressLine}
                                            <span >{item.phoneNumber}</span>
                                            &nbsp;&nbsp;
                                            <span >{language.addressPhone}</span>
                                            <span >{item.mobile}</span>
                                        </p>
                                        <p>{language.addressEmail}
                                            <span >{item.email}</span>
                                        </p>
                                        <p></p>
                                    </div>)
                                }
                            </div>
                            <div className='col-12'>
                                <Link to='/'><img src={logo} alt='CSE' style={{ height: '36px', width: 'auto' }} /></Link>
                                <p dangerouslySetInnerHTML={{ __html: language.copyright }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bottom-footer-area d-flex justify-content-between align-items-center'>
                    <div className='contact-info'>
                        <a href='#'><span>{language.todayViews}</span> {todayViews}</a>
                        <a href='#'><span>{language.allViews}</span> {allViews}</a>
                    </div>
                    <div className='follow-us'>
                        <span>{language.socialNetworks}</span>
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
