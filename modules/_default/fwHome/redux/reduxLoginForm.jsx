import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const LoginFormGetAll = 'LoginFormGetAll';
const LoginFormUpdate = 'LoginFormUpdate';

export default function loginFormReducer(state = {}, data) {
    switch (data.type) {
        case LoginFormGetAll:
            return Object.assign({}, state, { list: data.list });

        case LoginFormUpdate:
            state = state && state.list ? state.list.slice() : { list: [] };
            for (let i = 0; i < state.length; i++) {
                if (state[i]._id == data.item._id) {
                    state[i] = data.item;
                    break;
                }
            }
            return state;

        default:
            return state;
    }
}

// Action -------------------------------------------------------------------------------------------------------------
export function getLoginFormAll(done) {
    return dispatch => {
        const url = '/api/loginForm/all';
        T.get(url, data => {
            console.log('data', data);
            if (data.error) {
                T.notify('Lấy danh sách đăng nhập bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: LoginFormGetAll, list: data.list ? data.list : [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    };
}

export function getLoginForm(_id, done) {
    return dispatch => ajaxGetLoginForm(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy đăng nhập bị lỗi!', 'danger');
        } else {
            dispatch({ type: LoginFormUpdate, item: data.item });
            done && done(data);
        }
    });
}

export function createLoginForm(data, done) {
    return dispatch => {
        const url = '/api/loginForm';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo đăng nhập bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getLoginFormAll());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo đăng nhập bị lỗi!', 'danger'));
    };
}

export function updateLoginForm(_id, changes, done) {
    return dispatch => {
        const url = '/api/loginForm';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đăng nhập bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Đăng nhập cập nhật thành công!', 'success');
                dispatch(getLoginFormAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật đăng nhập bị lỗi!', 'danger'));
    };
}

export function deleteLoginForm(_id) {
    return dispatch => {
        const url = '/api/loginForm';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa đăng nhập bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('đăng nhập được xóa thành công!', 'error', false, 800);
                dispatch(getLoginFormAll());
            }
        }, error => console.error(error) || T.notify('Xóa đăng nhập bị lỗi!', 'danger'));
    };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function homegetLoginForm(_id, done) {
    return dispatch => {
        const url = '/home/loginForm';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy đăng nhập bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: LoginFormUpdate, item: data.item });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy đăng nhập bị lỗi', 'danger'));
    };
}

export const ajaxSelectLoginForm = T.createAjaxAdapter(
    '/api/loginForm/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetLoginForm(_id, done) {
    const url = '/api/loginForm';
    T.get(url, { _id }, done, () => T.notify('Lấy đăng nhập bị lỗi!', 'danger'));
}