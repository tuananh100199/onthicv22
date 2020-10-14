import React from 'react';
import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import SectionContact from './sectionContact.jsx';
import contact from './redux.jsx';

export default {
    redux: {
        contact,
    },
    routes: [
        {
            path: '/user/contact',
            component: Loadable({ loading: Loading, loader: () => import('./admin.jsx') })
        }
    ],
    Section: {
        SectionContact,
    }
};