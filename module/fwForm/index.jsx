import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import form from './redux.jsx';
import reduxQuestion from './reduxQuestion.jsx';
import reduxAnswer from './reduxAnswer.jsx';

export default {
    redux: {
        form, reduxQuestion, reduxAnswer,
    },
    routes: [
        {
            path: '/user/form/list',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminPage.jsx') }),
        },
        {
            path: '/user/form/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminEditPage.jsx') }),
        },
        {
            path: '/user/form/registration/:id',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminRegistrationPage.jsx')})
        },
        {
            path: '/form/registration/item/:id',
            component: Loadable({ loading: Loading, loader: () => import('./home/homeRegistration.jsx')})
        },
    ],
};
