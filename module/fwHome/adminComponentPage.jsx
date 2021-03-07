import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ContentPage from './adminContentView.jsx';
import CarouselPage from './adminCarouselView.jsx';
import VideoPage from './adminVideoView.jsx';
import StatisticPage from './adminStatisticView.jsx';
import SloganPage from './adminSloganView.jsx';
import TestimonyPage from './adminTestimonyView.jsx';
import StaffGroupPage from './adminStaffView.jsx';
import LogoPage from './adminLogoView.jsx';
import ListVideoPage from './adminListVideoView.jsx';
import ContentListPage from '../fwContentList/adminContentListView.jsx';
// import AddressPage from '../fwAddress/adminAddressView.jsx';

class ComponentPage extends React.Component {
    componentDidMount() {
        T.ready('/user/settings', () => {
            let tabIndex = parseInt(T.cookie('componentPageTab')),
                navTabs = $('#componentPage ul.nav.nav-tabs');
            if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= navTabs.children().length) tabIndex = 0;
            navTabs.find('li:nth-child(' + (tabIndex + 1) + ') a').tab('show');
            $('#componentPage').fadeIn();

            $(`a[data-toggle='tab']`).on('shown.bs.tab', e => {
                T.cookie('componentPageTab', $(e.target).parent().index());
            });
        });
    }

    render() {
        return (
            <main className='app-content' id='componentPage' style={{ display: 'none' }}>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-cogs' /> Thành phần giao diện</h1>
                        <p></p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;Thành phần giao diện
                    </ul>
                </div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#menuContent'>Bài viết</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuContentList'>Danh sách bài viết</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuCarousel'>Tập hình ảnh</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuVideo'>Video</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuStatistic'>Thống kê</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuSlogan'>Slogan</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuLogo'>Logo</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuTestimony'>Testimony</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuStaffGroup'>Nhóm nhân viên</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuListVideo'>List Video</a></li>
                    {/* <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuAddress'>Địa chỉ</a></li> */}
                </ul>
                <div className='tab-content tile'>
                    <div className='tab-pane fade active show' id='menuContent'><ContentPage /></div>
                    <div className='tab-pane fade' id='menuContentList'><ContentListPage history={this.props.history} /></div>
                    <div className='tab-pane fade' id='menuCarousel'><CarouselPage /></div>
                    <div className='tab-pane fade' id='menuVideo'><VideoPage /></div>
                    <div className='tab-pane fade' id='menuStatistic'><StatisticPage /></div>
                    <div className='tab-pane fade' id='menuSlogan'><SloganPage /></div>
                    <div className='tab-pane fade' id='menuLogo'><LogoPage /></div>
                    <div className='tab-pane fade' id='menuTestimony'><TestimonyPage /></div>
                    <div className='tab-pane fade' id='menuStaffGroup'><StaffGroupPage /></div>
                    <div className='tab-pane fade' id='menuListVideo'><ListVideoPage history={this.props.history} /></div>
                    {/* <div className='tab-pane fade' id='menuAddress'><AddressPage history={this.props.history} /></div> */}

                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ carousel: state.carousel });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(ComponentPage);