import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DriveQuestionGet = 'DriveQuestionGet';
const DriveQuestionGetAll = 'DriveQuestionGetAll';
const DriveQuestionGetPage = 'DriveQuestionGetPage';

export default function driveQuestionReducer(state = null, data) {
    switch (data.type) {
        case DriveQuestionGetAll:
            return Object.assign({}, state, { list: data.items });

        case DriveQuestionGetPage:
            return Object.assign({}, state, { page: data.page });

        case DriveQuestionGet: {
            return Object.assign({}, state, { item: data.item });
        }

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

export function getDriveQuestionPage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageDriveQuestion', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/drive-question/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi thi bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DriveQuestionGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách câu hỏi thi bị lỗi!', 'danger'));
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

export function createDriveQuestion(data, done) {
    return dispatch => {
        const url = '/api/drive-question';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi thi bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                T.notify('Tạo câu hỏi thi thành công!', 'success');
                dispatch(getDriveQuestionPage());
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
                dispatch(getDriveQuestionPage());
                done && done();
            }
        }, error => T.notify('Cập nhật câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function swapDriveQuestion(_id, isMoveUp, done) {
    return dispatch => {
        const url = `/api/drive-question/swap`;
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi thi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự câu hỏi thi thành công!', 'success');
                dispatch(getDriveQuestionPage());
                done && done();
            }
        }, error => T.notify('Thay đổi thứ tự câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function deleteDriveQuestion(_id, done) {
    return dispatch => {
        const url = '/api/drive-question';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi thi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa câu hỏi thi thành công!', 'error', false, 800);
                dispatch(getDriveQuestionPage());
                done && done();
            }
        }, error => T.notify('Xóa câu hỏi thi bị lỗi!', 'danger'));
    }
}

export function deleteDriveQuestionImage(_id, done) {
    return dispatch => {
        const url = '/api/drive-question/image';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa hình minh họa bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa hình minh họa thành công!', 'error', false, 800);
                dispatch(getDriveQuestionPage());
                done && done();
            }
        }, error => T.notify('Xóa hình minh họa bị lỗi!', 'danger'));
    }
}