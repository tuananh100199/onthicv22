//TEMPLATES: admin|home
// import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
// import SectionForum from './sectionForum';
import forum from './redux';

export default {
    init: () => {
        // T.component['forum'] = {
        //     render: (viewId) => <SectionForum viewId={viewId} />,
        //     text: 'Liên hệ',
        //     backgroundColor: '#c8e6f9',
        // };
    },
    redux: {
        parent: 'communication',
        reducers: { forum },
    },
    routes: [
        {
            path: '/user/forum/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') }),
        },
        {
            path: '/user/forum',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
    Section: {
        // SectionForum,
    }
};