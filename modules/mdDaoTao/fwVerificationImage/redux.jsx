import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const VerificationImageGetAll = 'VerificationImageGetAll';
const VerificationImageGetPage = 'VerificationImageGetPage';
const VerificationImageGetItem = 'VerificationImageGetItem';

export default function verificationImageReducer(state = {}, data) {
    switch (data.type) {
        case VerificationImageGetAll:
            return Object.assign({}, state, { list: data.list });
        case VerificationImageGetPage:
            return Object.assign({}, state, { page: data.page });

        case VerificationImageGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageVerificationImage');
export function getVerificationImagePage(pageNumber, pageSize, pageCondition , filter, sort, done) {
    if(typeof sort=='function'){
        done=sort;
        sort=undefined;
    }
    else if(typeof filter=='function'){
        done=filter;
        filter=undefined;
    }
    const page = T.updatePage('pageVerificationImage', pageNumber, pageSize,pageCondition,filter,sort);
    return (dispatch) => {
        const url = `/api/verification-image/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url,{ pageCondition,filter:page.filter,sort:page.sort  }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình ảnh học viên  bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
                dispatch({ type: VerificationImageGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách hình ảnh học viên  bị lỗi!', 'danger'));
    };
}

export function getVerificationImageAll(condition,done) {
    return dispatch => {
        const url = '/api/verification-image/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy hình ảnh học viên  bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: VerificationImageGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy hình ảnh học viên  bị lỗi', 'danger'));
    };
}

export function getVerificationImage(_id, done) {
    return dispatch => ajaxGetVerificationImage(_id, data => {
        if (data.error) {
            T.notify('Lấy hình ảnh học viên  bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: VerificationImageGetItem, item: data.item });
        }
    });
}

export function createVerificationImage(data, done) {
    return dispatch => {
        const url = '/api/verification-image';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo hình ảnh học viên  bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getVerificationImagePage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo hình ảnh học viên  bị lỗi!', 'danger'));
    };
}

export function updateVerificationImage(_id, changes, done) {
    return dispatch => {
        const url = '/api/verification-image';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin hình ảnh học viên  bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: VerificationImageGetItem, item: data.item });
                dispatch(getVerificationImagePage());
                T.notify('Cập nhật hình ảnh học viên  thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật hình ảnh học viên  bị lỗi!', 'danger'));
    };
}

export function addStudentVerificationImage(_id, student, courseId, subjectId, done) {
    return dispatch => {
        const url = '/api/verification-image/student';
        T.put(url, { _id, student }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin hình ảnh học viên  bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: VerificationImageGetItem, item: data.item });
                dispatch(getVerificationImagePage(1,20, {courseType: courseId, subject: subjectId}));
                T.notify('Cập nhật hình ảnh học viên  thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật hình ảnh học viên  bị lỗi!', 'danger'));
    };
}

export function deleteStudentVerificationImage(_id, _studentId, done) {
    return dispatch => {
        const url = '/api/verification-image/student';
        T.delete(url, { _id, _studentId }, data => {
            if (data.error) {
                T.notify('Xóa học viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch({ type: VerificationImageGetItem, item: data.item});
                done && done();
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}



export function updateVerificationImageDefault(diploma, done) {
    return dispatch => {
        const url = '/api/verification-image/default';
        T.put(url, { diploma }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin hình ảnh học viên  bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: VerificationImageGetItem, item: data.item });
                dispatch(getVerificationImagePage());
                T.notify('Cập nhật hình ảnh học viên  thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật hình ảnh học viên  bị lỗi!', 'danger'));
    };
}

export function deleteVerificationImage(_id) {
    return dispatch => {
        const url = '/api/verification-image';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa hình ảnh học viên  bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá hình ảnh học viên  thành công!', 'success');
                dispatch(getVerificationImagePage());
            }
        }, error => console.error(error) || T.notify('Xóa hình ảnh học viên  bị lỗi!', 'danger'));
    };
}


export const ajaxSelectVerificationImage = {
    ajax: true,
    url: '/api/verification-image/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    }),
    fetchOne: (_id, done) => getVerificationImage(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
};

export function ajaxGetVerificationImage(_id, done) {
    const url = '/api/verification-image';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy hình ảnh học viên  bị lỗi!', 'danger'));
}