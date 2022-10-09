import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const RegisterCalendarGetPage = 'RegisterCalendarGetPage';
const UserRegisterCalendarGet = 'UserRegisterCalendarGet';
const RegisterCalendarGetAll = 'RegisterCalendarGetAll';
const RegisterCalendarUpdate = 'RegisterCalendarUpdate';

export default function registerCalendarReducer(state = {}, data) {
    switch (data.type) {
        case RegisterCalendarGetPage:
            return Object.assign({}, state, { page: data.page });

        case UserRegisterCalendarGet:
                return Object.assign({}, state, { listTimeTable: data.listTimeTable, listRegisterCalendar: data.listRegisterCalendar, car: data.car });

        case RegisterCalendarGetAll:
            return Object.assign({}, state, { list: data.list });

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
T.initCookiePage('pageRegisterCalendar');

export function getRegisterCalendarPage(pageNumber, pageSize, pageCondition,filter,sort, done) {
    const page = T.updatePage('pageRegisterCalendar', pageNumber, pageSize,pageCondition,filter,sort);
    return dispatch => {
        const url = `/api/register-calendar/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition:page.pageCondition,filter:page.filter,sort:page.sort }, data => {
            if (data.error) {
                T.notify('Lấy lịch nghỉ bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: RegisterCalendarGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function createRegisterCalendar(data, done) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo lịch nghỉ bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo lịch nghỉ thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarPage());
            }
        }, error => console.error(error) || T.notify('Tạo lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function updateRegisterCalendar(_id, changes, done) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật lịch nghỉ bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật lịch nghỉ thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarPage());
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function deleteRegisterCalendar(_id,done) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa lịch nghỉ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Lịch nghỉ được xóa thành công!', 'error', false, 800);
                done && done();
                dispatch(getRegisterCalendarPage());
            }
        }, error => console.error(error) || T.notify('Xóa lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function getRegisterCalendarPageByAdmin(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageRegisterCalendar', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/register-calendar/page/admin/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy lịch nghỉ bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: RegisterCalendarGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function getAllRegisterCalendars(condition, done) {
    return dispatch => {
        const url = '/api/register-calendar/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy tất cả lịch nghỉ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: RegisterCalendarGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function getRegisterCalendarOfLecturer(condition, done) {
    return () => {
        const url = '/api/register-calendar/lecturer';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy lịch nghỉ bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy lịch nghỉ bị lỗi', 'danger'));
    };
}

export function createRegisterCalendarByAdmin(data, condition, done) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo lịch nghỉ bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo lịch nghỉ thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarPageByAdmin(undefined, undefined, condition));
            }
        }, error => console.error(error) || T.notify('Tạo lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function updateRegisterCalendarByAdmin(_id, changes, condition, done) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật lịch nghỉ bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật lịch nghỉ thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarPageByAdmin(undefined, undefined, condition));
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật lịch nghỉ bị lỗi!', 'danger'));
    };
}

export function deleteRegisterCalendarByAdmin(_id, condition) {
    return dispatch => {
        const url = '/api/register-calendar/admin';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa lịch nghỉ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Lịch nghỉ được xóa thành công!', 'error', false, 800);
                dispatch(getRegisterCalendarPageByAdmin(undefined, undefined, condition));
            }
        }, error => console.error(error) || T.notify('Xóa lịch nghỉ bị lỗi!', 'danger'));
    };
}

//Student API--------------------------------------------------------------------------------------------------
export function getRegisterCalendarOfLecturerByStudent(condition, done) {
    return dispatch => {
        const url = '/api/register-calendar/student';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy lịch nghỉ bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: UserRegisterCalendarGet, listTimeTable: data.listTimeTable, listRegisterCalendar: data.listRegisterCalendar, car: data.car });
            }
        }, error => console.error(error) || T.notify('Lấy lịch nghỉ bị lỗi', 'danger'));
    };
}

export function createTimeTableByStudent(data, done) {
    return dispatch => {
        const url = '/api/time-table/student';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Đăng ký lịch học bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else if(data.notify) {
                T.notify( data.notify, 'danger');
                done && done(data.item);
                dispatch(getRegisterCalendarOfLecturerByStudent());
            } else {
                T.notify('Đăng ký lịch học thành công!', 'success');
                done && done(data.item);
                dispatch(getRegisterCalendarOfLecturerByStudent());
            }
        }, error => console.error(error) || T.notify('Đăng ký lịch học bị lỗi!', 'danger'));
    };
}

export function updateTimeTableByAccountant(_id, cart, done) {
    return () => {
        const url = '/api/time-table/accountant';
        T.post(url, { _id, cart }, data => {
            if (data.error) {
                T.notify('Cập nhật trạng thái lịch học bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật trạng thái lịch học thành công!', 'success');
                done && done(data.item);
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật trạng thái lịch học bị lỗi!', 'danger'));
    };
}

export function updateTimeTableByStudent(_id, changes, done) {
    return () => {
        const url = '/api/time-table/student';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật trạng thái lịch học bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật trạng thái lịch học thành công!', 'success');
                done && done(data.item);
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật trạng thái lịch học bị lỗi!', 'danger'));
    };
}

export function deleteTimeTableByStudent(_id, condition) {
    return dispatch => {
        const url = '/api/time-table/student';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa lịch học đăng ký bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Lịch học đăng ký được xóa thành công!', 'error', false, 800);
                dispatch(getRegisterCalendarOfLecturerByStudent(condition));
            }
        }, error => console.error(error) || T.notify('Xóa lịch học đăng ký bị lỗi!', 'danger'));
    };
}