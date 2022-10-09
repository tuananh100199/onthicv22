import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const GioiThieuGetAll = 'GioiThieuGetAll';
const GioiThieuUpdate = 'GioiThieuUpdate';

export default function gioiThieuReducer(state = {}, data) {
    switch (data.type) {
        case GioiThieuGetAll:
            return Object.assign({}, state, { list: data.list });

        case GioiThieuUpdate:
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
export function getGioiThieuAll(done) {
    return dispatch => {
        const url = '/api/gioi-thieu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bài giới thiệu Hiệp Phát bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: GioiThieuGetAll, list: data.list ? data.list : [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    };
}

export function getGioiThieu(_id, done) {
    return dispatch => ajaxGetGioiThieu(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy bài giới thiệu Hiệp Phát bị lỗi!', 'danger');
        } else {
            dispatch({ type: GioiThieuUpdate, item: data.item });
            done && done(data);
        }
    });
}

export function createGioiThieu(data, done) {
    return dispatch => {
        const url = '/api/gioi-thieu';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo bài giới thiệu Hiệp Phát bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getGioiThieuAll());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo bài giới thiệu Hiệp Phát bị lỗi!', 'danger'));
    };
}

export function updateGioiThieu(_id, changes, done) {
    return dispatch => {
        const url = '/api/gioi-thieu';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật bài giới thiệu Hiệp Phát bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Nội dung bài giới thiệu Hiệp Phát thành công!', 'success');
                dispatch(getGioiThieuAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật bài giới thiệu Hiệp Phát bị lỗi!', 'danger'));
    };
}

export function deleteGioiThieu(_id) {
    return dispatch => {
        const url = '/api/gioi-thieu';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa bài giới thiệu Hiệp Phát bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Bài giới thiệu Hiệp Phát được xóa thành công!', 'error', false, 800);
                dispatch(getGioiThieuAll());
            }
        }, error => console.error(error) || T.notify('Xóa bài giới thiệu Hiệp Phát bị lỗi!', 'danger'));
    };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function homeGetGioiThieu(_id, done) {
    return dispatch => {
        const url = '/home/gioi-thieu';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy bài giới thiệu Hiệp Phát bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: GioiThieuUpdate, item: data.item });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy bài giới thiệu Hiệp Phát bị lỗi', 'danger'));
    };
}

export const ajaxSelectGioiThieu = T.createAjaxAdapter(
    '/api/gioi-thieu/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetGioiThieu(_id, done) {
    const url = '/api/gioi-thieu';
    T.get(url, { _id }, done, () => T.notify('Lấy bài giới thiệu Hiệp Phát bị lỗi!', 'danger'));
}