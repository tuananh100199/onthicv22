import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DriveQuestionCategoryGet = 'DriveQuestionCategoryGet';
const DriveQuestionCategoryGetAll = 'DriveQuestionCategoryGetAll';
const DriveQuestionCategoryUpdate = 'DriveQuestionCategoryUpdate';

export default function driveQuestionCategoryReducer(state = null, data) {
    switch (data.type) {
        case DriveQuestionCategoryGetAll:
            return Object.assign({}, state, { list: data.items });

        case DriveQuestionCategoryGet: {
            return Object.assign({}, state, { item: data.item });
        }

        case DriveQuestionCategoryUpdate:
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
export function getAllDriveQuestionCategory(searchText, done) {
    return dispatch => {
        const url = '/api/drive-question-category/all';
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả loại câu hỏi thi bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DriveQuestionCategoryGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả loại câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function getDriveQuestionCategoryItem(_id, done) {
    return dispatch => {
        const url = '/api/drive-question-category/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại câu hỏi thi bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DriveQuestionCategoryGet, item: data.item });
            }
            if (done) done(data);
        }, error => T.notify('Lấy loại câu hỏi thi bị lỗi', 'danger'));
    }
}

export function createDriveQuestionCategory(newData, done) {
    return dispatch => {
        const url = '/api/drive-question-category';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo loại câu hỏi thi bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                dispatch(getAllDriveQuestionCategory());
            }
        }, error => T.notify('Tạo loại câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function updateDriveQuestionCategory(_id, changes, done) {
    return dispatch => {
        const url = '/api/drive-question-category';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật loại câu hỏi thi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DriveQuestionCategoryGet, item: data.item });
                dispatch(getAllDriveQuestionCategory());
                done && done();
            }
        }, error => T.notify('Cập nhật loại câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function deleteDriveQuestionCategory(_id) {
    return dispatch => {
        const url = '/api/drive-question-category';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa loại câu hỏi thi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa loại câu hỏi thi thành công!', 'error', false, 800);
                dispatch(getAllDriveQuestionCategory());
            }
        }, error => T.notify('Xóa loại câu hỏi thi bị lỗi!', 'danger'));
    }
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getAllDriveQuestionCategoryByUser(done) {
    return dispatch => {
        const url = '/home/drive-question-category/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại câu hỏi thi bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DriveQuestionCategoryGetAll, items: data.items });
            }
            if (done) done(data);

        }, error => T.notify('Lấy danh sách loại câu hỏi thi bị lỗi', 'danger'));
    }
}

export const ajaxSelectDriveQuestionCategory = {
    ajax: true,
    url: '/api/drive-question-category/all',
    data: {},
    processResults: response => ({
        results: response && response.items ? response.items.map(item => ({ id: item._id, text: item.title })) : []
    })
}
