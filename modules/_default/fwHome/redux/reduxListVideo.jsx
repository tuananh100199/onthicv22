import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ListVideoGetAll = 'ListVideoGetAll';
const ListVideoUpdate = 'ListVideoUpdate';

export default function listVideoReducer(state = {}, data) {
    switch (data.type) {
        case ListVideoGetAll:
            return Object.assign({}, state, { list: data.list });

        case ListVideoUpdate:
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

// Actions ------------------------------------------------------------------------------------------------------------
export function getListVideoAll(done) {
    return dispatch => {
        const url = '/api/list-video/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả danh sách video bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done(data.list);
                dispatch({ type: ListVideoGetAll, list: data.list || [] });
            }
        }, error => console.error(`GET: ${url}. ${error}`))
    }
}

export function getListVideo(_id, done) {
    return dispatch => ajaxGetListVideo(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy danh sách video bị lỗi!', 'danger');
            console.error(`GET: ${url}. ${data.error}`);
        } else {
            dispatch(getListVideoAll());
            dispatch({ type: ListVideoUpdate, item: data.item });
            done && done(data);
        }
    });
}

export function createListVideo(data, done) {
    return dispatch => {
        const url = '/api/list-video';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo danh sách video bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getListVideoAll())
                if (done) done(data);
            }
        }, error => T.notify('Tạo danh sách video bị lỗi!', 'danger'));
    }
}

export function updateListVideo(_id, changes, done) {
    return dispatch => {
        const url = '/api/list-video';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách video bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                dispatch(getListVideoAll());
                dispatch({ type: ListVideoUpdate, item: data.item });
                done && done();
            }
        }, error => T.notify('Cập nhật danh sách video bị lỗi!', 'danger'));
    }
}

export function deleteListVideo(_id) {
    return dispatch => {
        const url = '/api/list-video';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh sách video bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa danh sách video thành công!', 'error', false, 800);
                dispatch(getListVideoAll());
            }
        }, error => T.notify('Xóa danh sách video bị lỗi!', 'danger'));
    }
}

export function getListVideoByUser(_id, done) {
    return dispatch => {
        const url = '/home/list-video/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Lấy danh sách video bị lỗi', 'danger'));
    }
}
export const ajaxSelectListVideo = T.createAjaxAdapter(
    '/api/list-video/all',
    response => response && response.items ? response.items.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetListVideo(_id, done) {
    const url = '/api/list-video';
    T.get(url, { _id }, done, error => T.notify('Lấy list video bị lỗi!', 'danger'));
}
