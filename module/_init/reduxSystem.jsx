import T from '../../view/js/common';

const UPDATE_SYSTEM_STATE = 'system:updateSystemState';

export default function systemReducer(state = null, data) {
    switch (data.type) {
        case UPDATE_SYSTEM_STATE:
            return Object.assign({}, state, data.state);

        default:
            return state;
    }
}

// Action -------------------------------------------------------------------------------------------------------------
export function saveSystemState(changes, done) {
    return dispatch => {
        const url = '/api/system';
        T.put(url, changes, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                T.notify('Save system information successful!', 'info');
                dispatch({ type: UPDATE_SYSTEM_STATE, state: data });
            }
        }, error => T.notify('Save system information failed!', 'danger'));
    }
}

export function getSystemState(done) {
    return dispatch => {
        const url = `/api/state`;
        T.get(url, data => {
            if (data) {
                dispatch({ type: UPDATE_SYSTEM_STATE, state: data });
            }
            if (done) done(data);
        }, error => {
            T.notify('Get system information failed!', 'danger');
            if (done) done();
        });
    }
}

export function login(data, done) {
    return dispatch => {
        T.post('/login', data, res => {
            if (res.error) {
                done({ error: res.error ? res.error : '' });
            } else {
                done({ user: res.user });
                // if (res.user) {
                //     window.location = '/user';
                // }
            }
        }, error => {
            done({ error: 'Login failed!' });
        });
    };
}

export function logout(config) {
    if (config == undefined) config = {};
    if (config.title == undefined) config.title = 'Logout';
    if (config.message == undefined) config.message = 'Are you sure want to logout?';
    if (config.errorMessage == undefined) config.errorMessage = 'Logout failed!';
    return dispatch => {
        T.confirm(config.title, config.message, true, isConfirm => {
            isConfirm && T.post('/logout', {},
                data => {
                    dispatch({ type: UPDATE_SYSTEM_STATE, state: { user: null } });
                    const pathname = window.location.pathname;
                    if (pathname.startsWith('/user')) {
                        window.location = '/';
                    } else if (config.done) {
                        config.done();
                    }
                },
                error => T.notify(config.errorMessage, 'danger')
            );
        });
    };
}

export function updateProfile(changes) {
    return dispatch => {
        const url = '/api/profile';
        T.put(url, { changes }, res => {
            if (res.error) {
                T.notify('Cập nhật thông tin cá nhân lỗi!', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật thông tin cá nhân thành công!', 'info');
                dispatch({ type: UPDATE_SYSTEM_STATE, state: { user: res.user } });
            }
        }, error => T.notify('Cập nhật thông tin cá nhân lỗi!', 'danger'));
    };
}


// AJAX ---------------------------------------------------------------------------------------------------------------
export function register(data, done) {
    T.post('/register', data, res => {
        if (res.error) {
            done({ error: res.error ? res.error : '' });
        } else {
            done({ user: res.user });
        }
    }, error => done({ error: 'Register failed!' }));
}

export function forgotPassword(email, onSuccess, onError) {
    T.put('/forgot-password', { email }, onSuccess, onError);
}


export function getSystemEmails(done) {
    T.get('/api/email/all', done, error => T.notify('Get email information failed!', 'danger'));
}

export function saveSystemEmails(type, email) {
    const url = '/api/email';
    T.put(url, { type, email }, data => {
        if (data.error) {
            console.error('PUT: ' + url + '.', data.error);
            T.notify('Save email information failed!', 'danger');
        } else {
            T.notify('Save email information successful!', 'info');
        }
    }, error => T.notify('Save email information failed!', 'danger'));
}

export function updateSystemState(state) {
    return { type: UPDATE_SYSTEM_STATE, state };
}
