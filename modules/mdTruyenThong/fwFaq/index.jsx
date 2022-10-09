//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import faq from './redux';

export default {
    redux: {
        parent: 'communication',
        reducers: { faq },
    },
    routes: [
        {
            path: '/user/faq',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/faq/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/faq',
            component: Loadable({ loading: Loading, loader: () => import('./sectionFaq') }),
        },
    ]
};
