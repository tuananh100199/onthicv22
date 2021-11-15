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
            title: 'Danh mục nhãn hiệu xe',
            breadcrumb: ['Danh mục nhãn hiệu xe'],
            content: <CategorySection type='car' uploadType='carCategoryImage' />,
            backRoute: '/user/car',
        });
    }
}