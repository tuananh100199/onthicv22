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
export function getAllDriveTests(condition, done) {
    return dispatch => {
        const url = '/api/drive-test/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy tất cả bộ đề thi bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: DriveTestGetAll, items: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả bộ đề thi bị lỗi!', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Lấy danh sách bộ đề thi bị lỗi!', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Lấy bộ đề thi bị lỗi', 'danger'));
    };
}
export function getDriveTestItemByStudent(_id, done) {
    return dispatch => {
        const url = '/api/drive-test/student';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy bộ đề thi bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DriveTestGet, item: data.item });
            }
            if (done) done(data);
        }, error => console.error(error) || T.notify('Lấy bộ đề thi bị lỗi', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Tạo bộ đề thi bị lỗi!', 'danger'));
    };
}

export function createRandomDriveTest(_courseTypeId, done) {
    return dispatch => {
        const url = '/api/drive-test/random';
        T.post(url, { _courseTypeId }, data => {
            if (data.error) {
                T.notify('Tạo bộ đề thi ngẫu nhiên bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                dispatch(getDriveTestPage());
            }
        }, error => console.error(error) || T.notify('Tạo bộ đề thi ngẫu nhiên bị lỗi!', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Cập nhật bộ đề thi bị lỗi!', 'danger'));
    };
}

export function swapDriveTest(_id, isMoveUp, done) {
    return dispatch => {
        const url = '/api/drive-test/swap';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bộ đề thi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự bộ đề thi thành công!', 'success');
                dispatch(getDriveTestPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự bộ đề thi bị lỗi!', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Xóa bộ đề thi bị lỗi!', 'danger'));
    };
}

export function checkDriveTestScore(_id, answers, done) {
    return () => {
        const url = '/api/drive-test/student/submit';
        T.post(url, { _id, answers }, data => {
            if (data.error) {
                T.notify('Kiểm tra đáp án bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.result);
            }
        }, error => console.error(error) || T.notify('Kiểm tra đáp án bị lỗi!', 'danger'));
    };
}
export function checkRandomDriveTestScore(answers, done) {
    return () => {
        const url = '/api/drive-test/random/submit';
        T.post(url, { answers }, data => {
            if (data.error) {
                T.notify('Kiểm tra đáp án bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.result);
            }
        }, error => console.error(error) || T.notify('Kiểm tra đáp án bị lỗi!', 'danger'));
    };
}

// Questions ----------------------------------------------------------------------------------------------------------
export function createDriveTestQuestion(driveTestId, questionId, done) {
    return dispatch => {
        const url = '/api/drive-test/question';
        T.post(url, { driveTestId, questionId }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi thi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Thêm câu hỏi thi vào bộ đề thi thành công!', 'success');
                dispatch({ type: DriveTestGet, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function swapDriveTestQuestion(driveTestId, questionId, isMoveUp, done) {
    return dispatch => {
        const url = '/api/drive-test/question/swap';
        T.put(url, { driveTestId, questionId, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự câu hỏi thi thành công!', 'success');
                dispatch({ type: DriveTestGet, item: data.item });
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    };
}

export function deleteDriveTestQuestion(driveTestId, questionId, done) {
    return dispatch => {
        const url = '/api/drive-test/question';
        T.delete(url, { driveTestId, questionId }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi thi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Câu hỏi được xóa thành công!', 'error', false, 800);
                dispatch({ type: DriveTestGet, item: data.item });
                done && done();
            }
        }, error => console.error('DELETE: ' + url + '.', error));
    };
}