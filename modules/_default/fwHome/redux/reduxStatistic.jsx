import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StatisticGetAll = 'Statistic:GetAll';
const StatisticGet = 'Statistic:Get';
const StatisticUpdate = 'Statistic:Update';

export default function statisticReducer(state = null, data) {
    switch (data.type) {
        case StatisticGetAll:
            return Object.assign({}, state, { list: data.list });

        case StatisticGet:
            return Object.assign({}, state, { selectedItem: data.item });

        case StatisticUpdate:
            state = Object.assign({}, state);
            const updatedItem = data.item;
            if (state && state.selectedItem && state.selectedItem._id == updatedItem.statisticId) {
                for (let i = 0, list = state.selectedItem.list, n = list.length; i < n; i++) {
                    if (list[i]._id == updatedItem._id) {
                        state.selectedItem.list.splice(i, 1, updatedItem);
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
export function getStatisticAll(done) {
    return dispatch => {
        const url = '/api/statistic/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách thống kê bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: StatisticGetAll, list: data.list || [] });
            }
        }, error => T.notify('Lấy danh sách thống kê bị lỗi!', 'danger'));
    }
}

export function getStatistic(_id, done) {
    return dispatch => ajaxGetStatistic(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy thống kê bị lỗi!', 'danger');
            console.error(`GET: ajaxGetStatistic.`, data.error);
        } else {
            dispatch({ type: StatisticGet, item: data.item });
            done && done(data);
        }
    });
}

export function createStatistic(data, done) {
    return dispatch => {
        const url = '/api/statistic';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thống kê bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getStatisticAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo thống kê bị lỗi!', 'danger'));
    }
}

export function updateStatistic(_id, changes, done) {
    return dispatch => {
        const url = '/api/statistic';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin thống kê bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật thông tin thống kê thành công!', 'info');
                dispatch(getStatisticAll());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin thống kê bị lỗi!', 'danger'));
    }
}

export function deleteStatistic(_id) {
    return dispatch => {
        const url = '/api/statistic';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thống kê bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa thống kê thành công!', 'error', false, 800);
                dispatch(getStatisticAll());
            }
        }, error => T.notify('Xóa thống kê bị lỗi!', 'danger'));
    }
}

// Item -------------------------------------------------------------------------------------------
export function createStatisticItem(data, done) {
    return dispatch => {
        const url = '/api/statistic/item';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thống kê bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getStatistic(data.item.statisticId));
                if (done) done(data);
            }
        }, error => T.notify('Tạo thống kê bị lỗi!', 'danger'));
    }
}

export function updateStatisticItem(_id, changes, done) {
    return dispatch => {
        const url = '/api/statistic/item';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thống kê bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật thống kê thành công!', 'info');
                dispatch(getStatistic(data.item.statisticId));
                if (done) done();
            }
        }, error => T.notify('Cập nhật thống kê bị lỗi!', 'danger'));
    }
}

export function swapStatisticItem(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/statistic/item/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự thống kê bị lỗi!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                dispatch(getStatistic(data.item1.statisticId));
            }
        }, error => T.notify('Thay đổi thứ tự thống kê bị lỗi!', 'danger'));
    }
}

export function deleteStatisticItem(_id) {
    return dispatch => {
        const url = '/api/statistic/item';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thống kê bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa thống kê thành công!', 'error', false, 800);
                dispatch(getStatistic(data.statisticId));
            }
        }, error => T.notify('Xóa thống kê bị lỗi!', 'danger'));
    }
}

export function changeStatisticItem(item) {
    return { type: StatisticUpdate, item };
}

// Home -------------------------------------------------------------------------------------------
export function homeGetStatistic(_id, done) {
    return dispatch => {
        const url = '/home/statistic';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thống kê bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
}

export const ajaxSelectStatistic = T.createAjaxAdapter(
    '/api/statistic/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : []
);
export function ajaxGetStatistic(_id, done) {
    const url = '/api/statistic';
    T.get(url, { _id }, done, error => T.notify('Lấy thống kê bị lỗi!', 'danger'));
};