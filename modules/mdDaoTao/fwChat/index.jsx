//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import chat from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { chat },
    },
    routes: [
        {
            path: '/user/chat/:id',
            component: Loadable({ loading: Loading, loader: () => import('./userChatPage') }),
        },
    ]
};
