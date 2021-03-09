import T from '../../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StatisticDangKyTuVanGetAll = 'StatisticDangKyTuVan:GetAll';
const StatisticDangKyTuVanUpdate = 'StatisticDangKyTuVan:Update';
const StatisticDangKyTuVanAddItem = 'StatisticDangKyTuVan:AddItem';
const StatisticDangKyTuVanUpdateItem = 'StatisticDangKyTuVan:UpdateItem';
const StatisticDangKyTuVanRemoveItem = 'StatisticDangKyTuVan:RemoveItem';
const StatisticDangKyTuVanSwapItems = 'StatisticDangKyTuVan:SwapItems';

export default function StatisticDangKyTuVanReducer(state = null, data) {
    switch (data.type) {
        case StatisticDangKyTuVanGetAll:
            return Object.assign({}, state, { list: data.items });

        case StatisticDangKyTuVanAddItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                state.item.items.push({
                    title: data.title,
                    number: data.number,
                });
            }
            return state;

        case StatisticDangKyTuVanUpdateItem:
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

        case StatisticDangKyTuVanRemoveItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1);
                }
            }
            return state;

        case StatisticDangKyTuVanSwapItems:
            if (state && state.item) {
                state = Object.assign({}, state);
                const StatisticDangKyTuVan = state.item.items[data.index];
                if (data.isMoveUp && data.index > 0) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index - 1, 0, StatisticDangKyTuVan);
                } else if (!data.isMoveUp && data.index < state.item.items.length - 1) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index + 1, 0, StatisticDangKyTuVan);
                }
            }
            return state;

        case StatisticDangKyTuVanUpdate:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Texts -------------------------------------------------------------------------------------------------------------
const texts = T.language({
    vi: {
        getAllStatisticDangKyTuVanError: 'Lấy danh sách thống kê bị lỗi!',
        getStatisticDangKyTuVanError: 'Lấy thống kê bị lỗi!',
        createStatisticDangKyTuVanError: 'Tạo thống kê bị lỗi!',
        updateStatisticDangKyTuVanError: 'Cập nhật thông tin thống kê bị lỗi!',
        deleteStatisticDangKyTuVanError: 'Xóa thống kê bị lỗi!',
        updateStatisticDangKyTuVanSuccess: 'Cập nhật thông tin thống kê thành công!',
        deleteStatisticDangKyTuVanSuccess: 'Xóa thống kê thành công!'
    },
    en: {
        getAllStatisticDangKyTuVanError: 'Failed to get list of StatisticDangKyTuVans!',
        getStatisticDangKyTuVanError: 'Failed to get StatisticDangKyTuVan!',
        createStatisticDangKyTuVanError: 'Failed to create new StatisticDangKyTuVan!',
        updateStatisticDangKyTuVanError: 'Failed to update information of StatisticDangKyTuVans!',
        deleteStatisticDangKyTuVanError: 'Failed to delete StatisticDangKyTuVan!',
        updateStatisticDangKyTuVanSuccess: 'StatisticDangKyTuVan is updated!',
        deleteStatisticDangKyTuVanSuccess: 'StatisticDangKyTuVan is deleted!'
    }
});

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllStatisticDangKyTuVans(done) {
    return dispatch => {
        const url = '/api/statistic-dang-ky-tu-van/all';
        T.get(url, data => {
            if (data.error) {
                T.notify(texts.getAllStatisticDangKyTuVanError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: StatisticDangKyTuVanGetAll, items: data.items });
            }
        }, error => T.notify(texts.getAllStatisticDangKyTuVanError, 'danger'));
    }
}

export function createStatisticDangKyTuVan(title, description, background, done) {
    return dispatch => {
        const url = '/api/statistic-dang-ky-tu-van';
        T.post(url, { title, description, background }, data => {
            if (data.error) {
                T.notify(texts.createStatisticDangKyTuVanError, 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllStatisticDangKyTuVans());
                if (done) done(data);
            }
        }, error => T.notify(texts.createStatisticDangKyTuVanError, 'danger'));
    }
}

export function updateStatisticDangKyTuVan(_id, changes, done) {
    return dispatch => {
        const url = '/api/statistic-dang-ky-tu-van';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify(texts.updateStatisticDangKyTuVanError, 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify(texts.updateStatisticDangKyTuVanSuccess, 'info');
                dispatch(getAllStatisticDangKyTuVans());
                done && done();
            }
        }, error => T.notify(texts.updateStatisticDangKyTuVanError, 'danger'));
    }
}

export function deleteStatisticDangKyTuVan(_id) {
    return dispatch => {
        const url = '/api/statistic-dang-ky-tu-van';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify(texts.deleteStatisticDangKyTuVanError, 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert(texts.deleteStatisticDangKyTuVanSuccess, 'error', false, 800);
                dispatch(getAllStatisticDangKyTuVans());
            }
        }, error => T.notify(texts.deleteStatisticDangKyTuVanError, 'danger'));
    }
}



export function getStatisticDangKyTuVanItem(_id, done) {
    return dispatch => {
        const url = '/api/statistic-dang-ky-tu-van/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify(texts.getStatisticDangKyTuVanError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done({ item: data.item });
                dispatch({ type: StatisticDangKyTuVanUpdate, item: data.item });
            }
        }, error => T.notify(texts.getStatisticDangKyTuVanError, 'danger'));
    }
}

export function addStatisticDangKyTuVanIntoGroup(title, number) {
    return { type: StatisticDangKyTuVanAddItem, title, number };
}

export function updateStatisticDangKyTuVanInGroup(index, title, number) {
    return { type: StatisticDangKyTuVanUpdateItem, index, title, number };
}

export function removeStatisticDangKyTuVanFromGroup(index) {
    return { type: StatisticDangKyTuVanRemoveItem, index };
}

export function swapStatisticDangKyTuVanInGroup(index, isMoveUp) {
    return { type: StatisticDangKyTuVanSwapItems, index, isMoveUp };
}


export function getStatisticDangKyTuVanByUser(_id, done) {
    return dispatch => {
        const url = '/home/statistic-dang-ky-tu-van/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify(T.getStatisticDangKyTuVanError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify(T.getStatisticDangKyTuVanError, 'danger'));
    }
}