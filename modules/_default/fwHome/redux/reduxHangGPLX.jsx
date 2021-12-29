import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const HangGPLXGetAll = 'HangGPLXGetAll';
const HangGPLXUpdate = 'HangGPLXUpdate';

export default function hangGPLXReducer(state = {}, data) {
    switch (data.type) {
        case HangGPLXGetAll:
            return Object.assign({}, state, { list: data.list });

        case HangGPLXUpdate:
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
export function getHangGPLXAll(done) {
    return dispatch => {
        const url = '/api/hang-gplx/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy hạng giấy phép lái xe bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: HangGPLXGetAll, list: data.list ? data.list : [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    };
}

export function getHangGPLX(_id, done) {
    return dispatch => ajaxGetHangGPLX(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy hạng giấy phép lái xe bị lỗi!', 'danger');
        } else {
            dispatch({ type: HangGPLXUpdate, item: data.item });
            done && done(data);
        }
    });
}

export function createHangGPLX(data, done) {
    return dispatch => {
        const url = '/api/hang-gplx';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo hạng giấy phép lái xe bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getHangGPLXAll());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo hạng giấy phép lái xe bị lỗi!', 'danger'));
    };
}

export function updateHangGPLX(_id, changes, done) {
    return dispatch => {
        const url = '/api/hang-gplx';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật hạng giấy phép lái xe bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hạng giấy phép lái xe thành công!', 'success');
                dispatch(getHangGPLXAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật hạng giấy phép lái xe bị lỗi!', 'danger'));
    };
}

export function deleteHangGPLX(_id) {
    return dispatch => {
        const url = '/api/hang-gplx';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa hạng giấy phép lái xe bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('hạng giấy phép lái xe được xóa thành công!', 'error', false, 800);
                dispatch(getHangGPLXAll());
            }
        }, error => console.error(error) || T.notify('Xóa hạng giấy phép lái xe bị lỗi!', 'danger'));
    };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function homeGetHangGPLX(_id, done) {
    return dispatch => {
        const url = '/home/hang-gplx';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy hạng giấy phép lái xe bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: HangGPLXUpdate, item: data.item });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy hạng giấy phép lái xe bị lỗi', 'danger'));
    };
}

export const ajaxSelectHangGPLX = T.createAjaxAdapter(
    '/api/hang-gplx/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetHangGPLX(_id, done) {
    const url = '/api/hang-gplx';
    T.get(url, { _id }, done, () => T.notify('Lấy hạng giấy phép lái xe bị lỗi!', 'danger'));
}