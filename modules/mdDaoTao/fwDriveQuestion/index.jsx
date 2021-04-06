import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import driveQuestion from './redux/redux';
import driveTest from './redux/reduxDriveTest';

export default {
    redux: {
        driveQuestion, driveTest
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
        {
            path: '/user/drive-test',
            component: Loadable({ loading: Loading, loader: () => import('./adminDriveTestPage') }),
        },
        {
            path: '/user/drive-test/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminDriveTestEditPage') })
        },
    ]
};
