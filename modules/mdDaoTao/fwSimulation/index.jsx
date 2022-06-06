//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import simulator from './redux';

export default {
    redux: {
        parent: 'training',
        reducers: { simulator },
    },
    routes: [
        {
            path: '/user/simulator',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/mo-phong',
            component: Loadable({ loading: Loading, loader: () => import('./userPageView') }),
        },
    ]
};
