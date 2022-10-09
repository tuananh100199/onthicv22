import React from 'react';
import CategorySection from 'modules/_default/fwCategory/CategorySection';
import { AdminPage } from 'view/component/AdminPage';

export default class CarCategoryPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/car', () => {

        });
    }


    render() {
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Danh mục loại xe',
            breadcrumb: ['Danh mục loại xe'],
            content: <CategorySection type='carType' uploadType='carTypeCategoryImage' />,
            backRoute: '/user/car',
        });
    }
}