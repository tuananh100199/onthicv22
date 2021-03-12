import './scss/bootstrap/bootstrap.scss';
import './scss/admin/main.scss';
import './admin.scss';
import 'rc-tooltip/assets/bootstrap.css';

import T from '../js/common';
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { changeCarouselItem } from '../../module/fwHome/redux/reduxCarousel';
import { changeVideo } from '../../module/fwHome/redux/reduxVideo';
import { changeCategory } from '../../module/_init/reduxCategory';
import { getSystemState, updateSystemState } from '../../module/_init/reduxSystem';
import { changeUser } from '../../module/fwUser/redux';
import { addContact, changeContact } from '../../module/fwContact/redux';
import Loadable from 'react-loadable';
import Loading from '../component/Loading';
import AdminHeader from '../component/AdminHeader';
import AdminMenu from '../component/AdminMenu';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import _init from '../../module/_init/index';
import fwHome from '../../module/fwHome/index';
import fwUser from '../../module/fwUser/index';
import fwRole from '../../module/fwRole/index';
import fwMenu from '../../module/fwMenu/index';
import fwContact from '../../module/fwContact/index';
import fwEmail from '../../module/fwEmail/index';
import fwForm from '../../module/fwForm/index';
import fwNews from '../../module/fwNews/index';
import fwContentList from '../../module/fwContentList/index';
import fwAddress from '../../module/fwAddress/index';
import fwCourse from '../../module/fwCourse/index';
import fwDonDeNghiHoc from '../../module/fwDonDeNghiHoc/index';
import fwCluster from '../../module/fwCluster/index';
import fwDangKyTuVan from '../../module/fwDangKyTuVan/index';
import fwCourseType from '../../module/fwCourseType/index';
import fwMonHoc from '../../module/fwMonHoc/index';
import fwBaiHoc from '../../module/fwBaiHoc/index';

const modules = [
    _init, fwMenu, fwRole, fwHome, fwUser, fwContact, fwEmail, fwForm, fwNews, fwCourse, fwContentList, fwDonDeNghiHoc, fwCluster, fwAddress, fwCourseType, fwMonHoc, fwBaiHoc, fwDangKyTuVan
]
// Initialize Redux ---------------------------------------------------------------------------------------------------------------------------------
const reducers = {}, routeMapper = {}, addRoute = route => routeMapper[route.path] = <Route key={route.path} {...route} />;

modules.forEach(module => {
    Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
    module.routes.forEach((route) => {
        if (route.path.startsWith('/user')) {
            addRoute(route);
        }
    });
});

const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
store.dispatch(getSystemState());
window.T = T;

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);

    componentDidMount() {
        T.socket.on('category-changed', item => store.dispatch(changeCategory(item)));
        T.socket.on('carouselItem-changed', item => store.dispatch(changeCarouselItem(item)));
        T.socket.on('video-changed', item => store.dispatch(changeVideo(item)));

        T.socket.on('contact-added', item => store.dispatch(addContact(item)));
        T.socket.on('contact-changed', item => store.dispatch(changeContact(item)));

        T.socket.on('user-changed', user => {
            if (this.props.system && this.props.system.user && this.props.system.user._id == user._id) {
                store.dispatch(updateSystemState({ user: Object.assign({}, this.props.system.user, user) }));
            }
            store.dispatch(changeUser(user));
        });

        T.socket.on('debug-user-changed', user => {
            store.dispatch(updateSystemState({ user }));
        });

        T.socket.on('debug-role-changed', roles => {
            if (this.props.system && this.props.system.isDebug) {
                this.props.updateSystemState({ roles });
            }
        });
    }

    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                    <AdminHeader />
                    <AdminMenu />
                    <div className='site-content'>
                        <Switch>
                            {this.routes}
                            <Route path='**' component={Loadable({ loading: Loading, loader: () => import('../component/MessagePage') })} />
                        </Switch>
                    </div>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { updateSystemState })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('app'));
