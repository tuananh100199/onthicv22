//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import subject from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { subject },
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
            path: '/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageView') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/thong-tin/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userSubjectInfo') })
        },
    ],
};