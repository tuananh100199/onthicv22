//TEMPLATES: admin|home
// import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import forum from './redux';

export default {
    init: () => {
        // T.component['forum'] = {
        //     render: (viewId) => <SectionForum viewId={viewId} />,
        //     text: 'Forum',
        //     backgroundColor: '#c8e6f9',
        // };
    },
    redux: {
        parent: 'communication',
        reducers: { forum },
    },
    routes: [
        {
            path: '/user/forum-category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') }),
        },
        {
            path: '/user/forum-category/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/forum-category/:_id/forum/:forumId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ],
    Section: {
        // SectionForum,
    }
};