import React from 'react';
import CategorySection from 'modules/_default/fwCategory/CategorySection';
import { AdminPage } from 'view/component/AdminPage';

export default class DeviceCategoryPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/device', () => {

        });
    }


    render() {
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Danh mục thiết bị dạy học',
            breadcrumb: ['Danh mục thiết bị dạy học'],
            content: <CategorySection type='device' uploadType='deviceCategoryImage' />,
            backRoute: '/user/device',
        });
    }
}