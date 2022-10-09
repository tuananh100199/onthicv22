import React from 'react';
import CategorySection from 'modules/_default/fwCategory/CategorySection';
import { AdminPage } from 'view/component/AdminPage';

export default class SignCategoryPage extends AdminPage {
    render() {
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Danh mục biển báo',
            breadcrumb: ['Danh mục biển báo'],
            content: <CategorySection type='sign' uploadType='signCategoryImage' />,
        });
    }
}