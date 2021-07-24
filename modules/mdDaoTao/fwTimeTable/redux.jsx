import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TimeTableGetPage = 'TimeTableGetPage';
const TimeTableUpdate = 'TimeTableUpdate';

export default function timeTableReducer(state = {}, data) {
    switch (data.type) {
        case TimeTableGetPage:
            return Object.assign({}, state, { page: data.page });

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

export function createTimeTable(data, done) {
    return dispatch => {
        const url = '/api/time-table';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thời khóa biểu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
                dispatch(getTimeTablePage());
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

export function deleteTimeTable(_id) {
    return dispatch => {
        const url = '/api/time-table';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa học viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Học viên được xóa thành công!', 'error', false, 800);
                dispatch(getTimeTablePage());
            }
        }, error => console.error(error) || T.notify('Xóa học viên bị lỗi!', 'danger'));
    };
}