import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StudentGetAll = 'StudentGetAll';
const StudentGetPage = 'StudentGetPage';
const StudentUpdate = 'StudentUpdate';

export default function studentReducer(state = null, data) {
    switch (data.type) {
        case StudentGetPage:
            return Object.assign({}, state, { page: data.page });

        case StudentGetAll:
            return Object.assign({}, state, { list: data.list });

        case StudentUpdate:
            let updatedList = Object.assign({}, state.list),
                updatedPage = Object.assign({}, state.page),
                updatedItem = data.item;
            if (updatedList) {
                for (let i = 0, n = updatedList.length; i < n; i++) {
                    if (updatedList[i]._id == updatedItem._id) {
                        updatedList.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            if (updatedPage.list) {
                for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                    if (updatedPage.list[i]._id == updatedItem._id) {
                        updatedPage.list.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return Object.assign({}, state, { list: updatedList, page: updatedPage });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
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

export function createStudent(student, done) {
    return dispatch => {
        const url = '/api/student';
        T.post(url, { student }, data => {
            if (data.error) {
                T.notify('Tạo học viên bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getStudentPage());
                done && done(data);
            }
        }, error => T.notify('Tạo học viên bị lỗi!', 'danger'));
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
                done && done(data.item);
                T.alert('Lấy thông tin học viên thành công!', 'error', false, 800);
            }
        }, error => T.notify('Lấy thông tin học viên bị lỗi', 'danger'));
    }
}