import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import ContentView from './adminContentView';
import CarouselView from './adminCarouselView';
import VideoPage from './adminVideoView';
import StatisticPage from './adminStatisticView';
import StaffGroupPage from './adminStaffGroupView';
import ListVideoPage from './adminListVideoView';
import ListContentView from './adminListContentView';
import LoginFormView from './adminLoginFormView';
import GioiThieuHiepPhatView from './adminGioiThieuHiepPhatView';
import HangGPLXView from './adminHangGPLXPage';

export class ComponentPage extends AdminPage {
    render() {
        const permission = this.getUserPermission('component'),
            tabs = [];
        tabs.push({ key: tabs.length, title: 'Bài viết', component: <ContentView permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Danh sách bài viết', component: <ListContentView permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Tập hình ảnh', component: <CarouselView permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Video', component: <VideoPage permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Tập Video', component: <ListVideoPage permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Thống kê', component: <StatisticPage history={this.props.history} permission={permission} /> });
        tabs.push({ key: tabs.length, title: 'Nhóm nhân viên', component: <StaffGroupPage history={this.props.history} permission={permission} /> });
        tabs.push({ key: tabs.length, title: 'Đăng nhập', component: <LoginFormView history={this.props.history} permission={permission} /> });
        tabs.push({ key: tabs.length, title: 'Giới thiệu Hiệp Phát', component: <GioiThieuHiepPhatView permission={permission} history={this.props.history} /> });
        tabs.push({ key: tabs.length, title: 'Các hạng GPLX', component: <HangGPLXView permission={permission} history={this.props.history} /> });

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