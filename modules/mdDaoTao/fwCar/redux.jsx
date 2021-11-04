import T from 'view/js/common';

const CarGetAll = 'CarGetAll';
const CarChange = 'CarChange';
const CarGetItem = 'CarGetItem';
const CarGetPage = 'CarGetPage';

export default function CarReducer(state = [], data) {
    switch (data.type) {
        case CarGetAll:
            return data.items;

        case CarGetPage:
            return Object.assign({}, state, { page: data.page });

        case CarGetItem:
            return Object.assign({}, state, { item: data.item });

        case CarChange: {
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
export function getCarPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminCar', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/car/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách xe bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: CarGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách xe bị lỗi!', 'danger'));
    };
}

export function getCar(_id, done) {
    return dispatch => {
        const url = '/api/car';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông báo bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy thông báo bị lỗi!', 'danger'));
    };
}

export function createCar(data, done) {
    return dispatch => {
        const url = '/api/car';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thông báo bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật template thông báo thành công!', 'success');
                dispatch(getCarPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo thông báo bị lỗi!', 'danger'));
    };
}

export function updateCar(_id, changes, done) {
    console.log(_id, changes);
    return dispatch => {
        const url = '/api/car';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật template thông báo bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật template thông báo thành công!', 'success');
                dispatch(getCarPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật template thông báo bị lỗi!', 'danger'));
    };
}

export function deleteCar(_id) {
    return dispatch => {
        const url = '/api/car';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa template thông báo bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xóa template thông báo thành công!', 'error', false, 800);
                dispatch(getCarPage());
            }
        }, error => console.error(error) || T.notify('Xóa template thông báo bị lỗi!', 'danger'));
    };
}

