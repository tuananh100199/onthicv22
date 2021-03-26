import T from 'view/js/common';

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
                T.notify('Lưu thông tin hệ thống thành công!', 'success');
                dispatch({ type: UPDATE_SYSTEM_STATE, state: data });
            }
        }, error => T.notify('Lưu thông tin hệ thống lỗi!', 'danger'));
    }
}

export function getSystemState(done) {
    return dispatch => {
        const url = `/api/state`;
        T.get(url, data => {
            data && dispatch({ type: UPDATE_SYSTEM_STATE, state: data });
            if (done) done(data);
        }, error => {
            T.notify('Lấy thông tin hệ thống lỗi!', 'danger');
            if (done) done();
        });
    }
}

export function getStatistic(done) {
    return dispatch => {
        const url = `/api/statistic/dashboard`;
        T.get(url, data => {
            data && dispatch({ type: UPDATE_SYSTEM_STATE, state: data });
            if (done) done(data);
        }, error => {
            T.notify('Lấy thông tin thống kê hệ thống lỗi!', 'danger');
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
            }
        }, error => {
            done({ error: 'Đăng nhập thất bại!' });
        });
    };
}

export function logout(config) {
    if (config == undefined) config = {};
    if (config.title == undefined) config.title = 'Đăng xuất';
    if (config.message == undefined) config.message = 'Bạn có muốn đăng xuất không?';
    if (config.errorMessage == undefined) config.errorMessage = 'Đăng xuất thất bại!';
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
    }, error => done({ error: 'Đăng ký lỗi!' }));
}

export function forgotPassword(email, onSuccess, onError) {
    T.put('/forgot-password', { email }, onSuccess, onError);
}


export function getSystemEmails(done) {
    T.get('/api/email/all', done, error => T.notify('Lấy email hệ thống lỗi!', 'danger'));
}

export function saveSystemEmails(type, email) {
    const url = '/api/email';
    T.put(url, { type, email }, data => {
        if (data.error) {
            console.error('PUT: ' + url + '.', data.error);
            T.notify('Lưu thông tin email hệ thống lỗi!', 'danger');
        } else {
            T.notify('Lưu thông tin email hệ thống thành công!', 'success');
        }
    }, error => T.notify('Lưu thông tin email hệ thống lỗi!', 'danger'));
}

export function updateSystemState(state) {
    return { type: UPDATE_SYSTEM_STATE, state };
}
