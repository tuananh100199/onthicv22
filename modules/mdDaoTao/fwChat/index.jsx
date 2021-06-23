//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import division from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { division },
    },
    routes: [
        {
            path: '/user/chat/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
