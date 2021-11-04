import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const RegisterCalendarGetPage = 'RegisterCalendarGetPage';
const RegisterCalendarUpdate = 'RegisterCalendarUpdate';

export default function registerCalendarReducer(state = {}, data) {
    switch (data.type) {
        case RegisterCalendarGetPage:
            return Object.assign({}, state, { page: data.page });
        case RegisterCalendarUpdate: {
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
T.initCookiePage('adminRegisterCalendar');
export function getRegisterCalendarPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminRegisterCalendar', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/register-calendar/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy lịch dạy bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: RegisterCalendarGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy lịch dạy bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageRegisterCalendar');
export function getRegisterCalendarPageByAdmin(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageRegisterCalendar', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/register-calendar/page/admin/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy lịch dạy bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: RegisterCalendarGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy lịch dạy bị lỗi!', 'danger'));
    };
}

export function getRegisterCalendar(_id, done) {
    return dispatch => {
        const url = '/api/register-calendar';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy lịch dạy bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
                dispatch({ type: RegisterCalendarUpdate, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy lịch dạy bị lỗi', 'danger'));
    };
}

export function getRegisterCalendarDateNumber(_id, student, date, startHour, numOfHours, done) {
    return () => {
        const url = '/api/register-calendar/date-number';
        T.get(url, { _id, student, date, startHour, numOfHours }, data => {
            if (data.error) {
                T.notify('Lấy lịch dạy bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.dateNumber);
            }
        }, error => console.error(error) || T.notify('Lấy lịch dạy bị lỗi', 'danger'));
    };
}
export function getRegisterCalendarOfLecturer(condition, done) {
    return () => {
        const url = '/api/register-calendar/lecturer';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy lịch dạy bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy lịch dạy bị lỗi', 'danger'));
    };
}

export function createRegisterCalendar(data, done) {
    return dispatch => {
        const url = '/api/register-calendar';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo lịch dạy bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo lịch dạy thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarPage());
            }
        }, error => console.error(error) || T.notify('Tạo lịch dạy bị lỗi!', 'danger'));
    };
}

export function createRegisterCalendarByAdmin(data, condition, done) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo lịch dạy bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo lịch dạy thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarPageByAdmin(undefined, undefined, condition));
            }
        }, error => console.error(error) || T.notify('Tạo lịch dạy bị lỗi!', 'danger'));
    };
}
export function updateRegisterCalendar(_id, changes, done) {
    return dispatch => {
        const url = '/api/register-calendar';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật lịch dạy bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật lịch dạy thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarPage());
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật lịch dạy bị lỗi!', 'danger'));
    };
}

export function updateRegisterCalendarByAdmin(_id, changes, condition, done) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật lịch dạy bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật lịch dạy thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarPageByAdmin(undefined, undefined, condition));
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật lịch dạy bị lỗi!', 'danger'));
    };
}

export function deleteRegisterCalendar(_id) {
    return dispatch => {
        const url = '/api/register-calendar';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa lịch dạy bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('lịch dạy được xóa thành công!', 'error', false, 800);
                dispatch(getRegisterCalendarPage());
            }
        }, error => console.error(error) || T.notify('Xóa lịch dạy bị lỗi!', 'danger'));
    };
}

export function deleteRegisterCalendarByAdmin(_id, condition) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa lịch dạy bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('lịch dạy được xóa thành công!', 'error', false, 800);
                dispatch(getRegisterCalendarPageByAdmin(undefined, undefined, condition));
            }
        }, error => console.error(error) || T.notify('Xóa lịch dạy bị lỗi!', 'danger'));
    };
}

//Student API--------------------------------------------------------------------------------------------------
export function getRegisterCalendarByStudent(done) {
    return dispatch => {
        const url = '/api/register-calendar/student';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy lịch dạy bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: RegisterCalendarGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy lịch dạy bị lỗi', 'danger'));
    };
}