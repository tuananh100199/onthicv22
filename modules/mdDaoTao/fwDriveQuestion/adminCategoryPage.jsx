import React from 'react';
import CategorySection from 'modules/_default/fwCategory/CategorySection';
import { AdminPage } from 'view/component/AdminPage';

export default class DriveQuestionCategoryPage extends AdminPage {
    render() {
        return this.renderListPage({
            icon: 'fa fa-list',
            title: 'Danh mục câu hỏi thi',
            breadcrumb: ['Danh mục câu hỏi thi'],
            content: <CategorySection type='drive-question' uploadType='driveQuestionCategoryImage' />,
        });
    }
}