import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import ContentView from './adminContentView';
import CarouselView from './adminCarouselView';
import VideoPage from './adminVideoView';
import StatisticPage from './adminStatisticView';
import TestimonyPage from './adminTestimonyView';
import StaffGroupPage from './adminStaffView';
import ListVideoPage from './adminListVideoView';
import ListContentPage from './adminListContentView';
import DangKyTuVanPage from 'modules/mdDaoTao/fwDangKyTuVan/adminPage';

export class ComponentPage extends AdminPage {
    render() {
        const permission = this.getUserPermission('component'),
            tabs = [];
        tabs.push({ key: tabs.length, title: 'Bài viết', component: <ContentView permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Danh sách bài viết', component: <ListContentPage history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Tập hình ảnh', component: <CarouselView permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Video', component: <VideoPage permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Tập Video', component: <ListVideoPage permission={permission} history={this.props.history} /> });
        // tabs.push({ key: tabs.length, title: 'Thống kê', component: <StatisticPage history={this.props.history} /> });
        // tabs.push({ key: tabs.length, title: 'Testimony', component: <TestimonyPage /> });
        // tabs.push({ key: tabs.length, title: 'Nhóm nhân viên', component: <StaffGroupPage /> });
        // tabs.push({ key: tabs.length, title: 'Đăng ký tư vấn', component: <DangKyTuVanPage history={this.props.history} /> });

        return this.renderPage({
            icon: 'fa fa-cogs',
            title: 'Thành phần giao diện',
            breadcrumb: ['Thành phần giao diện'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(ComponentPage);