import T from '../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const AddressGet = 'Address:Get';
const AddressGetAll = 'Address:GetAll';
const AddressUpdate = 'Address:Update';

export default function addressReducer(state = null, data) {
    switch (data.type) {
        case AddressGetAll:
            return Object.assign({}, state, { list: data.items });

        case AddressGet: {
            return Object.assign({}, state, { item: data.item });
        }

        case AddressUpdate:
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
export function getAllAddress(done) {
    return dispatch => {
        const url = '/api/address/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả cơ sở bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: AddressGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả cơ sở bị lỗi!', 'danger'));
    }
}

export function getAddressItem(_id, done) {
    return dispatch => {
        const url = '/api/address/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cơ sở bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: AddressGet, item: data.item });
            }
            if (done) done(data);

        }, error => T.notify('Lấy cơ sở bị lỗi', 'danger'));
    }
}

export function createAddress(newData, done) {
    return dispatch => {
        const url = '/api/address';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo cơ sở bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                dispatch(getAllAddress());
            }
        }, error => T.notify('Tạo cơ sở bị lỗi!', 'danger'));
    }
}

export function updateAddress(_id, changes, done) {
    return dispatch => {
        const url = '/api/address';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật cơ sở bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: AddressGet, item: data.item });
                dispatch(getAllAddress());
                done && done();
            }
        }, error => T.notify('Cập nhật cơ sở bị lỗi!', 'danger'));
    }
}

export function deleteAddress(_id) {
    return dispatch => {
        const url = '/api/address';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa cơ sở bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa cơ sở thành công!', 'error', false, 800);
                dispatch(getAllAddress());
            }
        }, error => T.notify('Xóa cơ sở bị lỗi!', 'danger'));
    }
}
//Home
export function getAllAddressByUser(done) {
    return dispatch => {
        const url = '/address/all/';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cơ sở bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: AddressGetAll, items: data.items });
            }
            if (done) done(data);

        }, error => T.notify('Lấy danh sách cơ sở bị lỗi', 'danger'));
    }
}
export const ajaxSelectAddress = {
    ajax: true,
    url: '/api/address/all',
    data: {},
    processResults: response => ({
        results: response && response.items ? response.items.map(item => ({ id: item._id, text: item.title })) : []
    })
}
