import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DriveTestGet = 'DriveTestGet';
const DriveTestGetAll = 'DriveTestGetAll';
const DriveTestGetPage = 'DriveTestGetPage';

export default function driveTestReducer(state = {}, data) {
    switch (data.type) {
        case DriveTestGetAll:
            return Object.assign({}, state, { list: data.items });

        case DriveTestGetPage:
            return Object.assign({}, state, { page: data.page });

        case DriveTestGet:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllDriveTests(searchText, done) {
    return dispatch => {
        const url = '/api/drive-test/all';
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả bộ đề thi bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DriveTestGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả bộ đề thi bị lỗi!', 'danger'));
    }
}

export function getDriveTestPage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageDriveTest', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/drive-test/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bộ đề thi bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DriveTestGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách bộ đề thi bị lỗi!', 'danger'));
    }
}

export function getDriveTestItem(_id, done) {
    return dispatch => {
        const url = '/api/drive-test';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy bộ đề thi bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DriveTestGet, item: data.item });
            }
            if (done) done(data.item);
        }, error => T.notify('Lấy bộ đề thi bị lỗi', 'danger'));
    }
}

export function createDriveTest(data, done) {
    return dispatch => {
        const url = '/api/drive-test';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo bộ đề thi bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                T.notify('Tạo bộ đề thi thành công!', 'success');
                dispatch(getDriveTestPage());
            }
        }, error => T.notify('Tạo bộ đề thi bị lỗi!', 'danger'));
    }
}

export function updateDriveTest(_id, changes, done) {
    return dispatch => {
        const url = '/api/drive-test';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật bộ đề thi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DriveTestGet, item: data.item });
                T.notify('Cập nhật bộ đề thi thành công!', 'success');
                dispatch(getDriveTestPage());
                done && done();
            }
        }, error => T.notify('Cập nhật bộ đề thi bị lỗi!', 'danger'));
    }
}

export function swapDriveTest(_id, isMoveUp, done) {
    return dispatch => {
        const url = `/api/drive-test/swap`;
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bộ đề thi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự bộ đề thi thành công!', 'success');
                dispatch(getDriveTestPage());
                done && done();
            }
        }, error => T.notify('Thay đổi thứ tự bộ đề thi bị lỗi!', 'danger'));
    }
}

export function deleteDriveTest(_id, done) {
    return dispatch => {
        const url = '/api/drive-test';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa bộ đề thi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa bộ đề thi thành công!', 'error', false, 800);
                dispatch(getDriveTestPage());
                done && done();
            }
        }, error => T.notify('Xóa bộ đề thi bị lỗi!', 'danger'));
    }
}

//Questions-------------------------------

export function createDriveTestQuestion(_driveTestId, _questionId, done) {
    return dispatch => {
        const url = `/api/drive-test/question`;
        T.post(url, { _driveTestId, _questionId }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi thi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Thêm câu hỏi thi vào bộ đề thi thành công!', 'success');
                dispatch({ type: DriveTestGet, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export function swapDriveTestQuestion(_driveTestId, _questionId, isMoveUp, done) {
    return dispatch => {
        const url = `/api/drive-test/question/swap`;
        T.put(url, { _driveTestId, _questionId, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự câu hỏi thi thành công!', 'success');
                dispatch({ type: DriveTestGet, item: data.item });
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteDriveTestQuestion(_driveTestId, _questionId, done) {
    return dispatch => {
        const url = `/api/drive-test/question`;
        T.delete(url, { _driveTestId, _questionId }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi thi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Câu hỏi được xóa thành công!', 'error', false, 800);
                dispatch({ type: DriveTestGet, item: data.item });
                done && done();
            }
        }, error => console.error('DELETE: ' + url + '.', error));
    }
}