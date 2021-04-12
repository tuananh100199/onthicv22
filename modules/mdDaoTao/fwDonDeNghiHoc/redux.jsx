import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const GET_PAGE = 'form:getApplicationForm';
const UPDATE = 'form:getApplicationForm';
const GET = 'applicationForm:getApplicationForm';
const GET_ALL_FINISH = 'applicationForm:getAllFinishApplicationForm';
const GET_ALL_REJECT = 'applicationForm:getAllRejectApplicationForm';

export default function applicationFormReducer(state = {}, data) {
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

        case GET_ALL_FINISH:
            return Object.assign({}, state, { finish: data.finish });

        case GET_ALL_REJECT:
            return Object.assign({}, state, { unfinished: data.unfinished });

        default:
            return state;
    }
}

// Actions (admin) ----------------------------------------------------------------------------------------------------
export function ajaxGetFormInPage(pageNumber, pageSize, pageCondition, licenseClass, done) {
    const url = '/api/application-form/page/' + pageNumber + '/' + pageSize;
    T.get(url, { condition: pageCondition, licenseClass: licenseClass }, data => {
        done(data)
    }, error => T.notify('Lấy danh sách form bị lỗi!', 'danger'))
}

export function ajaxGetForm(_id, option, done) {
    const url = '/api/application-form/item/' + _id;
    T.get(url, { option }, data => {
        done(data)
    }, error => T.notify('Lấy form bị lỗi!', 'danger'))
}

T.initCookiePage('pageForm');
export function getFormInPage(pageNumber, pageSize, pageCondition, licenseClass, done) {
    const page = T.updatePage('pageForm', pageNumber, pageSize, pageCondition);
    if (page.pageCondition && typeof page.pageCondition == 'object') page.pageCondition = JSON.stringify(page.pageCondition);
    return dispatch => {
        ajaxGetFormInPage(page.pageNumber, page.pageSize, page.pageCondition ? JSON.parse(page.pageCondition) : {}, licenseClass, data => {
            if (data.error) {
                T.notify('Lấy danh sách form bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
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

export function getApplicationFormEmail(done) {
    T.get('/api/application-form/email/all', done, () => T.notify('Gửi email bị lỗi', 'danger'));
}

export function saveApplicationFormEmail(type, email) {
    const url = '/api/application-form/email';
    T.put(url, { type, email }, data => {
        if (data.error) {
            console.error('PUT: ' + url + '.', data.error);
            T.notify('Lưu thông tin email bị lỗi!', 'danger');
        } else {
            T.notify('Lưu thông tin email thành công!', 'info');
        }
    }, error => T.notify('Lưu thông tin email bị lỗi!', 'danger'));
}

export function denyApplicationForm(_id, reason, done) {
    return dispatch => {
        const url = '/api/application-form/reject';
        T.post(url, { _id, reason }, data => {
            if (data.error) {
                T.notify('Thao tác từ chối bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            }
            done && done(data);
        }, error => T.notify('Gửi mail từ chối bị lỗi!', 'danger'));
    }
}

// Actions (user) -----------------------------------------------------------------------------------------------------
export function getDonDeNghiHocByUser(_id, done) {
    return dispatch => {
        const url = '/api/user-application-form/' + _id;
        T.get(url, { _id }, data => {
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

export function createDonDeNghiHocByUser(done) {
    return dispatch => {
        const url = '/api/user-application-form/new';
        T.post(url, data => {
            if (data.error) {
                T.notify('Lấy đơn đề nghị học, sát hạch bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET, item: data.item });
            }
            if (done) done(data);
        }, error => T.notify('Lấy đơn đề nghị học, sát hạch bị lỗi!', 'danger'));
    }
}

export function getAllDonDeNghiHocHoanThanhByUser(done) {
    return dispatch => {
        const url = '/api/user-application-form/all/finished';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đơn đề nghị học, sát hạch bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET_ALL_FINISH, finish: data.finish });
            }
            done && done(data.list);
        }, error => T.notify('Lấy đơn đề nghị học, sát hạch bị lỗi!', 'danger'));
    }
}

export function getAllDonDeNghiHocChuaHoanThanhByUser(done) {
    return dispatch => {
        const url = '/api/user-application-form/all/unfinished';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đơn đề nghị học, sát hạch bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET_ALL_REJECT, unfinished: data.unfinished });
            }
            done && done(data.list);
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
export function exportDonDeNghiHocToWord(_id, done) {
    return dispatch => {
        const url = `/api/user-application-form/export/` + _id;
        T.get(url, { _id }, data => {
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
export function exportBienNhanLanDauToWord(_id, done) {
    return dispatch => {
        const url = `/api/user-application-form-receipt/export/` + _id;
        T.get(url, { _id }, data => {
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

export function exportBanCamKetToWord(_id, done) {
    return dispatch => {
        const url = `/api/user-application-form-commitment/export/` + _id;
        T.get(url, { _id }, data => {
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

