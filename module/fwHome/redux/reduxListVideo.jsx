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
                    number: data.number,
                });
            }
            return state;

        case ListVideoUpdateItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1, {
                        title: data.title,
                        number: data.number,
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
            return Object.assign({}, state, { item: data.item });

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

export function createListVideo(title, description, background, done) {
    return dispatch => {
        const url = '/api/list-video';
        T.post(url, { title, description, background }, data => {
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
            } else {
                if (done) done({ item: data.item });
                dispatch({ type: ListVideoUpdate, item: data.item });
            }
        }, error => T.notify(texts.getListVideoError, 'danger'));
    }
}

export function addListVideoIntoGroup(title, number) {
    return { type: ListVideoAddItem, title, number };
}

export function updateListVideoInGroup(index, title, number) {
    return { type:  ListVideoUpdateItem, index, title, number };
}

export function removeListVideoFromGroup(index) {
    return { type: ListVideoRemoveItem, index };
}

export function swapListVideoInGroup(index, isMoveUp) {
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