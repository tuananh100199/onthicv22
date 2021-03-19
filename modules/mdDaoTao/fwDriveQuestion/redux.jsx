import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DriveQuestionGet = 'DriveQuestionGet';
const DriveQuestionGetAll = 'DriveQuestionGetAll';
const DriveQuestionUpdate = 'DriveQuestionUpdate';

export default function driveQuestionReducer(state = null, data) {
    switch (data.type) {
        case DriveQuestionGetAll:
            return Object.assign({}, state, { list: data.items });

        case DriveQuestionGet: {
            return Object.assign({}, state, { item: data.item });
        }

        case DriveQuestionUpdate:
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
export function getAllDriveQuestions(searchText, done) {
    return dispatch => {
        const url = '/api/drive-question/all';
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả câu hỏi thi bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DriveQuestionGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function getDriveQuestionItem(_id, done) {
    return dispatch => {
        const url = '/api/drive-question/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy câu hỏi thi bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DriveQuestionGet, item: data.item });
            }
            if (done) done(data);
        }, error => T.notify('Lấy câu hỏi thi bị lỗi', 'danger'));
    }
}

export function createDriveQuestion(newData, done) {
    return dispatch => {
        const url = '/api/drive-question';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi thi bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                T.notify('Tạo câu hỏi thi thành công!', 'success');
                dispatch(getAllDriveQuestions());
            }
        }, error => T.notify('Tạo câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function updateDriveQuestion(_id, changes, done) {
    return dispatch => {
        const url = '/api/drive-question';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi thi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DriveQuestionGet, item: data.item });
                T.notify('Cập nhật câu hỏi thi thành công!', 'success');
                dispatch(getAllDriveQuestions());
                done && done();
            }
        }, error => T.notify('Cập nhật câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function swapDriveQuestion(data, done) {
    return dispatch => {
        const url = `/api/drive-question/swap`;
        T.put(url, { data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi thi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getAllDriveQuestions());
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteDriveQuestion(_id) {
    return dispatch => {
        const url = '/api/drive-question';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi thi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa câu hỏi thi thành công!', 'error', false, 800);
                dispatch(getAllDriveQuestions());
            }
        }, error => T.notify('Xóa câu hỏi thi bị lỗi!', 'danger'));
    }
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getAllDriveQuestionByUser(done) {
    return dispatch => {
        const url = '/home/drive-question/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi thi bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DriveQuestionGetAll, items: data.items });
            }
            if (done) done(data);

        }, error => T.notify('Lấy danh sách câu hỏi thi bị lỗi', 'danger'));
    }
}

export const ajaxSelectDriveQuestion = {
    ajax: true,
    url: '/api/category/drive-question',
    data: {},
    processResults: response => ({
        results: response && response.items ? response.items.map(item => ({ id: item._id, text: item.title })) : []
    })
}