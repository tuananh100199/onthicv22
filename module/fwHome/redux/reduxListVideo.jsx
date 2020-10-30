import T from '../../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ListVideoGetAll = 'ListVideo:GetAll';
const ListVideoUpdate = 'ListVideo:Update';
const ListVideoAddItem = 'ListVideo:AddItem';
const ListVideoUpdateItem = 'ListVideo:UpdateItem';
const ListVideoRemoveItem = 'ListVideo:RemoveItem';
const ListVideoSwapItems = 'ListVideo:SwapItems';

export default function listVideoReducer(state = null, data) {
    switch (data.type) {
        case ListVideoGetAll:
            return Object.assign({}, state, { list: data.items });

        case ListVideoAddItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                state.item.items.push({
                    title: data.title,
                    link: data.link,
                    image : data.image,
                });
            }
            return state;

        case ListVideoUpdateItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1, {
                        title: data.title,
                        link: data.link,
                        image : data.image,
                    });
                }
            }
            return state;

        case ListVideoRemoveItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1);
                }
            }
            return state;

        case ListVideoSwapItems:
            if (state && state.item) {
                state = Object.assign({}, state);
                const statistic = state.item.items[data.index];
                if (data.isMoveUp && data.index > 0) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index - 1, 0, statistic);
                } else if (!data.isMoveUp && data.index < state.item.items.length - 1) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index + 1, 0, statistic);
                }
            }
            return state;

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

// Texts -------------------------------------------------------------------------------------------------------------
const texts = T.language({
    vi: {
        getAllListVideoError: 'Lấy tất cả danh sách video bị lỗi!',
        getListVideoError: 'Lấy danh sách video bị lỗi!',
        createListVideoError: 'Tạo danh sách video bị lỗi!',
        updateListVideoError: 'Cập nhật danh sách video bị lỗi!',
        deleteListVideoError: 'Xóa danh sách video bị lỗi!',
        updateListVideoSuccess: 'Cập nhật danh sách video thành công!',
        deleteListVideoSuccess: 'Xóa danh sách video thành công!'
    },
    en: {
        getAllListVideoError: 'Failed to get list of ListVideo!',
        getListVideoError: 'Failed to get ListVideo!',
        createListVideoError: 'Failed to create new ListVideo!',
        updateListVideoError: 'Failed to update information of ListVideo!',
        deleteListVideoError: 'Failed to delete ListVideo!',
        updateListVideoSuccess: 'ListVideo is updated!',
        deleteListVideoSuccess: 'ListVideo is deleted!'
    }
});

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllListVideo(done) {
    return dispatch => {
        const url = '/api/list-video/all';
        T.get(url, data => {
            if (data.error) {
                T.notify(texts.getAllListVideoError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: ListVideoGetAll, items: data.items });
            }
        }, error => T.notify(texts.getAllListVideoError, 'danger'));
    }
}

export function createListVideo(title , done) {
    return dispatch => {
        const url = '/api/list-video';
        T.post(url, { title }, data => {
            if (data.error) {
                T.notify(texts.createListVideoError, 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllListVideo());
                if (done) done(data);
            }
        }, error => T.notify(texts.createListVideoError, 'danger'));
    }
}

export function updateListVideo(_id, changes, done) {
    return dispatch => {
        const url = '/api/list-video';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify(texts.updateListVideoError, 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify(texts.updateListVideoSuccess, 'info');
                dispatch(getAllListVideo());
                done && done();
            }
        }, error => T.notify(texts.updateListVideoError, 'danger'));
    }
}

export function deleteListVideo(_id) {
    return dispatch => {
        const url = '/api/list-video';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify(texts.deleteListVideoError, 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert(texts.deleteListVideoSuccess, 'error', false, 800);
                dispatch(getAllListVideo());
            }
        }, error => T.notify(texts.deleteListVideoError, 'danger'));
    }
}



export function getListVideoItem(_id, done) {
    return dispatch => {
        const url = '/api/list-video/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify(texts.getListVideoError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            }
            if (done) done(data);
        }, error => T.notify(texts.getListVideoError, 'danger'));
    }
}
// video... 
export function addVideoIntoList(title, link, image) {
    return { type: ListVideoAddItem, title, link, image };
}

export function updateVideoInList(index, title, link,image) {
    return { type:  ListVideoUpdateItem, index, title, link,image };
}

export function removeVideoFromList(index) {
    return { type: ListVideoRemoveItem, index };
}

export function swapVideoInList(index, isMoveUp) {
    return { type:  ListVideoSwapItems, index, isMoveUp };
}


export function getListVideoByUser(_id, done) {
    return dispatch => {
        const url = '/home/list-video/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify(T.getListVideoError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify(T.getListVideoError, 'danger'));
    }
}

export function createListVideoItem(data, done) {
    return dispatch => {
        const url = '/api/list-video/item';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Create carousel item failed!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getCarousel(data.item.listVideoId));
                if (done) done(data);
            }
        }, error => T.notify('Create carousel item failed!', 'danger'));
    }
}

export function updateListVideoItem(_id, changes, done) {
    return dispatch => {
        const url = '/api/list-video/item';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Update carousel item failed!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Update carousel item successful!', 'info');
                dispatch(getCarousel(data.item.listVideoId));
                if (done) done();
            }
        }, error => T.notify('Update carousel item failed!', 'danger'));
    }
}

export function swapListVideoItem(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/list-video/item/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Swap carousel item failed!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                dispatch(getCarousel(data.item1.listVideoId));
            }
        }, error => T.notify('Swap carousel item failed!', 'danger'));
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
                dispatch(getCarousel(data.listVideoId));
            }
        }, error => T.notify('Delete carousel item failed!', 'danger'));
    }
}

export function changeListVideoItem(item) {
    return { type: ListVideoUpdate, item };
} 