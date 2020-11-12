import T from '../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ContentListGetAll = 'ContentList:GetAll';
const ContentListUpdate = 'ContentList:Update';
const ContentListAddItem = 'ContentList:AddItem';
const ContentListUpdateItem = 'ContentList:UpdateItem';
const ContentListRemoveItem = 'ContentList:RemoveItem';

export default function ContentListReducer(state = null, data) {
    switch (data.type) {
        case ContentListGetAll:
            return Object.assign({}, state, { list: data.items });

        case ContentListAddItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                state.item.items.push({
                    title: data.title,
                    listOfContentId: data.listOfContentId,
                });
            }
            return state;

        case ContentListUpdateItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1, {
                        title: data.title,
                        listOfContentId: data.listOfContentId,
                    });
                }
            }
            return state;

        case ContentListRemoveItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1);
                }
            }
            return state;


        case ContentListUpdate:
            state = Object.assign({}, state);
            const updatedItem = data.item;
            if (state && state.selectedItem && state.selectedItem._id == updatedItem.ContentListId) {
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
                T.notify('Lấy tất cả danh sách video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: ContentListGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả danh sách video bị lỗi!', 'danger'));
    }
}

export function createContentList(newData, done) {
    return dispatch => {
        const url = '/api/list-video';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo danh sách video bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Tạo danh sách video bị lỗi!', 'danger'));
    }
}

export function updateContentList(_id, changes, done) {
    return dispatch => {
        const url = '/api/list-video';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách video bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật danh sách video thành công!', 'info');
                dispatch(getAllContentList());
                done && done();
            }
        }, error => T.notify('Cập nhật danh sách video bị lỗi!', 'danger'));
    }
}

export function deleteContentList(_id) {
    return dispatch => {
        const url = '/api/list-video';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh sách video bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa danh sách video thành công!', 'error', false, 800);
                dispatch(getAllContentList());
            }
        }, error => T.notify('Xóa danh sách video bị lỗi!', 'danger'));
    }
}



export function getContentListItem(_id, done) {
    return dispatch => {
        const url = '/api/list-video/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            }
            if (done) done(data);

        }, error => T.notify('Lấy danh sách video bị lỗi', 'danger'));
    }
}
// video... 
export function addVideoIntoList(title, link, image) {
    return { type: ContentListAddItem, title, link, image };
}

export function updateVideoInList(index, title, link, image) {
    return { type: ContentListUpdateItem, index, title, link, image };
}

export function removeVideoFromList(index) {
    return { type: ContentListRemoveItem, index };
}



export function getContentListByUser(_id, done) {
    return dispatch => {
        const url = '/home/list-video/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify('Lấy danh sách video bị lỗi', 'danger'));
    }
}

export function createContentListItem(data, done) {
    return dispatch => {
        const url = '/api/list-video/item';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Create list video item failed!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllContentList(data.item.ContentListId));
                if (done) done(data);
            }
        }, error => T.notify('Create list video item failed!', 'danger'));
    }
}

export function updateContentListItem(_id, changes, done) {
    return dispatch => {
        const url = '/api/list-video/item';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Update list video item failed!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Update list video item successful!', 'info');
                dispatch(getAllContentList(data.item.ContentListId));
                if (done) done();
            }
        }, error => T.notify('Update list video item failed!', 'danger'));
    }
}

export function swapContentListItem(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/list-video/item/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Swap list video item failed!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllContentList(data.item1.ContentListId));
            }
        }, error => T.notify('Swap list video item failed!', 'danger'));
    }
}

export function deleteContentListItem(_id) {
    return dispatch => {
        const url = '/api/list-video/item';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Delete list video item failed!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Hình ảnh được xóa thành công!', 'error', false, 800);
                dispatch(getAllContentList(data.ContentListId));
            }
        }, error => T.notify('Delete list video item failed!', 'danger'));
    }
}

export function changeContentListItem(item) {
    return { type: ContentListUpdate, item };
} 