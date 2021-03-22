import T from 'view/js/common';

const CategoryGetAll = 'Category:GetAll';
const CategoryCreate = 'Category:Create';
const CategoryUpdate = 'Category:Update';
const CategoryDelete = 'Category:Delete';

export default function categoryReducer(state = [], data) {
    switch (data.type) {
        case CategoryGetAll:
            return data.items;

        case CategoryCreate:
            return [data.item].concat(state);

        case CategoryUpdate:
            let updateItemState = state.slice();
            for (let i = 0; i < updateItemState.length; i++) {
                if (updateItemState[i]._id == data.item._id) {
                    updateItemState[i] = data.item;
                    break;
                }
            }
            return updateItemState;

        case CategoryDelete:
            let deleteItemState = state.slice();
            for (let i = 0; i < deleteItemState.length; i++) {
                if (deleteItemState[i]._id == data._id) {
                    deleteItemState.splice(i, 1);
                    break;
                }
            }
            return deleteItemState;

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
                T.notify('Get categories failed!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CategoryGetAll, items: data.items });
                done && done(data.items);
            }
        }, error => T.notify('Get categories failed!', 'danger'));
    }
}

export function createCategory(data, done) {
    return dispatch => {
        const url = '/api/category';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Create category failed!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch({ type: CategoryCreate, item: data.item });
                if (done) done(data);
            }
        }, error => T.notify('Create category failed!', 'danger'));
    }
}

export function updateCategory(_id, changes, done) {
    return dispatch => {
        const url = '/api/category';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Update category failed!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Update category successful!', 'success');
                dispatch({ type: CategoryUpdate, item: data.item });
                done && done();
            }
        }, error => T.notify('Update category failed!', 'danger'));
    }
}

export function swapCategory(_id, isMoveUp, type) {
    return dispatch => {
        const url = '/api/category/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Swap position failed!', 'danger')
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getCategoryAll(type));
            }
        }, error => T.notify('Swap position failed!', 'danger'));
    }
}

export function deleteCategory(_id) {
    return dispatch => {
        const url = '/api/category';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Delete category failed!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Delete category successful!', 'error', false, 800);
                dispatch({ type: CategoryDelete, _id });
            }
        }, error => T.notify('Delete category failed!', 'danger'));
    }
}

export function changeCategory(category) {
    return { type: CategoryUpdate, item: category };
}