import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StaffInfoGetAll = 'StaffInfoGetAll';
const StaffInfoGetPage = 'StaffInfoGetPage';
const StaffInfoGetItem = 'StaffInfoGetItem';
export default function staffInfoReducer(state = {}, data) {
    switch (data.type) {
        case StaffInfoGetAll:
            return Object.assign({}, state, { list: data.list });
        case StaffInfoGetPage:
            return Object.assign({}, state, { page: data.page });
        case StaffInfoGetItem: 
            return Object.assign({}, state, { item: data.item });
        
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getStaffInfoAll(condition, done) {
    return dispatch => {
        const url = '/api/department/all';
        if (typeof condition == 'function') {
            done = condition;
            condition = {};
        }
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy tất cả nhân viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: StaffInfoGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả nhân viên bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageStaffInfo', true);
export function getStaffInfoPage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage('pageStaffInfo', pageNumber, pageSize,condition);
    return dispatch => {
        const url = '/api/staff-info/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhân viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page);
                dispatch({ type: StaffInfoGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách nhân viên bị lỗi!', 'danger'));
    };
}

export function getStaffInfo(_id, done) {
    return dispatch => ajaxGetStaffInfo(_id, data => {
        if (data.error) {
            T.notify('Lấy thông tin nhân viên bị lỗi!', 'danger');
            console.error('GET: getStaffInfo', data.error);
        } else {
            dispatch({ type: StaffInfoGetItem, item: data.item });
        }
        done && done(data);
    });
}

export function createStaffInfo(data, done) {
    return dispatch => {
        const url = '/api/staff-info';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo nhân viên bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo nhân viên thanh công!', 'success');
                done && done(data);
                dispatch(getStaffInfoPage());
            }
        }, error => console.error(error) || T.notify('Tạo nhân viên bị lỗi!', 'danger'));
    };
}

export function updateStaffInfo(_id, changes, done) {
    return dispatch => {
        const url = '/api/staff-info';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nhân viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin nhân viên thành công!', 'success');
                dispatch(getStaffInfoPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin nhân viên bị lỗi!', 'danger'));
    };
}

export function deleteStaffInfo(_id) {
    return dispatch => {
        const url = '/api/staff-info';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nhân viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa thông tin nhân viên thành công!', 'error', false, 800);
                dispatch(getStaffInfoPage());
            }
        }, error => console.error(error) || T.notify('Xóa thông tin nhân viên bị lỗi!', 'danger'));
    };
}

// AJAX ---------------------------------------------------------------------------------------------------------------

export function ajaxGetStaffInfo(_id, done) {
    const url = '/api/staff-info';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy thông tin nhân viên bị lỗi!', 'danger'));
}