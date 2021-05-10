//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import driveQuestion from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { driveQuestion },
    },
    routes: [
        {
            path: '/user/drive-question/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') }),
        },
        {
            path: '/user/drive-question',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
