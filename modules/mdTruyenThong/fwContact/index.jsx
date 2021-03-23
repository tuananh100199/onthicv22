import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionContact from './sectionContact';
import contact from './redux';

export default {
    init: () => {
        T.component['contact'] = (viewId) => <SectionContact viewId={viewId} />;
    },
    redux: {
        contact,
    },
    routes: [
        {
            path: '/user/contact',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
    Section: {
        SectionContact,
    }
};