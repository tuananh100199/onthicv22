import T from '../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ContentListGet = 'ContentList:Get';
const ContentListGetAll = 'ContentList:GetAll';
const ContentListUpdate = 'ContentList:Update';

export default function contentListReducer(state = null, data) {
    switch (data.type) {
        case ContentListGetAll:
            return Object.assign({}, state, { list: data.items });
            
        case ContentListGet: {
            return Object.assign({}, state, { item: data.item });
        }
        
        case ContentListUpdate:
            state = Object.assign({}, state);
            const updatedItem = data.item;
            if (state && state.selectedItem && state.selectedItem._id == updatedItem.contentListId) {
                for (let i = 0, items = state.selectedItem.items, n = items.length; i < n; i++) {
                    if (items[i]._id == updatedItem._id) {
                        state.selectedItem.items.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return state;

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllContentList(done) {
    return dispatch => {
        const url = '/api/list-content/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả danh sách bài viết bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: ContentListGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả danh sách bài viết bị lỗi!', 'danger'));
    }
}

export function getContentListItem(_id, done) {
    return dispatch => {
        const url = '/api/list-content/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: ContentListGet, item: data.item });
            }
            if (done) done(data);
            
        }, error => T.notify('Lấy danh sách bài viết bị lỗi', 'danger'));
    }
}

export function createContentList(newData, done) {
    return dispatch => {
        const url = '/api/list-content';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo danh sách bài viết bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                dispatch(getAllContentList());
            }
        }, error => T.notify('Tạo danh sách bài viết bị lỗi!', 'danger'));
    }
}

export function updateContentList(_id, changes, done) {
    return dispatch => {
        const url = '/api/list-content';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách bài viết bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: ContentListGet, item: data.item });
                dispatch(getAllContentList());
                done && done();
            }
        }, error => T.notify('Cập nhật danh sách bài viết bị lỗi!', 'danger'));
    }
}

export function deleteContentList(_id) {
    return dispatch => {
        const url = '/api/list-content';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh sách bài viết bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa danh sách bài viết thành công!', 'error', false, 800);
                dispatch(getAllContentList());
            }
        }, error => T.notify('Xóa danh sách bài viết bị lỗi!', 'danger'));
    }
}

export function getContentListByUser(_id, done) {
    return dispatch => {
        const url = '/home/list-content/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify('Lấy danh sách bài viết bị lỗi', 'danger'));
    }
}