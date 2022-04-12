import T from 'view/js/common';

const FacilityGetAll = 'FacilityGetAll';
const FacilityChange = 'FacilityChange';
const FacilityGetItem = 'FacilityGetItem';
const FacilityGetPage = 'FacilityGetPage';

export default function FacilityReducer(state = [], data) {
    switch (data.type) {
        case FacilityGetAll:
            return data.items;

        case FacilityGetPage:
            return Object.assign({}, state, { page: data.page });

        case FacilityGetItem:
            return Object.assign({}, state, { item: data.item });

        case FacilityChange: {
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
export function getFacilityPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminFacility', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/facility/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thiết bị bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: FacilityGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách thiết bị bị lỗi!', 'danger'));
    };
}

export function getAllFacility(condition, done) {
    return dispatch => {
        const url = '/api/facility/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy tất cả thiết bị bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: FacilityGetAll, items: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả thiết bị bị lỗi!', 'danger'));
    };
}

export function getFacility(_id, done) {
    return dispatch => {
        const url = '/api/facility';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin thiết bị bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: FacilityGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy thông tin thiết bị bị lỗi!', 'danger'));
    };
}

export function createFacility(data, done) {
    return dispatch => {
        const url = '/api/facility';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thiết bị bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật thông tin thiết bị thành công!', 'success');
                dispatch(getFacilityPage(undefined,undefined,{status: 'dangSuDung'}));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo thiết bị bị lỗi!', 'danger'));
    };
}

export function updateFacility(_id, changes, done) {
    return dispatch => {
        const url = '/api/facility';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin thiết bị bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin thiết bị thành công!', 'success');
                dispatch(getFacilityPage(undefined,undefined,{status: 'dangSuDung'}));
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin thiết bị bị lỗi!', 'danger'));
    };
}

export function deleteFacility(item) {
    return dispatch => {
        const url = '/api/facility';
        T.delete(url, { item }, data => {
            if (data.error) {
                T.notify('Xóa thông tin thiết bi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xóa thông tin thiết bị thành công!', 'success', false, 800);
                dispatch(getFacilityPage(undefined,undefined,{status: 'dangSuDung'}));
            }
        }, error => console.error(error) || T.notify('Xóa thông tin thiết bị bị lỗi!', 'danger'));
    };
}

// Ajax ---------------------------------------------------------------------------------------------------------------

// Export to Excel ----------------------------------------------------------------------------------------------------
export function exportInfoFacility(filterKey, type) {
    if (filterKey == undefined) filterKey = 'dangSuDung';
    if (type == undefined) type = '0';
    T.download(T.url(`/api/facility/info/export/${filterKey}/${type}`));
}
