import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TimeTableGetPage = 'TimeTableGetPage';
const TimeTableGetAll = 'TimeTableGetAll';
const TimeTableUpdate = 'TimeTableUpdate';

export default function timeTableReducer(state = {}, data) {
    switch (data.type) {
        case TimeTableGetPage:
            return Object.assign({}, state, { page: data.page });

        case TimeTableGetAll:
            return Object.assign({}, state, { list: data.list });

        case TimeTableUpdate: {
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
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('adminTimeTable');
export function getTimeTablePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminTimeTable', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/time-table/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy thời khóa biểu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: TimeTableGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy thời khóa biểu bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageTimeTable');
export function getTimeTablePageByAdmin(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTimeTable', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/time-table/page/admin/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy thời khóa biểu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: TimeTableGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy thời khóa biểu bị lỗi!', 'danger'));
    };
}

export function getAllTimeTableByAdmin(condition, done) {
    return dispatch => {
        const url = '/api/time-table/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy tất cả thời khóa biểu bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: TimeTableGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function getTimeTable(_id, done) {
    return dispatch => {
        const url = '/api/time-table';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thời khóa biểu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
                dispatch({ type: TimeTableUpdate, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy thời khóa biểu bị lỗi', 'danger'));
    };
}

export function getTimeTableDateNumber(_id, student, date, startHour, numOfHours, done) {
    return () => {
        const url = '/api/time-table/date-number';
        T.get(url, { _id, student, date, startHour, numOfHours }, data => {
            if (data.error) {
                T.notify('Lấy thời khóa biểu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.dateNumber);
            }
        }, error => console.error(error) || T.notify('Lấy thời khóa biểu bị lỗi', 'danger'));
    };
}
export function getTimeTableOfLecturer(condition, done) {
    return () => {
        const url = '/api/time-table/lecturer';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thời khóa biểu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy thời khóa biểu bị lỗi', 'danger'));
    };
}

export function createTimeTable(data, done) {
    return dispatch => {
        const url = '/api/time-table';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thời khóa biểu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thời khóa biểu thành công!', 'success');
                done && done(data.item);
                dispatch(getTimeTablePage());
            }
        }, error => console.error(error) || T.notify('Tạo thời khóa biểu bị lỗi!', 'danger'));
    };
}

export function createTimeTableByAdmin(data, condition, done) {
    return dispatch => {
        const url = '/api/time-table/admin';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thời khóa biểu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thời khóa biểu thành công!', 'success');
                done && done(data.item);
                dispatch(getTimeTablePageByAdmin(undefined, undefined, condition));
            }
        }, error => console.error(error) || T.notify('Tạo thời khóa biểu bị lỗi!', 'danger'));
    };
}
export function updateTimeTable(_id, changes, done) {
    return dispatch => {
        const url = '/api/time-table';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thời khóa biểu bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thời khóa biểu thành công!', 'success');
                done && done(data.item);
                dispatch(getTimeTablePage());
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật thời khóa biểu bị lỗi!', 'danger'));
    };
}

export function updateTimeTableByAdmin(_id, changes, condition, done) {
    return dispatch => {
        const url = '/api/time-table/admin';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thời khóa biểu bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thời khóa biểu thành công!', 'success');
                done && done(data.item);
                dispatch(getTimeTablePageByAdmin(undefined, undefined, condition));
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật thời khóa biểu bị lỗi!', 'danger'));
    };
}

export function deleteTimeTable(_id) {
    return dispatch => {
        const url = '/api/time-table';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thời khóa biểu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Thời khóa biểu được xóa thành công!', 'error', false, 800);
                dispatch(getTimeTablePage());
            }
        }, error => console.error(error) || T.notify('Xóa thời khóa biểu bị lỗi!', 'danger'));
    };
}

export function deleteTimeTableByAdmin(_id, condition) {
    return dispatch => {
        const url = '/api/time-table/admin';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thời khóa biểu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Thời khóa biểu được xóa thành công!', 'error', false, 800);
                dispatch(getTimeTablePageByAdmin(undefined, undefined, condition));
            }
        }, error => console.error(error) || T.notify('Xóa thời khóa biểu bị lỗi!', 'danger'));
    };
}
// Student API --------------------------------------------------------------------------------------
export function getTimeTableByStudent(done) {
    return dispatch => {
        const url = '/api/time-table/student';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thời khóa biểu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: TimeTableGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy thời khóa biểu bị lỗi', 'danger'));
    };
}