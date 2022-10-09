//TEMPLATES: admin|home
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import announcement from './redux';
import SectionAnnouncement from './sectionAnnouncement';
export default {
    init: () => {
        T.component['announcement enroll'] = {
            render: (viewId) => <SectionAnnouncement viewId={viewId} />,
            text: 'Thông báo tuyển sinh',
            backgroundColor: '#82b1ff',
        };
    },
    redux: {
        parent: 'communication',
        reducers: { announcement },
    },
    routes: [
        {
            path: '/user/announcement',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/announcement/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/announcement',
            component: Loadable({ loading: Loading, loader: () => import('./homeAnnouncementPage') }),
        },
        {
            path: '/announcement/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./homeAnnouncementDetail') }),
        },
        {
            path: '/thong-bao/:link',
            component: Loadable({ loading: Loading, loader: () => import('./homeAnnouncementDetail') }),
        },
    ],
    Section: {
        SectionAnnouncement,
    }
};
