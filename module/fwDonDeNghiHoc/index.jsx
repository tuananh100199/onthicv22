import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import donDeNghiHoc from './redux.jsx';

export default {
    redux: {
        donDeNghiHoc
    },
    routes: [
        {
            path: '/user/bieu-mau/don-de-nghi-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./userDonDeNghiPage.jsx') })
        },
        {
            path: '/user/user-form',
            component: Loadable({ loading: Loading, loader: () => import('./danhSachBieuMau.jsx') })
        },
        {
            path: '/user/user-form/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./chinhSuaBieuMau.jsx') }),
        },
        {
            path: '/user/don-de-nghi-hoc/list',
            component: Loadable({ loading: Loading, loader: () => import('./adminDuyetDonDeNghiHoc.jsx') }),
        },

    ],
};
