//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import reviewClass from './redux';

export default {
    redux: {
        parent: 'training',
        reducers: { reviewClass },
    },
    routes: [
        {
            path: '/user/review-class',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/review-class/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/lop-on-tap/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageView') }),
        },
    ]
};
