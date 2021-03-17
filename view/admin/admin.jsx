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

import { changeCarouselItem } from 'modules/_default/fwHome/redux/reduxCarousel';
import { changeVideo } from 'modules/_default/fwHome/redux/reduxVideo';
import { changeCategory } from 'modules/_default/_init/reduxCategory';
import { getSystemState, updateSystemState } from 'modules/_default/_init/reduxSystem';
import { changeUser } from 'modules/_default/fwUser/redux';
import { addContact, changeContact } from 'modules/mdTruyenThong/fwContact/redux';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import AdminHeader from 'view/component/AdminHeader';
import AdminMenu from 'view/component/AdminMenu';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import _init from 'modules/_default/_init/index';
import fwCluster from 'modules/_default/fwCluster/index';
import fwUser from 'modules/_default/fwUser/index';
import fwRole from 'modules/_default/fwRole/index';
import fwHome from 'modules/_default/fwHome/index';
import fwMenu from 'modules/_default/fwMenu/index';
import fwContact from 'modules/mdTruyenThong/fwContact/index';
import fwSubscribe from 'modules/mdTruyenThong/fwSubscribe/index';
import fwEmail from 'modules/_default/fwEmail/index';
import fwForm from 'modules/_default/fwForm/index';
import fwNews from 'modules/mdTruyenThong/fwNews/index';
import fwDivision from 'modules/mdDaoTao/fwDivision/index';
import fwContentList from 'modules/_default/fwContentList/index';
import fwCourseType from 'modules/mdDaoTao/fwCourseType/index';
import fwCourse from 'modules/mdDaoTao/fwCourse/index';
import fwSubject from 'modules/mdDaoTao/fwSubject/index';
import fwLesson from 'modules/mdDaoTao/fwLesson/index';
import fwDangKyTuVan from 'modules/mdDaoTao/fwDangKyTuVan/index';
import fwDonDeNghiHoc from 'modules/mdDaoTao/fwDonDeNghiHoc/index';

const modules = [
    _init, fwCluster,
    fwUser, fwRole, fwHome, fwMenu,
    fwContact, fwSubscribe, fwEmail, fwForm, fwNews,
    fwDivision, fwContentList, fwCourseType, fwCourse, fwSubject, fwLesson, fwDangKyTuVan, fwDonDeNghiHoc,
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
                            <Route path='**' component={Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') })} />
                        </Switch>
                    </div>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { updateSystemState })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('app'));
