import T from '../../view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const GET_PAGE = 'form:getApplicationForm';
const UPDATE = 'form:getApplicationForm';
const GET = 'applicationForm:getApplicationForm';

export default function applicationFormReducer(state = null, data) {
    switch (data.type) {
        case GET_PAGE:
            return Object.assign({}, state, { page: data.page });

        case UPDATE: {
            let page = state && state.page ? state.page : { list: [] }, list = page.list;
            for (let i = 0; i < list.length; i++) {
                if (list[i]._id == data.item._id) {
                    list.splice(i, 1, data.item);
                    break;
                }
            }

            page.list = list;
            return Object.assign({}, state, { page });
        }
        case GET:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Actions (admin) ----------------------------------------------------------------------------------------------------
export function ajaxGetFormInPage(pageNumber, pageSize, pageCondition, done) {
    const url = '/api/user-form/page/' + pageNumber + '/' + pageSize;
    T.get(url, { pageCondition }, data => {
        done(data)
    }, error => T.notify('Lấy danh sách form bị lỗi!', 'danger'))
}

export function ajaxGetForm(_id, option, done) {
    const url = '/api/user-form/item/' + _id;
    T.get(url, { option }, data => {
        done(data)
    }, error => T.notify('Lấy form bị lỗi!', 'danger'))
}

T.initCookiePage('pageForm');
export function getFormInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageForm', pageNumber, pageSize);
    return dispatch => {
        ajaxGetFormInPage(page.pageNumber, page.pageSize, {}, data => {
            if (data.error) {
                T.notify('Lấy danh sách form bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: GET_PAGE, page: data.page });
            }
        })
    };
}

export function getForm(_id, option, done) {
    return dispatch => {
        ajaxGetForm(_id, option, data => {
            if (data.error) {
                T.notify('Lấy form bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET, item: data.item });
                done && done(data);
            }
        })
    }
}

export function createForm(done) {
    return dispatch => {
        const url = '/api/user-form';
        const data = {
            title: 'Form mới '
        };
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo form bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Tạo form bị lỗi!', 'danger'));
    }
}

export function updateForm(_id, changes, done) {
    return dispatch => {
        const url = '/api/application-form';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin form bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: UPDATE, item: data.item });
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin form bị lỗi!', 'danger'));
    }
}

export function deleteForm(_id) {
    return dispatch => {
        const url = '/api/user-form';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa form bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Form được xóa thành công!', 'error', false, 800);
                dispatch(getFormInPage());
            }
        }, error => T.notify('Xóa form bị lỗi!', 'danger'));
    }
}

// Actions (user) -----------------------------------------------------------------------------------------------------
export function getDonDeNghiHocByUser(done) {
    return dispatch => {
        const url = '/api/user-application-form';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đơn đề nghị học, sát hạch bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET, item: data.item });
            }
            done && done(data);
        }, error => T.notify('Lấy đơn đề nghị học, sát hạch bị lỗi!', 'danger'));
    }
}

export function userUpdateDonDeNghiHoc(_id, changes, userChanges, done) {
    return dispatch => {
        const url = '/api/user-application-form';
        T.put(url, { _id, changes, userChanges }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin đơn đề nghị học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: UPDATE, item: data.item });
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin đơn đề nghị học bị lỗi!', 'danger'));
    }
}

//exportToWord
export function exportToWord(data, done) {
    return dispatch => {
        const url = `/api/user-application-form/export`;
        T.get(url, { data }, data => {
            if (data.error) {
                T.notify('Xuất file word bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                T.notify('Xuất file word thành công!', 'success');
            }
        }, error => T.notify('Xuất file word bị lỗi!', 'danger'));
    }
}
