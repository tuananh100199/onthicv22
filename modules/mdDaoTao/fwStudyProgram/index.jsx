//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import studyProgram from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { studyProgram },
    },
    routes: [
        {
            path: '/user/study-program',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/study-program/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
    ]
};
