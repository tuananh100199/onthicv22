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

import { changeCarouselItem } from '../../module/fwHome/redux/reduxCarousel.jsx';
import { changeVideo } from '../../module/fwHome/redux/reduxVideo.jsx';
import { changeCategory } from '../../module/_init/reduxCategory.jsx';
import { getSystemState, updateSystemState } from '../../module/_init/reduxSystem.jsx';
import { changeUser } from '../../module/fwUser/redux.jsx';
import { addContact, changeContact } from '../../module/fwContact/redux.jsx';
import Loadable from 'react-loadable';
import Loading from '../component/Loading.jsx';
import AdminHeader from '../component/AdminHeader.jsx';
import AdminMenu from '../component/AdminMenu.jsx';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import _init from '../../module/_init/index.jsx';
import fwHome from '../../module/fwHome/index.jsx';
import fwUser from '../../module/fwUser/index.jsx';
import fwRole from '../../module/fwRole/index.jsx';
import fwMenu from '../../module/fwMenu/index.jsx';
import fwContact from '../../module/fwContact/index.jsx';
import fwEmail from '../../module/fwEmail/index.jsx';
import fwForm from '../../module/fwForm/index.jsx';
import fwNews from '../../module/fwNews/index.jsx';
import fwContentList from '../../module/fwContentList/index.jsx';
import fwCourse from '../../module/fwCourse/index.jsx';
import fwBieuMau from '../../module/fwBieuMau/index.jsx';

const modules = [
    _init, fwMenu, fwRole, fwHome, fwUser, fwContact, fwEmail, fwForm, fwNews, fwCourse, fwBieuMau, fwContentList
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
                            <Route path='**' component={Loadable({ loading: Loading, loader: () => import('../component/MessagePage.jsx') })} />
                        </Switch>
                    </div>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { updateSystemState })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('app'));
