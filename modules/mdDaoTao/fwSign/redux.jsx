import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SignGet = 'SignGet';
const SignGetAll = 'SignGetAll';
const SignGetPage = 'SignGetPage';

export default function signReducer(state = null, data) {
    switch (data.type) {
        case SignGetAll:
            return Object.assign({}, state, { list: data.items });

        case SignGetPage:
            return Object.assign({}, state, { page: data.page });

        case SignGet:
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
            return Object.assign({}, state, { item: data.item, list: updatedList, page: updatedPage });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllSigns(searchText, done) {
    return dispatch => {
        const url = '/api/sign/all';
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả biển báo bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: SignGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả biển báo bị lỗi!', 'danger'));
    }
}

export function getSignPage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageSign', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/sign/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách biển báo bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SignGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách biển báo bị lỗi!', 'danger'));
    }
}

export function getSign(_id, done) {
    return dispatch => {
        const url = '/api/sign';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy biển báo bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: SignGet, item: data.item });
            }
            if (done) done(data);
        }, error => T.notify('Lấy biển báo bị lỗi', 'danger'));
    }
}

export function createSign(data, done) {
    return dispatch => {
        const url = '/api/sign';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo biển báo bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                T.notify('Tạo biển báo thành công!', 'success');
                dispatch(getSignPage());
            }
        }, error => T.notify('Tạo biển báo bị lỗi!', 'danger'));
    }
}

export function updateSign(_id, changes, done) {
    return dispatch => {
        const url = '/api/sign';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật biển báo bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: SignGet, item: data.item });
                T.notify('Cập nhật biển báo thành công!', 'success');
                dispatch(getSignPage());
                done && done();
            }
        }, error => T.notify('Cập nhật biển báo bị lỗi!', 'danger'));
    }
}

export function swapSign(_id, isMoveUp, done) {
    return dispatch => {
        const url = `/api/sign/swap`;
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự biển báo bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự biển báo thành công!', 'success');
                dispatch(getSignPage());
                done && done();
            }
        }, error => T.notify('Thay đổi thứ tự biển báo bị lỗi!', 'danger'));
    }
}

export function deleteSign(_id, done) {
    return dispatch => {
        const url = '/api/sign';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa biển báo bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa biển báo thành công!', 'error', false, 800);
                dispatch(getSignPage());
                done && done();
            }
        }, error => T.notify('Xóa biển báo bị lỗi!', 'danger'));
    }
}

export function deleteSignImage(_id, done) {
    return dispatch => {
        const url = '/api/sign/image';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa hình minh họa bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa hình minh họa thành công!', 'error', false, 800);
                dispatch(getSignPage());
                done && done();
            }
        }, error => T.notify('Xóa hình minh họa bị lỗi!', 'danger'));
    }
}

export function changeSign(sign) {
    return { type: SignGet, item: sign };
}