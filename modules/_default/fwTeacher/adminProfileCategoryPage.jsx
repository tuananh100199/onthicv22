import React from 'react';
import CategorySection from 'modules/_default/fwCategory/CategorySection';
import { AdminPage } from 'view/component/AdminPage';

export default class DriveQuestionCategoryPage extends AdminPage {
    render() {
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Danh mục hồ sơ',
            breadcrumb: ['Danh mục hồ sơ'],
            content: <CategorySection type='profile' uploadType='profileCategoryImage' />,
        });
    }
}