import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import driveTest from './redux';

export default {
    redux: {
        driveTest
    },
    routes: [
        {
            path: '/user/drive-test',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/drive-test/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ]
};
