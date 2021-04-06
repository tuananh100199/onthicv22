import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DriveTestGet = 'DriveTestGet';
const DriveTestGetAll = 'DriveTestGetAll';
const DriveTestGetPage = 'DriveTestGetPage';

export default function driveTestReducer(state = null, data) {
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
            if (done) done(data);
        }, error => T.notify('Lấy bộ đề thi bị lỗi', 'danger'));
    }
}

export function changeDriveTest(driveTest) {
    return { type: DriveTestGet, item: driveTest };
}

// Questions APIs -----------------------------------------------------------------------------------------------------

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

export function deleteDriveTestImage(_id, done) {
    return dispatch => {
        const url = '/api/drive-test/image';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa hình minh họa bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa hình minh họa thành công!', 'error', false, 800);
                dispatch(getDriveTestPage());
                done && done();
            }
        }, error => T.notify('Xóa hình minh họa bị lỗi!', 'danger'));
    }
}

