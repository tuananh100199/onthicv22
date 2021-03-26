import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ListContentGetAll = 'ListContentGetAll';
const ListContentUpdate = 'ListContentUpdate';

export default function listContentReducer(state = null, data) {
    switch (data.type) {
        case ListContentGetAll:
            return Object.assign({}, state, { list: data.list });

        case ListContentUpdate:
            state = [];
            state = state.slice();
            if (state.length) {
                for (let i = 0; i < state.length; i++) {
                    if (state[i]._id == data.item._id) {
                        state[i] = data.item;
                        break;
                    }
                }
            } else state[0] = data.item;
            return state;

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getListContentAll(done) {
    return dispatch => {
        const url = `/api/list-content/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả danh sách bài viết bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done(data.list);
                dispatch({ type: ListContentGetAll, list: data.list ? data.list : [] });
            }
        }, error => console.error(`GET: ${url}. ${error}`));
    }
}

export function getListContent(_id, done) {
    return dispatch => ajaxGetListContent(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy danh sách nội dung bị lỗi!', 'danger');
            console.error(`GET: ${url}. ${data.error}`);
        } else {
            dispatch({ type: ListContentUpdate, item: data.item });
            done && done(data);
        }
    });
}

export function createListContent(newData, done) {
    return dispatch => {
        const url = `/api/list-content`;
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo danh sách bài viết bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getListContentAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo danh sách bài viết bị lỗi!', 'danger'));
    }
}

export function updateListContent(_id, changes, done) {
    return dispatch => {
        console.log(changes, 's')
        const url = `/api/list-content`;
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách bài viết bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                console.log('s');
                done && done(data.error);
            } else {
                dispatch({ type: ListContentUpdate, item: data.item });
                dispatch(getListContentAll());
                done && done();
            }
        }, error => T.notify('Cập nhật danh sách bài viết bị lỗi!', 'danger'));
    }
}

export function deleteListContent(_id) {
    return dispatch => {
        const url = `/api/list-content`;
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh sách bài viết bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa danh sách bài viết thành công!', 'error', false, 800);
                dispatch(getListContentAll());
            }
        }, error => T.notify('Xóa danh sách bài viết bị lỗi!', 'danger'));
    }
}

// Home ---------------------------------------------------------------------------------------------------------------
export function homeGetListContent(_id, done) {
    return dispatch => {
        const url = '/home/list-content';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết bị lỗi', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: ListContentUpdate, item: data.item });
                done && done(data);
            }
        }, error => T.notify('Lấy danh sách bài viết bị lỗi', 'danger'));
    }
}

export const ajaxSelectListContent = T.createAjaxAdapter(
    '/api/list-content/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.filter(item => item.active === true).map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetListContent(_id, done) {
    const url = '/api/list-content';
    T.get(url, { _id }, done, error => T.notify('Lấy danh sách nội dung bị lỗi!', 'danger'));
};