import './home.scss';
import T from '../js/common';
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import Loader from 'view/component/Loader';
import HomeMenu from 'view/component/HomeMenu';
import HomeFooter from 'view/component/HomeFooter';
import LoginModal from 'view/component/LoginModal';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import _init from 'modules/_default/_init/index';
import fwContact from 'modules/mdTruyenThong/fwContact/index';
import fwSubscribe from 'modules/mdTruyenThong/fwSubscribe/index';
import fwHome from 'modules/_default/fwHome/index';
import fwMenu from 'modules/_default/fwMenu/index';
import fwUser from 'modules/_default/fwUser/index';
import fwNews from 'modules/mdTruyenThong/fwNews/index';
import fwCourse from 'modules/mdDaoTao/fwCourse/index';
import fwDivision from 'modules/mdDaoTao/fwDivision/index';
import fwCourseType from 'modules/mdDaoTao/fwCourseType/index';
import fwCandidate from 'modules/mdDaoTao/fwCandidate';

window.T = T;
const modules = [_init, fwHome, fwMenu, fwUser, fwContact, fwSubscribe, fwNews, fwCourse, fwDivision, fwCourseType, fwCandidate];
import { getSystemState, register, login, forgotPassword, logout } from 'modules/_default/_init/reduxSystem';

// Initialize Redux ---------------------------------------------------------------------------------------------------------------------------------
const reducers = {}, routeMapper = {},
    addRoute = route => routeMapper[route.path] = <Route key={route.path} {...route} />;
modules.forEach(module => {
    module.init && module.init();
    Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
    module.routes.forEach((route) => {
        if (!route.path.startsWith('/user')) {
            addRoute(route);
        }
    });
});
const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
store.dispatch(getSystemState());

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    loader = React.createRef();
    loginModal = React.createRef();
    state = { routes: [], isMatch: true };

    componentDidMount() {
        const done = () => {
            if ($(this.loader.current).length > 0 && this.props.system && this.props.system.menus) { // Finished loading
                const handlePaddingFooter = () => $('#paddingFooterSection').css('padding-bottom', $('footer').height() + 'px');
                handlePaddingFooter()
                setTimeout(handlePaddingFooter, 250)
                $(window).on('resize', handlePaddingFooter);
                this.loader.current.isShown() && this.loader.current.hide();
                let menuList = [...this.props.system.menus];
                while (menuList.length) {
                    const currentMenu = menuList.pop();
                    const link = currentMenu.link ? currentMenu.link.toLowerCase() : '/';
                    if (!link.startsWith('http://') && !link.startsWith('https://') && routeMapper[link] == undefined) {
                        addRoute({
                            path: link,
                            component: Loadable({ loading: Loading, loader: () => import('modules/_default/fwMenu/MenuPage') })
                        });
                    }
                    if (currentMenu.submenus && currentMenu.submenus.length) {
                        menuList.push(...currentMenu.submenus);
                    }
                }

                const routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);
                const pathname = window.location.pathname, paths = routes.map(route => route.props.path);
                const isMatch = paths.some(path => T.routeMatcher(path).parse(pathname));
                this.setState({ routes, isMatch });
            } else {
                setTimeout(done, 200)
            }
        };
        $(document).ready(done);
    }

    showLoginModal = e => {
        e.preventDefault();
        if (this.props.system && this.props.system.user) {
            this.props.logout();
        } else {
            this.loginModal.current.showLogin();
        }
    };

    render() {
        return (
            <BrowserRouter>
                {this.state.isMatch ?
                    <React.Fragment>
                        <HomeMenu showLoginModal={this.showLoginModal} />
                        <Switch>
                            {this.state.routes}
                            <Route path='**' component={Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') })} />
                        </Switch>
                        <div id='paddingFooterSection' style={{ marginTop: '15px' }} />
                        <HomeFooter />
                        <LoginModal ref={this.loginModal} register={this.props.register} login={this.props.login} forgotPassword={this.props.forgotPassword}
                            pushHistory={url => this.props.history.push(url)} />
                        <Loader ref={this.loader} />
                    </React.Fragment> :
                    <React.Fragment>
                        <Switch>
                            <Route path='**' component={Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') })} />
                        </Switch>
                    </React.Fragment>
                }
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { register, login, forgotPassword, logout })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('app'));
