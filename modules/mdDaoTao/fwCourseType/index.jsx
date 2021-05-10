//TEMPLATES: admin|home
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import courseType from './redux';
import SectionListView from './sectionListView';

export default {
    init: () => {
        T.component['all course types'] = {
            render: (viewId) => <SectionListView viewId={viewId} />,
            text: 'Tất cả loại khóa học',
            backgroundColor: '#fb3553',
        };
    },
    redux: {
        parent: 'trainning',
        reducers: { courseType },
    },
    routes: [
        {
            path: '/user/course-type',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/course-type/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/course-type/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./homeDetailPage') })
        },
    ],
    Section: {
        SectionListView
    }
};