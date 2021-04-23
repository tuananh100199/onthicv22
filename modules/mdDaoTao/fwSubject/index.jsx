//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import subject from './redux';

export default {
    redux: {
        subject
    },
    routes: [
        {
            path: '/user/dao-tao/mon-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/mon-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/mon-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
    ],
};