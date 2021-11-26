//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import changeLecturer from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { changeLecturer },
    },
    routes: [
        {
            path: '/user/change-lecturer',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
