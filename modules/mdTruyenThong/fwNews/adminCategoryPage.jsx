import React from 'react';
import CategorySection from 'modules/_default/fwCategory/CategorySection';
import { AdminPage } from 'view/component/AdminPage';

export default class NewsCategoryPage extends AdminPage {
    componentDidMount() {
        T.ready();
    }

    render() {
        const renderData = {
            icon: 'fa fa-list',
            title: 'Danh mục tin tức',
            breadcrumb: ['Danh mục tin tức'],
            content: <CategorySection type='news' uploadType='newsCategoryImage' />,
        };
        return this.renderListPage(renderData);
    }
}