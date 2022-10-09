import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const ContentGetAll = 'ContentGetAll';
const ContentUpdate = 'ContentUpdate';

export default function contentReducer(state = {}, data) {
    switch (data.type) {
        case ContentGetAll:
            return Object.assign({}, state, { list: data.list });

        case ContentUpdate:
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
export function getContentAll(done) {
    return dispatch => {
        const url = '/api/content/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nội dung bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: ContentGetAll, list: data.list ? data.list : [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    };
}

export function getContent(_id, done) {
    return dispatch => ajaxGetContent(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy nội dung bị lỗi!', 'danger');
        } else {
            dispatch({ type: ContentUpdate, item: data.item });
            done && done(data);
        }
    });
}

export function createContent(data, done) {
    return dispatch => {
        const url = '/api/content';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo nội dung bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getContentAll());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo nội dung bị lỗi!', 'danger'));
    };
}

export function updateContent(_id, changes, done) {
    return dispatch => {
        const url = '/api/content';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật nội dung bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Nội dung cập nhật thành công!', 'success');
                dispatch(getContentAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật nội dung bị lỗi!', 'danger'));
    };
}

export function deleteContent(_id) {
    return dispatch => {
        const url = '/api/content';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa nội dung bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Nội dung được xóa thành công!', 'error', false, 800);
                dispatch(getContentAll());
            }
        }, error => console.error(error) || T.notify('Xóa nội dung bị lỗi!', 'danger'));
    };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function homeGetContent(_id, done) {
    return dispatch => {
        const url = '/home/content';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy nội dung bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: ContentUpdate, item: data.item });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy nội dung bị lỗi', 'danger'));
    };
}

export const ajaxSelectContent = T.createAjaxAdapter(
    '/api/content/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetContent(_id, done) {
    const url = '/api/content';
    T.get(url, { _id }, done, () => T.notify('Lấy nội dung bị lỗi!', 'danger'));
}