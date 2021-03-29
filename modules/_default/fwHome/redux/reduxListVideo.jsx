import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ListVideoGetAll = 'ListVideo:GetAll';
const ListVideoUpdate = 'ListVideo:Update';

export default function listVideoReducer(state = null, data) {
    switch (data.type) {
        case ListVideoGetAll:
            return Object.assign({}, state, { list: data.items });

        case ListVideoUpdate:
            state = Object.assign({}, state);
            const updatedItem = data.item;
            if (state && state.selectedItem && state.selectedItem._id == updatedItem.listVideoId) {
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
export function getListVideoAll(done) {
    return dispatch => {
        const url = '/api/list-video/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả danh sách video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: ListVideoGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả danh sách video bị lỗi!', 'danger'));
    }
}

export function createListVideo(data, done) {
    return dispatch => {
        const url = '/api/list-video';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo danh sách video bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
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
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật danh sách video thành công!', 'info');
                dispatch(getListVideoAll());
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
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa danh sách video thành công!', 'error', false, 800);
                dispatch(getListVideoAll());
            }
        }, error => T.notify('Xóa danh sách video bị lỗi!', 'danger'));
    }
}



export function getListVideoItem(_id, done) {
    return dispatch => {
        const url = '/api/list-video';
        T.get(url, { _id }, data => {
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
    return { type: ListVideoAddItem, title, link, image };
}

export function updateVideoInList(index, title, link, image) {
    return { type: ListVideoUpdateItem, index, title, link, image };
}

export function removeVideoFromList(index) {
    return { type: ListVideoRemoveItem, index };
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

export function createListVideoItem(data, done) {
    return dispatch => {
        const url = '/api/list-video/item';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Create list video item failed!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getListVideoAll(data.item.listVideoId));
                if (done) done(data);
            }
        }, error => T.notify('Create list video item failed!', 'danger'));
    }
}

export function updateListVideoItem(_id, changes, done) {
    return dispatch => {
        const url = '/api/list-video/item';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Update list video item failed!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Update list video item successful!', 'info');
                dispatch(getListVideoAll(data.item.listVideoId));
                if (done) done();
            }
        }, error => T.notify('Update list video item failed!', 'danger'));
    }
}

export function swapListVideoItem(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/list-video/item/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Swap list video item failed!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                dispatch(getListVideoAll(data.item1.listVideoId));
            }
        }, error => T.notify('Swap list video item failed!', 'danger'));
    }
}

export function deleteListVideoItem(_id) {
    return dispatch => {
        const url = '/api/list-video/item';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Delete list video item failed!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Hình ảnh được xóa thành công!', 'error', false, 800);
                dispatch(getListVideoAll(data.listVideoId));
            }
        }, error => T.notify('Delete list video item failed!', 'danger'));
    }
}

export function changeListVideoItem(item) {
    return { type: ListVideoUpdate, item };
}

export const ajaxSelectListVideo = T.createAjaxAdapter(
    '/api/list-video/all',
    response => response && response.items ? response.items.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetListVideo(_id, done) {
    console.log('id', _id);
    const url = '/api/list-video';
    T.get(url, { _id }, done, error => T.notify('Lấy list video bị lỗi!', 'danger'));
}
