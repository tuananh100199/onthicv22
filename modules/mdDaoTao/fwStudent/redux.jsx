import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StudentGetPage = 'StudentGetPage';
const StudentUpdate = 'StudentUpdate';
const PreStudentGetPage = 'PreStudentGetPage';

export default function studentReducer(state = null, data) {
    switch (data.type) {
        case StudentGetPage:
            return Object.assign({}, state, { page: data.page });

        case StudentUpdate:
            let updatedPage = Object.assign({}, state.page),
                updatedItem = data.item;
            if (updatedPage.list) {
                for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                    if (updatedPage.list[i]._id == updatedItem._id) {
                        updatedPage.list.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return Object.assign({}, state, { page: updatedPage });

        case PreStudentGetPage:
            return Object.assign({}, state, { prePage: data.page });

        default:
            return state;
    }
}

// Student Actions ----------------------------------------------------------------------------------------------------
T.initCookiePage('adminStudent');
export function getStudentPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminStudent', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/student/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                if (done) done(data.page);
                dispatch({ type: StudentGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách học viên bị lỗi!', 'danger'));
    }
}

export function updateStudent(_id, changes, done) {
    return dispatch => {
        const url = '/api/student';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin học viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin học viên thành công!', 'info');
                dispatch(getStudentPage());
            }
            done && done(data.error);
        }, error => T.notify('Cập nhật thông tin học viên bị lỗi!', 'danger'));
    }
}

export function deleteStudent(_id) {
    return dispatch => {
        const url = '/api/student';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa học viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Học viên được xóa thành công!', 'error', false, 800);
                dispatch(getStudentPage());
            }
        }, error => T.notify('Xóa học viên bị lỗi!', 'danger'));
    }
}

export function getStudent(_id, done) {
    return dispatch => {
        const url = `/api/student`;
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin học viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Lấy thông tin học viên thành công!', 'error', false, 800);
                done && done(data.item);
                dispatch({ type: StudentUpdate, item: data.item });
            }
        }, error => T.notify('Lấy thông tin học viên bị lỗi', 'danger'));
    }
}

// Pre-student Actions ------------------------------------------------------------------------------------------------
T.initCookiePage('adminPreStudent');
export function getPreStudentPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminPreStudent', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/pre-student/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                if (done) done(data.page);
                dispatch({ type: PreStudentGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách học viên bị lỗi!', 'danger'));
    }
}

export function createPreStudent(student, done) {
    return dispatch => {
        const url = '/api/pre-student';
        T.post(url, { student }, data => {
            if (data.error) {
                T.notify('Tạo học viên bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getPreStudentPage());
                done && done(data);
            }
        }, error => T.notify('Tạo học viên bị lỗi!', 'danger'));
    }
}

export function updatePreStudent(_id, changes, done) {
    return dispatch => {
        const url = '/api/pre-student';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin học viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin học viên thành công!', 'info');
                dispatch(getPreStudentPage());
            }
            done && done(data.error);
        }, error => T.notify('Cập nhật thông tin học viên bị lỗi!', 'danger'));
    }
}

export function deletePreStudent(_id) {
    return dispatch => {
        const url = '/api/pre-student';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa học viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Học viên được xóa thành công!', 'error', false, 800);
                dispatch(getPreStudentPage());
            }
        }, error => T.notify('Xóa học viên bị lỗi!', 'danger'));
    }
}

export function importPreStudent(students, division, done) {
    return dispatch => {
        const url = '/api/pre-student/import';
        T.post(url, { students, division }, data => {
            if (data.error) {
                T.notify('Tạo học viên bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo học viên thành công!', 'success');
                dispatch(getPreStudentPage());
                done && done(data);
            }
        }, error => T.notify('Tạo học viên bị lỗi!', 'danger'));
    }
}