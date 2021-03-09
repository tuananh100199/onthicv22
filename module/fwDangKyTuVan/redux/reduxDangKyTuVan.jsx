import T from '../../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DangKyTuVanGetAll = 'DangKyTuVan:GetAll';
const DangKyTuVanUpdate = 'DangKyTuVan:Update';
const DangKyTuVanAddItem = 'DangKyTuVan:AddItem';
const DangKyTuVanUpdateItem = 'DangKyTuVan:UpdateItem';
const DangKyTuVanRemoveItem = 'DangKyTuVan:RemoveItem';
const DangKyTuVanSwapItems = 'DangKyTuVan:SwapItems';

export default function dangKyTuVanReducer(state = null, data) {
    switch (data.type) {
        case DangKyTuVanGetAll:
            return Object.assign({}, state, { list: data.items });

        case DangKyTuVanAddItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                state.item.statistic.push({
                    title: data.title,
                    number: data.number,
                });
            }
            return state;

        case DangKyTuVanUpdateItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.statistic.length) {
                    state.item.statistic.splice(data.index, 1, {
                        title: data.title,
                        number: data.number,
                    });
                }
            }
            return state;

        case DangKyTuVanRemoveItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.statistic.length) {
                    state.item.statistic.splice(data.index, 1);
                }
            }
            return state;

        case DangKyTuVanSwapItems:
            if (state && state.item) {
                state = Object.assign({}, state);
                const dangKyTuVan = state.item.statistic[data.index];
                if (data.isMoveUp && data.index > 0) {
                    state.item.statistic.splice(data.index, 1);
                    state.item.statistic.splice(data.index - 1, 0, dangKyTuVan);
                } else if (!data.isMoveUp && data.index < state.item.statistic.length - 1) {
                    state.item.statistic.splice(data.index, 1);
                    state.item.statistic.splice(data.index + 1, 0, dangKyTuVan);
                }
            }
            return state;

        case DangKyTuVanUpdate:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Texts -------------------------------------------------------------------------------------------------------------
const texts = T.language({
    vi: {
        getAllDangKyTuVanError: 'Lấy danh sách thống kê bị lỗi!',
        getDangKyTuVanError: 'Lấy thống kê bị lỗi!',
        createDangKyTuVanError: 'Tạo thống kê bị lỗi!',
        updateDangKyTuVanError: 'Cập nhật thông tin thống kê bị lỗi!',
        deleteDangKyTuVanError: 'Xóa thống kê bị lỗi!',
        updateDangKyTuVanSuccess: 'Cập nhật thông tin thống kê thành công!',
        deleteDangKyTuVanSuccess: 'Xóa thống kê thành công!'
    },
    en: {
        getAllDangKyTuVanError: 'Failed to get list of DangKyTuVans!',
        getDangKyTuVanError: 'Failed to get DangKyTuVan!',
        createDangKyTuVanError: 'Failed to create new DangKyTuVan!',
        updateDangKyTuVanError: 'Failed to update information of DangKyTuVans!',
        deleteDangKyTuVanError: 'Failed to delete DangKyTuVan!',
        updateDangKyTuVanSuccess: 'DangKyTuVan is updated!',
        deleteDangKyTuVanSuccess: 'DangKyTuVan is deleted!'
    }
});

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllDangKyTuVan(done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van/all';
        T.get(url, data => {
            if (data.error) {
                T.notify(texts.getAllDangKyTuVanError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DangKyTuVanGetAll, items: data.items });
            }
        }, error => T.notify(texts.getAllDangKyTuVanError, 'danger'));
    }
}

export function createDangKyTuVan(title, description, background, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van';
        T.post(url, { title, description, background }, data => {
            if (data.error) {
                T.notify(texts.createDangKyTuVanError, 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllDangKyTuVan());
                if (done) done(data);
            }
        }, error => T.notify(texts.createDangKyTuVanError, 'danger'));
    }
}

export function updateDangKyTuVan(_id, changes, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify(texts.updateDangKyTuVanError, 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify(texts.updateDangKyTuVanSuccess, 'info');
                dispatch(getAllDangKyTuVan());
                done && done();
            }
        }, error => T.notify(texts.updateDangKyTuVanError, 'danger'));
    }
}

export function deleteDangKyTuVan(_id) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify(texts.deleteDangKyTuVanError, 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert(texts.deleteDangKyTuVanSuccess, 'error', false, 800);
                dispatch(getAllDangKyTuVan());
            }
        }, error => T.notify(texts.deleteDangKyTuVanError, 'danger'));
    }
}



export function getDangKyTuVanItem(_id, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify(texts.getDangKyTuVanError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done({ item: data.item });
                dispatch({ type: DangKyTuVanUpdate, item: data.item });
            }
        }, error => T.notify(texts.getDangKyTuVanError, 'danger'));
    }
}

export function addDangKyTuVanIntoGroup(title, number) {
    return { type: DangKyTuVanAddItem, title, number };
}

export function updateDangKyTuVanInGroup(index, title, number) {
    return { type: DangKyTuVanUpdateItem, index, title, number };
}

export function removeDangKyTuVanFromGroup(index) {
    return { type: DangKyTuVanRemoveItem, index };
}

export function swapDangKyTuVanInGroup(index, isMoveUp) {
    return { type: DangKyTuVanSwapItems, index, isMoveUp };
}


export function getDangKyTuVanByUser(_id, done) {
    return dispatch => {
        const url = '/home/dang-ky-tu-van/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify(T.getDangKyTuVanError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify(T.getDangKyTuVanError, 'danger'));
    }
}