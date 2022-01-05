import T from 'view/js/common';

const SystemUpdateState = 'SystemUpdateState';

export default function systemReducer(state = null, data) {
    switch (data.type) {
        case SystemUpdateState:
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
                done && done(data);
                T.notify('Lưu thông tin hệ thống thành công!', 'success');
                dispatch({ type: SystemUpdateState, state: data });
            }
        }, error => console.error(error) || T.notify('Lưu thông tin hệ thống lỗi!', 'danger'));
    };
}

export function getSystemState(done) {
    return dispatch => {
        const url = '/api/state';
        T.get(url, data => {
            data && dispatch({ type: SystemUpdateState, state: data });
            done && done(data);
        }, error => {
            console.error(error);
            T.notify('Lấy thông tin hệ thống lỗi!', 'danger');
            done && done();
        });
    };
}

export function getStatistic(done) {
    return dispatch => {
        const url = '/api/statistic/dashboard';
        T.get(url, data => {
            data && dispatch({ type: SystemUpdateState, state: data });
            done && done(data);
        }, error => {
            console.error(error);
            T.notify('Lấy thông tin thống kê hệ thống lỗi!', 'danger');
            done && done();
        });
    };
}

export function updateStatisticCar(done) {
    return dispatch => {
        const url = '/api/statistic/dashboard/car';
        T.get(url, data => {
            data && dispatch({ type: SystemUpdateState, state: data });
            done && done(data);
        }, error => {
            console.error(error);
            T.notify('Lấy thông tin thống kê hệ thống lỗi!', 'danger');
            done && done();
        });
    };
}

export function updateStatisticTeacher(done) {
    return dispatch => {
        const url = '/api/statistic/dashboard/teacher';
        T.get(url, data => {
            data && dispatch({ type: SystemUpdateState, state: data });
            done && done(data);
        }, error => {
            console.error(error);
            T.notify('Lấy thông tin thống kê hệ thống lỗi!', 'danger');
            done && done();
        });
    };
}

export function getStatisticStudent(dateStart, dateEnd, done) {
    return dispatch => {
        const url = '/api/statistic/dashboard/student';
        T.get(url, { dateStart, dateEnd }, data => {
            data && dispatch({ type: SystemUpdateState });
            done && done(data);
        }, error => {
            console.error(error);
            T.notify('Lấy thông tin thống kê hệ thống lỗi!', 'danger');
            done && done();
        });
    };
}

export function getCaptureSetting(done) {
    return dispatch => {
        const url = '/api/capture';
        T.get(url, data => {
            data && dispatch({ type: SystemUpdateState, state: data });
            done && done(data);
        }, error => {
            console.error(error);
            T.notify('Lấy thông tin cấu hình nhận diện học viên bị lỗi!', 'danger');
            done && done();
        });
    };
}
export function updateCaptureSetting(changes, done) {
    return dispatch => {
        const url = '/api/capture';
        T.put(url, changes, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data);
                T.notify('Lưu thông tin cấu hình nhận diện học viên thành công!', 'success');
                dispatch({ type: SystemUpdateState, state: data });
            }
        }, error => console.error(error) || T.notify('Lưu thông tin hệ thống lỗi!', 'danger'));
    };
}

export function savePhoto(imageSrc, user, done) {
    return dispatch => {
        const url = '/api/capture/save';
        T.put(url, { imageSrc, user }, data => {
            if (data.error) {
                // T.notify(data.error, 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: SystemUpdateState, state: data });
            }
        }, error => console.error(error) || T.notify('Lưu thông tin hệ thống lỗi!', 'danger'));
    };
}

export function getListPhoto(date, user, done) {
    return dispatch => {
        const url = '/api/capture/photo';
        T.get(url, { date, user }, data => {
            if (data.error) {
                // T.notify(data.error, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: SystemUpdateState, state: data });
            }
        }, error => console.error(error) || T.notify('Lấy hình ảnh bị lỗi!', 'danger'));
    };
}

export function getListDocument(done) {
    return dispatch => {
        const url = '/api/document';
        T.get(url, data => {
            if (data.error) {
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: SystemUpdateState, state: data });
            }
        }, error => console.error(error) || T.notify('Lấy tài liệu bị lỗi!', 'danger'));
    };
}

export function deleteDocument(filename, done) {
    return dispatch => {
        const url = '/api/document';
        T.delete(url, { filename }, data => {
            if (data.error) {
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch(getListDocument());
            }
        }, error => console.error(error) || T.notify('Lấy tài liệu bị lỗi!', 'danger'));
    };
}

export function login(data, done) {
    return () => {
        T.post('/login', data, res => {
            if (res.error) {
                done({ error: res.error ? res.error : '' });
            } else {
                done({ user: res.user });
            }
        }, error => {
            console.error(error);
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
        if (config.type == 'faceDetect') {
            T.post('/logout', {},
                () => {
                    dispatch({ type: SystemUpdateState, state: { user: null } });
                    const pathname = window.location.pathname;
                    if (pathname.startsWith('/user')) {
                        window.location = '/';
                    } else if (config.done) {
                        config.done();
                    }
                },
                error => console.error(error) || T.notify(config.errorMessage, 'danger')
            );
        } else {
            T.confirm(config.title, config.message, true, isConfirm => {
                isConfirm && T.post('/logout', {},
                    () => {
                        dispatch({ type: SystemUpdateState, state: { user: null } });
                        const pathname = window.location.pathname;
                        if (pathname.startsWith('/user')) {
                            window.location = '/';
                        } else if (config.done) {
                            config.done();
                        }
                    },
                    error => console.error(error) || T.notify(config.errorMessage, 'danger')
                );
            });
        }
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
                dispatch({ type: SystemUpdateState, state: { user: res.user } });
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin cá nhân lỗi!', 'danger'));
    };
}

export function changeSystemState(changes) {
    return { type: SystemUpdateState, state: changes };
}


// AJAX ---------------------------------------------------------------------------------------------------------------
export function register(data, done) {
    T.post('/register', data, res => {
        if (res.error) {
            done({ error: res.error ? res.error : '' });
        } else {
            done({ user: res.user });
        }
    }, error => console.error(error) || done({ error: 'Đăng ký lỗi!' }));
}

export function forgotPassword(email, onSuccess, onError) {
    T.put('/forgot-password', { email }, onSuccess, onError);
}


export function getSystemEmails(done) {
    T.get('/api/email/all', done, error => console.error(error) || T.notify('Lấy email hệ thống lỗi!', 'danger'));
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
    }, error => console.error(error) || T.notify('Lưu thông tin email hệ thống lỗi!', 'danger'));
}

export function updateSystemState(state) {
    return { type: SystemUpdateState, state };
}
