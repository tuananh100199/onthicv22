import T from '../../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StatisticGetAll = 'Statistic:GetAll';
const StatisticUpdate = 'Statistic:Update';
const StatisticAddItem = 'Statistic:AddItem';
const StatisticUpdateItem = 'Statistic:UpdateItem';
const StatisticRemoveItem = 'Statistic:RemoveItem';
const StatisticSwapItems = 'Statistic:SwapItems';

export default function statisticReducer(state = null, data) {
    switch (data.type) {
        case StatisticGetAll:
            return Object.assign({}, state, { list: data.items });

        case StatisticAddItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                state.item.items.push({
                    title: data.title,
                    number: data.number,
                });
            }
            return state;

        case StatisticUpdateItem:
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

        case StatisticRemoveItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1);
                }
            }
            return state;

        case StatisticSwapItems:
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

        case StatisticUpdate:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Texts -------------------------------------------------------------------------------------------------------------
const texts = T.language({
    vi: {
        getAllStatisticError: 'Lấy danh sách thống kê bị lỗi!',
        getStatisticError: 'Lấy thống kê bị lỗi!',
        createStatisticError: 'Tạo thống kê bị lỗi!',
        updateStatisticError: 'Cập nhật thông tin thống kê bị lỗi!',
        deleteStatisticError: 'Xóa thống kê bị lỗi!',
        updateStatisticSuccess: 'Cập nhật thông tin thống kê thành công!',
        deleteStatisticSuccess: 'Xóa thống kê thành công!'
    },
    en: {
        getAllStatisticError: 'Failed to get list of statistics!',
        getStatisticError: 'Failed to get statistic!',
        createStatisticError: 'Failed to create new statistic!',
        updateStatisticError: 'Failed to update information of statistics!',
        deleteStatisticError: 'Failed to delete statistic!',
        updateStatisticSuccess: 'Statistic is updated!',
        deleteStatisticSuccess: 'Statistic is deleted!'
    }
});

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllStatistics(done) {
    return dispatch => {
        const url = '/api/statistic/all';
        T.get(url, data => {
            if (data.error) {
                T.notify(texts.getAllStatisticError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: StatisticGetAll, items: data.items });
            }
        }, error => T.notify(texts.getAllStatisticError, 'danger'));
    }
}

export function createStatistic(title, description, background, done) {
    return dispatch => {
        const url = '/api/statistic';
        T.post(url, { title, description, background }, data => {
            if (data.error) {
                T.notify(texts.createStatisticError, 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllStatistics());
                if (done) done(data);
            }
        }, error => T.notify(texts.createStatisticError, 'danger'));
    }
}

export function updateStatistic(_id, changes, done) {
    return dispatch => {
        const url = '/api/statistic';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify(texts.updateStatisticError, 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify(texts.updateStatisticSuccess, 'info');
                dispatch(getAllStatistics());
                done && done();
            }
        }, error => T.notify(texts.updateStatisticError, 'danger'));
    }
}

export function deleteStatistic(_id) {
    return dispatch => {
        const url = '/api/statistic';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify(texts.deleteStatisticError, 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert(texts.deleteStatisticSuccess, 'error', false, 800);
                dispatch(getAllStatistics());
            }
        }, error => T.notify(texts.deleteStatisticError, 'danger'));
    }
}



export function getStatisticItem(_id, done) {
    return dispatch => {
        const url = '/api/statistic/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify(texts.getStatisticError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done({ item: data.item });
                dispatch({ type: StatisticUpdate, item: data.item });
            }
        }, error => T.notify(texts.getStatisticError, 'danger'));
    }
}

export function addStatisticIntoGroup(title, number) {
    return { type: StatisticAddItem, title, number };
}

export function updateStatisticInGroup(index, title, number) {
    return { type: StatisticUpdateItem, index, title, number };
}

export function removeStatisticFromGroup(index) {
    return { type: StatisticRemoveItem, index };
}

export function swapStatisticInGroup(index, isMoveUp) {
    return { type: StatisticSwapItems, index, isMoveUp };
}


export function getStatisticByUser(_id, done) {
    return dispatch => {
        const url = '/home/statistic/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify(T.getStatisticError, 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify(T.getStatisticError, 'danger'));
    }
}