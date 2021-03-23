import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

import subscribe from './redux';
import SectionSubscribe from './sectionSubscribe';

export default {
    init: () => {
        T.component['subscribe'] = (viewId) => <SectionSubscribe viewId={viewId} />;
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
