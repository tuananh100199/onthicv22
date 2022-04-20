import T from 'view/js/common';

const DeviceGetAll = 'DeviceGetAll';
const DeviceChange = 'DeviceChange';
const DeviceGetItem = 'DeviceGetItem';
const DeviceGetPage = 'DeviceGetPage';

export default function DeviceReducer(state = [], data) {
    switch (data.type) {
        case DeviceGetAll:
            return data.items;

        case DeviceGetPage:
            return Object.assign({}, state, { page: data.page });

        case DeviceGetItem:
            return Object.assign({}, state, { item: data.item });

        case DeviceChange: {
            let updateItemState = state.slice();
            for (let i = 0; i < updateItemState.length; i++) {
                if (updateItemState[i]._id == data.item._id) {
                    updateItemState[i] = data.item;
                    break;
                }
            }
            return updateItemState;
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDevicePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminDevice', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/device/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thiết bị bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: DeviceGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách thiết bị bị lỗi!', 'danger'));
    };
}

export function getAllDevice(condition, done) {
    return dispatch => {
        const url = '/api/device/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy tất cả thiết bị bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: DeviceGetAll, items: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả thiết bị bị lỗi!', 'danger'));
    };
}

export function getDevice(_id, done) {
    return dispatch => {
        const url = '/api/device';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin thiết bị bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: DeviceGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy thông tin thiết bị bị lỗi!', 'danger'));
    };
}

export function createDevice(data, done) {
    return dispatch => {
        const url = '/api/device';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thiết bị bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật thông tin thiết bị thành công!', 'success');
                dispatch(getDevicePage(undefined,undefined,{status: 'dangSuDung'}));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo thiết bị bị lỗi!', 'danger'));
    };
}

export function updateDevice(_id, changes, done) {
    return dispatch => {
        const url = '/api/device';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin thiết bị bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin thiết bị thành công!', 'success');
                dispatch(getDevicePage(undefined,undefined,{status: 'dangSuDung'}));
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin thiết bị bị lỗi!', 'danger'));
    };
}

export function deleteDevice(item) {
    return dispatch => {
        const url = '/api/device';
        T.delete(url, { item }, data => {
            if (data.error) {
                T.notify('Xóa thông tin thiết bi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xóa thông tin thiết bị thành công!', 'success', false, 800);
                dispatch(getDevicePage(undefined,undefined,{status: 'dangSuDung'}));
            }
        }, error => console.error(error) || T.notify('Xóa thông tin thiết bị bị lỗi!', 'danger'));
    };
}

export function importDevice(devices, division, type, done) {
    return dispatch => {
        const url = '/api/device/import';
        T.post(url, { devices, division, type }, data => {
            if (data.error) {
                T.notify('Tạo thiết bị bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thiết bị thành công!', 'success');
                dispatch(getDevicePage(undefined,undefined,{status: 'dangSuDung'}));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo thiết bị bị lỗi!', 'danger'));
    };
}

// Export to Excel ----------------------------------------------------------------------------------------------------
export function exportInfoDevice(filterKey, type) {
    if (filterKey == undefined) filterKey = 'dangSuDung';
    if (type == undefined) type = '0';
    T.download(T.url(`/api/device/info/export/${filterKey}/${type}`));
}
