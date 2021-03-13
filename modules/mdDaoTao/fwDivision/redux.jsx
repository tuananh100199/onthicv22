import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DivisionGet = 'DivisionGet';
const DivisionGetAll = 'DivisionGetAll';
const DivisionUpdate = 'DivisionUpdate';

export default function addressReducer(state = null, data) {
    switch (data.type) {
        case DivisionGetAll:
            return Object.assign({}, state, { list: data.items });

        case DivisionGet: {
            return Object.assign({}, state, { item: data.item });
        }

        case DivisionUpdate:
            state = Object.assign({}, state);
            const updatedItem = data.item;
            if (state && state.selectedItem && state.selectedItem._id == updatedItem.addressId) {
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
export function getAllDivisions(done) {
    return dispatch => {
        const url = '/api/division/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả cơ sở bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DivisionGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả cơ sở bị lỗi!', 'danger'));
    }
}

export function getDivisionItem(_id, done) {
    return dispatch => {
        const url = '/api/division/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cơ sở bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DivisionGet, item: data.item });
            }
            if (done) done(data);
        }, error => T.notify('Lấy cơ sở bị lỗi', 'danger'));
    }
}

export function createDivision(newData, done) {
    return dispatch => {
        const url = '/api/division';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo cơ sở bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                dispatch(getAllDivisions());
            }
        }, error => T.notify('Tạo cơ sở bị lỗi!', 'danger'));
    }
}

export function updateDivision(_id, changes, done) {
    return dispatch => {
        const url = '/api/division';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật cơ sở bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DivisionGet, item: data.item });
                dispatch(getAllDivisions());
                done && done();
            }
        }, error => T.notify('Cập nhật cơ sở bị lỗi!', 'danger'));
    }
}

export function deleteDivision(_id) {
    return dispatch => {
        const url = '/api/division';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa cơ sở bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa cơ sở thành công!', 'error', false, 800);
                dispatch(getAllDivisions());
            }
        }, error => T.notify('Xóa cơ sở bị lỗi!', 'danger'));
    }
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getAllDivisionByUser(done) {
    return dispatch => {
        const url = '/home/division/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cơ sở bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DivisionGetAll, items: data.items });
            }
            if (done) done(data);

        }, error => T.notify('Lấy danh sách cơ sở bị lỗi', 'danger'));
    }
}

export const ajaxSelectDivision = {
    ajax: true,
    url: '/api/division/all',
    data: {},
    processResults: response => ({
        results: response && response.items ? response.items.map(item => ({ id: item._id, text: item.title })) : []
    })
}
