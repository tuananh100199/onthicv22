import T from 'view/js/common';

const CategoryGetAll = 'CategoryGetAll';
const CategoryChange = 'CategoryChange';

export default function categoryReducer(state = [], data) {
    switch (data.type) {
        case CategoryGetAll:
            return data.items;

        case CategoryChange: {
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
export function getCategoryAll(type, searchText, done) {
    return dispatch => {
        const url = `/api/category/${type}`;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh mục bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CategoryGetAll, items: data.items });
                done && done(data.items);
            }
        }, error => console.error(error) || T.notify('Lấy danh mục bị lỗi!', 'danger'));
    };
}

export function createCategory(data, done) {
    return dispatch => {
        const url = '/api/category';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo danh mục bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCategoryAll(data.item.type));
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('Tạo danh mục bị lỗi!', 'danger'));
    };
}

export function updateCategory(_id, changes, done) {
    return dispatch => {
        const url = '/api/category';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh mục bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật danh mục thành công!', 'success');
                dispatch(getCategoryAll(data.item.type));
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật danh mục bị lỗi!', 'danger'));
    };
}

export function swapCategory(_id, isMoveUp, type) {
    return dispatch => {
        const url = '/api/category/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự danh mục bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getCategoryAll(type));
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự danh mục bị lỗi!', 'danger'));
    };
}

export function deleteCategory(_id, type) {
    return dispatch => {
        const url = '/api/category';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xóa danh mục thành công!', 'error', false, 800);
                dispatch(getCategoryAll(type));
            }
        }, error => console.error(error) || T.notify('Xóa danh mục bị lỗi!', 'danger'));
    };
}

export function changeCategory(category) {
    return { type: CategoryChange, item: category };
}