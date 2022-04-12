import React from 'react';
import CategorySection from 'modules/_default/fwCategory/CategorySection';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

export default class DeviceCategoryPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/device', () => {

        });
    }


    render() {
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Danh mục cơ sở vật chất',
            breadcrumb: [<Link key={0} to='/user/facility'>Quản lý cơ sở vật chất</Link>,'Danh mục cơ sở vật chất'],
            content: <CategorySection type='facility' uploadType='facilityCategoryImage' />,
            backRoute: '/user/facility',
        });
    }
}