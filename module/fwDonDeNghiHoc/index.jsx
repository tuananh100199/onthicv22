import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import bieuMau from './redux.jsx';

export default {
    redux: {
        bieuMau,
    },
    routes: [ 
        {
            path: '/user/user-form',
            component: Loadable({ loading: Loading, loader: () => import('./danhSachBieuMau.jsx') })
        },
        {
            path: '/user/user-form/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./chinhSuaBieuMau.jsx') }),
        },
       
    ],
};
