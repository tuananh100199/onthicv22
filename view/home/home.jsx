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
import Loading from '../component/Loading.jsx';
import Loader from '../component/Loader.jsx';
import HomeMenu from '../component/HomeMenu.jsx';
import HomeFooter from '../component/HomeFooter.jsx';
import LoginModal from '../component/LoginModal.jsx';
import LanguageSwitch from '../component/LanguageSwitch.jsx';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import _init from '../../module/_init/index.jsx';
import fwContact from '../../module/fwContact/index.jsx';
import fwHome from '../../module/fwHome/index.jsx';
import fwMenu from '../../module/fwMenu/index.jsx';
import fwUser from '../../module/fwUser/index.jsx';
import fwForm from '../../module/fwForm/index.jsx';

const modules = [ _init, fwHome, fwMenu, fwUser, fwContact, fwForm ];
import { getSystemState, register, login, forgotPassword, logout } from '../../module/_init/reduxSystem.jsx';

// Initialize Redux ---------------------------------------------------------------------------------------------------------------------------------
const reducers = {}, routeMapper = {},
    addRoute = route => routeMapper[route.path] = <Route key={route.path} {...route} />;
modules.forEach(module => {
    Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
    module.routes.forEach((route) => {
        if (!route.path.startsWith('/user')) {
            addRoute(route);
        }
    });
});
const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
store.dispatch(getSystemState());
window.T = T;

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    loader = React.createRef();
    loginModal = React.createRef();
    state = { routes: [], isMatch: true };
    
    componentDidMount() {
        // $(window).bind('beforeunload', function() {
        //     return "Do you want to exit this page?";
        // });
        const done = () => {
            if ($(this.loader.current).length > 0 && this.props.system && this.props.system.menus) { // Finished loading
                const handlePaddingFooter = () => {
                    const footerHeight = $('footer').height();
                    $('#paddingFooterSection').css('padding-bottom', footerHeight + 'px');
                }
                handlePaddingFooter();
                $(window).on('resize', handlePaddingFooter);
                
                this.loader.current.isShown() && this.loader.current.hide();
                let menuList = [ ...this.props.system.menus ];
                while (menuList.length) {
                    const currentMenu = menuList.pop();
                    const link = currentMenu.link ? currentMenu.link.toLowerCase() : '/';
                    if (!link.startsWith('http://') && !link.startsWith('https://') && routeMapper[link] == undefined) {
                        addRoute({
                            path: link,
                            component: Loadable({ loading: Loading, loader: () => import('../component/MenuPage.jsx') })
                        });
                    }
                    if (currentMenu.submenus && currentMenu.submenus.length) {
                        menuList.push(...currentMenu.submenus);
                    }
                }
                
                const routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);
                const pathname = window.location.pathname, paths = routes.map(route => route.props.path)
                const isMatch = paths.some(path => T.routeMatcher(path).parse(pathname))
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
        const { isMatch } = this.state;
        return (
            <BrowserRouter>
                {isMatch ?
                    <React.Fragment>
                        <HomeMenu showLoginModal={this.showLoginModal}/>
                        <Switch>
                            {this.state.routes}
                            <Route path='**' component={Loadable({
                                loading: Loading,
                                loader: () => import('../component/MessagePage.jsx')
                            })}/>
                        </Switch>
                        <div id='paddingFooterSection'/>
                        <HomeFooter/>
                        {/*<LanguageSwitch />*/}
                        <LoginModal ref={this.loginModal} register={this.props.register} login={this.props.login}
                                    forgotPassword={this.props.forgotPassword}
                                    pushHistory={url => this.props.history.push(url)}/>
                        <Loader ref={this.loader}/>
                    </React.Fragment> :
                    <React.Fragment>
                        <div>
                            <Switch>
                                <Route path='**' component={Loadable({
                                    loading: Loading,
                                    loader: () => import('../component/MessagePage.jsx')
                                })}/>
                            </Switch>
                        </div>
                    </React.Fragment>
                }
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { register, login, forgotPassword, logout })(App);
ReactDOM.render(<Provider store={store}><Main/></Provider>, document.getElementById('app'));
