import './home.scss';
import T from '../js/common'; window.T = T;
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
import { getSystemState, register, login, forgotPassword, logout } from 'modules/_default/_init/redux';
import { modules } from './modules.jsx';
const reducers = {}, routeMapper = {},
    addRoute = (route) => routeMapper[route.path] = <Route key={route.path} {...route} />;
modules.forEach(module => {
    module.init && module.init();
    Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
    module.routes.forEach(route => !route.path.startsWith('/user') && addRoute(route));
});
const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
store.dispatch(getSystemState());

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    loginModal = React.createRef();
    state = { routes: [], isMatch: true };
    componentDidMount() {
        const done = () => {
            if ($(this.loader).length > 0 && this.props.system && this.props.system.menus) { // Finished loading
                const handlePaddingFooter = () => $('#paddingFooterSection').css('padding-bottom', $('footer').height() + 'px');
                handlePaddingFooter();
                setTimeout(handlePaddingFooter, 250);
                $(window).on('resize', handlePaddingFooter);
                this.loader.isShown() && this.loader.hide();
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
                const pathname = window.location.pathname;
                const isMatch = routes.some(route => T.routeMatcher(route.props.path).parse(pathname));
                this.setState({ routes, isMatch });
            } else {
                setTimeout(done, 200);
            }
        };
        $(document).ready(done);
    }

    showLoginModal = e => {
        e.preventDefault();
        if (this.props.system && this.props.system.user) {
            this.props.logout();
        } else {
            this.loginModal.showLogin();
        }
    }

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
                        <LoginModal ref={e => this.loginModal = e} register={this.props.register} login={this.props.login} forgotPassword={this.props.forgotPassword}
                            pushHistory={url => this.props.history.push(url)} />
                        <Loader ref={e => this.loader = e} />
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
