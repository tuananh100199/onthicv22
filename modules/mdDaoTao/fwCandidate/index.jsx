//TEMPLATES: admin|home
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import candidate from './redux';
import SectionAdvisoryForm from './sectionAdvisoryForm';

export default {
    init: () => {
        T.component['advisory form'] = {
            render: (viewId) => <SectionAdvisoryForm viewId={viewId} />,
            text: 'Form đăng ký tư vấn',
            backgroundColor: '#fb3993',
            adapter: ajaxSelectCourseType,
            getItem: ajaxGetCourseType,
        };
    },
    redux: {
        parent: 'communication',
        reducers: { candidate },
    },
    routes: [
        {
            path: '/user/candidate',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
    Section: {
        SectionAdvisoryForm
    }
};