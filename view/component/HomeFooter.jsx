import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const addressList = [{
    addressName: 'Co so 1',
    addressDetail: 'Binh Chanh',
    addressLandlinePhone: '(028) 36 362 362',
    addressPhone: '0911 739 119',
    addressEmail: 'daotaolaixehp@gmail.com',
}, {
    addressName: 'Co so 1',
    addressDetail: 'Binh Chanh',
    addressLandlinePhone: '(028) 36 362 362',
    addressPhone: '0911 739 119',
    addressEmail: 'daotaolaixehp@gmail.com',
}];
const texts = {
    vi: {
        addressPhone: 'Di dong',
        addressLine: 'Dien thoai',
        addressEmail: 'Email',
        facultyName: 'Công ty SV Sport',
        contactUs: 'Thông tin liên hệ:',
        socialNetworks: 'Kết nối với chúng tôi:',
        allViews: 'Tổng truy cập: ',
        todayViews: 'Hôm nay: ',
        quickMenu: 'Menu nhanh',
        copyright: 'Copyright &copy;' + new Date().getFullYear() + '. Bản quyền thuộc về Trung tâm đào tạo lái xe Hiệp Phát.',
    },
    en: {
        addressPhone: 'Tel',
        addressLine: 'Fixed Tel',
        addressEmail: 'Email',
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
        let { logo, facebook, youtube, twitter, instagram, todayViews, allViews } = this.props.system ? this.props.system : {
            logo: '', todayViews: 0, allViews: 0,
        };
        facebook = facebook ? <a href={facebook} target='_blank'><i className='fa fa-facebook' /></a> : '';
        youtube = youtube ? <a href={youtube} target='_blank'><i className='fa fa-youtube' /></a> : '';
        twitter = twitter ? <a href={twitter} target='_blank'><i className='fa fa-twitter' /></a> : '';
        instagram = instagram ? <a href={instagram} target='_blank'><i className='fa fa-instagram' /></a> : '';

        const language = T.language(texts);
        return (
            <footer className='footer-area' style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <div className='top-footer-area'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-12'>
                                {
                                    addressList.map(item => <div>
                                        <p>{item.addressName}
                                            <span >{item.addressDetail}</span>
                                        </p>
                                        <p>{language.addressLine}
                                            <span >{item.addressLandlinePhone}</span>
                                            <span >{language.addressPhone}</span>
                                            <span >{item.addressPhone}</span>
                                        </p>
                                        <p>{language.addressEmail}
                                            <span >{item.addressEmail}</span>
                                        </p>
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
