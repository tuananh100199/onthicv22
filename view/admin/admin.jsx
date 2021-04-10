import './scss/bootstrap/bootstrap.scss';
import './scss/admin/main.scss';
import './admin.scss';
import 'rc-tooltip/assets/bootstrap.css';

import T from '../js/common'; window.T = T;
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { getSystemState, updateSystemState } from 'modules/_default/_init/redux';
import { changeUser } from 'modules/_default/fwUser/redux';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import AdminHeader from 'view/component/AdminHeader';
import AdminMenu from 'view/component/AdminMenu';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import { modules } from './modules.jsx';
const reducers = {}, routeMapper = {}, addRoute = route => routeMapper[route.path] = <Route key={route.path} {...route} />;
modules.forEach(module => {
    module.init && module.init();
    Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
    module.routes.forEach((route) => {
        if (route.path.startsWith('/user')) {
            addRoute(route);
        }
    });
});

const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
store.dispatch(getSystemState());

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);

    componentDidMount() {
        T.socket.on('user-changed', user => {
            if (this.props.system && this.props.system.user && this.props.system.user._id == user._id) {
                store.dispatch(updateSystemState({ user: Object.assign({}, this.props.system.user, user) }));
            }
            store.dispatch(changeUser(user));
        });

        T.socket.on('debug-user-changed', user => store.dispatch(updateSystemState({ user })));
        T.socket.on('debug-role-changed', roles => this.props.system && this.props.system.isDebug && this.props.updateSystemState({ roles }));
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
