import React from 'react';
import CategorySection from 'modules/_default/fwCategory/CategorySection';
import { AdminPage } from 'view/component/AdminPage';

export default class DriveQuestionCategoryPage extends AdminPage {
    render() {
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Danh mục hợp đồng',
            breadcrumb: ['Danh mục hợp đồng'],
            content: <CategorySection type='contract' uploadType='contractCategoryImage' />,
        });
    }
}