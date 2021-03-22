import React from 'react';
import ContentPage from './adminContentView';
import CarouselPage from './adminCarouselView';
import VideoPage from './adminVideoView';
import StatisticPage from './adminStatisticView';
import TestimonyPage from './adminTestimonyView';
import StaffGroupPage from './adminStaffView';
import ListVideoPage from './adminListVideoView';
import ContentListPage from 'modules/_default/fwContentList/adminContentListView';
import DangKyTuVanPage from 'modules/mdDaoTao/fwDangKyTuVan/adminPage';
import { AdminPage, FormTabs } from 'view/component/AdminPage';

export default class ComponentPage extends AdminPage {
    render() {
        const titles = ['Bài viết', 'Danh sách bài viết', 'Tập hình ảnh', 'Video', 'Thống kê', 'Testimony', 'Nhóm nhân viên', 'Danh sách Video', 'Đăng ký tư vấn'],
            components = [<ContentPage history={this.props.history} />, <ContentListPage history={this.props.history} />, <CarouselPage />, <VideoPage />, <StatisticPage history={this.props.history} />, <TestimonyPage />, <StaffGroupPage />, <ListVideoPage history={this.props.history} />, <DangKyTuVanPage history={this.props.history} />],
            tabs = titles.map((item, index) => ({ title: item, component: components[index] }));
        return this.renderPage({
            icon: 'fa fa-cogs',
            title: 'Thành phần giao diện',
            breadcrumb: ['Thành phần giao diện'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />
        });
    }
}
