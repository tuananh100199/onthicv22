//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import law from './redux';

export default {
    redux: {
        parent: 'communication',
        reducers: { law },
    },
    routes: [
        {
            path: '/user/law',
            component: Loadable({ loading: Loading,func:console.log('into indexx'), loader: () => import('./adminPage') }),
        },
        {
            path: '/user/law/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/law',
            component: Loadable({ loading: Loading, loader: () => import('./sectionLaw') }),
        },
        {
            path: '/law/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./homeLawPage') }),
        },
    ]
};
