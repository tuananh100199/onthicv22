import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ChangeLecturer = 'ChangeLecturer';
const ChangeLecturerAll = 'ChangeLecturerAll';
const ChangeLecturerGetPage = 'ChangeLecturerGetPage';

export default function addressReducer(state = {}, data) {
    switch (data.type) {
        case ChangeLecturerAll:
            return Object.assign({}, state, { list: data.list });

        case ChangeLecturer: {
            return Object.assign({}, state, { item: data.item });
        }

        case ChangeLecturerGetPage:
            return Object.assign({}, state, { page: data.page });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getChangeLecturerPage(pageNumber, pageSize, pageCondition, done) {
    return dispatch => {
        const url = `/api/change-lecturer/page/${pageNumber}/${pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thay đổi giáo viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: ChangeLecturerGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách thay đổi giáo viên bị lỗi!', 'danger'));
    };
}

export function getChangeLecturerAll(searchText, done) {
    return dispatch => {
        const url = '/api/change-lecturer/all';
        if (typeof searchText == 'function') {
            done = searchText;
            searchText = '';
        }
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả thay đổi giáo viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: ChangeLecturerAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả thay đổi giáo viên bị lỗi!', 'danger'));
    };
}

export function createChangeLecturer(data, done) {
    return () => {
        const url = '/api/change-lecturer';
        T.post(url, { data }, data => {
            console.log('data', data);
            if (data.error) {
                T.notify('Tạo thay đổi giáo viên bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done(data);
                T.notify('Tạo thay đổi giáo thành công!', 'success');
            }
        }, error => console.error(error) || T.notify('Tạo thay đổi giáo viên bị lỗi!', 'danger'));
    };
}

export function updateChangeLecturer(_id, changes, done) {
    return dispatch => {
        const url = '/api/change-lecturer';
        T.put(url, { _id, changes }, data => {
            console.log('data-redux', data);
            if (data.error) {
                T.notify('Cập nhật thay đổi giáo viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: ChangeLecturer, item: data.item });
                T.notify('Cập nhật thay đổi giáo viên thành công!', 'success');
                dispatch(getChangeLecturerPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thay đổi giáo viên bị lỗi!', 'danger'));
    };
}

export function deleteChangeLecturer(_id) {
    return dispatch => {
        const url = '/api/change-lecturer';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thay đổi giáo viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa thay đổi giáo viên thành công!', 'error', false, 800);
                dispatch(getChangeLecturerPage());
            }
        }, error => console.error(error) || T.notify('Xóa thay đổi giáo viên bị lỗi!', 'danger'));
    };
}

// AJAX ---------------------------------------------------------------------------------------------------------------
export const ajaxSelectChangeLecturer = T.createAjaxAdapter(
    '/api/change-lecturer/all',
    response => response && response.list ? response.list.map(item => ({ id: item._id, text: item.title + (item.isOutside ? ' (thay đổi giáo viên ngoài)' : '') })) : []
);