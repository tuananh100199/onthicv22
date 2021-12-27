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
import { getSystemState, updateSystemState, getCaptureSetting, savePhoto } from 'modules/_default/_init/redux';
import { changeUser } from 'modules/_default/fwUser/redux';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import AdminHeader from 'view/component/AdminHeader';
import AdminMenu from 'view/component/AdminMenu';
import Webcam from 'react-webcam';
import * as faceApi from 'face-api.js';


// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import { modules } from './modules.jsx';
const reducers = {}, reducerContainer = {}, routeMapper = {},
    addRoute = route => routeMapper[route.path] = <Route key={route.path} exact {...route} />;
modules.forEach(module => {
    module.init && module.init();
    module.routes.forEach(route => route.path.startsWith('/user') && addRoute(route));

    if (module.redux.parent && module.redux.reducers) {
        if (!reducerContainer[module.redux.parent]) reducerContainer[module.redux.parent] = {};
        reducerContainer[module.redux.parent] = Object.assign({}, reducerContainer[module.redux.parent], module.redux.reducers);
    } else {
        Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
    }
});
Object.keys(reducerContainer).forEach(key => reducers[key] = combineReducers(reducerContainer[key]));

const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    state = { routes: [] };
    componentDidMount() {
        const routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);
        this.props.getSystemState(() => this.setState({ routes }));

        T.socket.on('user-changed', user => {
            if (this.props.system && this.props.system.user && this.props.system.user._id == user._id) {
                store.dispatch(updateSystemState({ user: Object.assign({}, this.props.system.user, user) }));
            }
            store.dispatch(changeUser(user));
        });
        this.props.getCaptureSetting(data => {
            const user = this.props.system && this.props.system.user;
            const { numberOfMinScreenCapture = 5, activeCapture = false } = data || {};
            if (activeCapture && user && !(user.isCourseAdmin || user.isLecturer)) {
                window.interval = setInterval(() => {
                    const imageSrc = this.webcam.getScreenshot();
                    this.setState({ imageSrc }, () => {
                        this.props.savePhoto(imageSrc, user._id);
                        faceApi.nets.ssdMobilenetv1.load('/models/').then(() => {
                            const options = new faceApi.SsdMobilenetv1Options({
                                inputSize: 512,
                                scoreThreshold: 0.5
                            });
                            faceApi.detectSingleFace('img', options).then((result) => {
                                if (result) console.log('Đã phát hiện khuôn mặt');
                                else console.log('Không phát hiện khuôn mặt');
                            });
                        });
                    });
                }, 12000 * numberOfMinScreenCapture);
            }
        });
        T.socket.on('debug-user-changed', user => store.dispatch(updateSystemState({ user })));
        T.socket.on('debug-role-changed', roles => this.props.system && this.props.system.isDebug && this.props.updateSystemState({ roles }));
    }

    render() {
        const videoConstraints = {
            width: 1280,
            height: 720,
            facingMode: 'user'
        };
        const imgSrc = this.state.imageSrc;
        return (
            <BrowserRouter>
                <React.Fragment>
                    <AdminHeader />
                    <AdminMenu />
                    <div className='site-content'>
                        <span className='invisible float-left' style={{ marginRight: '-240px' }}>
                            <Webcam
                                audio={false}
                                height={240}
                                ref={e => this.webcam = e}
                                screenshotFormat='image/jpeg'
                                width={240}
                                videoConstraints={videoConstraints}
                            />
                        </span>
                        {imgSrc && (<img className='d-none' id='img' src={imgSrc}></img>)}
                        <Switch>
                            {this.state.routes}
                            <Route path='**' component={Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') })} />
                        </Switch>
                    </div>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { getSystemState, updateSystemState, savePhoto, getCaptureSetting })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('app'));
