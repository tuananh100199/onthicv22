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
        let tabs = [];
        const titleList = ['Bài viết', 'Danh sách bài viết', 'Tập hình ảnh', 'Video', 'Thống kê', 'Testimony', 'Nhóm nhân viên', 'Danh sách Video', 'Đăng ký tư vấn'];
        const componentList = [<ContentPage />, <ContentListPage />, <CarouselPage />, <VideoPage />, <StatisticPage />, <TestimonyPage />, <StaffGroupPage />, <ListVideoPage />, <DangKyTuVanPage />];
        for (let i = 0; i < titleList.length; i++) {
            tabs.push({ title: titleList[i], component: componentList[i] })
        };
        const renderData = {
            icon: 'fa fa-cogs',
            title: 'Thành phần giao diện',
            breadcrumb: ['Thành phần giao diện'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />
        };
        return this.renderPage(renderData);
    }
}
