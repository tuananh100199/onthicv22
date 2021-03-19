import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
    },
    routes: [
        {
            path: '/user/drive-question/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') }),
        }
    ]
};
