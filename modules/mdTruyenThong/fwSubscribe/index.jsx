//TEMPLATES: admin|home
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

import subscribe from './redux';
import SectionSubscribe from './sectionSubscribe';

export default {
    init: () => {
        T.component['subscribe'] = {
            render: (viewId) => <SectionSubscribe viewId={viewId} />,
            text: 'Đăng ký nhận tin',
            backgroundColor: '#c8e6c9',
        };
    },
    redux: {
        subscribe
    },
    routes: [
        {
            path: '/user/subscribe',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
    Section: {
        SectionSubscribe
    }
};
