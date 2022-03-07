import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TeacherGetAll = 'TeacherGetAll';
const TeacherGetPage = 'TeacherGetPage';
const TeacherGetItem = 'TeacherGetItem';
const TeacherCertificationGetAll = 'TeacherCertificationGetAll';
const TeacherProfileGetAll = 'TeacherProfileGetAll';

export default function teacherReducer(state = {}, data) {
    switch (data.type) {
        case TeacherGetAll:
            return Object.assign({}, state, { list: data.list });
        case TeacherGetPage:
            return Object.assign({}, state, { page: data.page });
        case TeacherGetItem: 
            return Object.assign({}, state, { item: data.item });
        case TeacherCertificationGetAll:
            return Object.assign({}, state, { listCertification: data.list });
        case TeacherProfileGetAll:
            return Object.assign({}, state, { listProfile: data.list });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getTeacherAll(condition, done) {
    return dispatch => {
        const url = '/api/teacher/all';
        if (typeof condition == 'function') {
            done = condition;
            condition = {};
        }
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy tất cả giáo viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: TeacherGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả giáo viên bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageTeacher', true);
export function getTeacherPage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage('pageTeacher', pageNumber, pageSize,condition);
    return dispatch => {
        const url = '/api/teacher/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giáo viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TeacherGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách giáo viên bị lỗi!', 'danger'));
    };
}

export function getTeacher(_id, done) {
    return dispatch => ajaxGetTeacher(_id, data => {
        if (data.error) {
            T.notify('Lấy thông tin giáo viên bị lỗi!', 'danger');
            console.error('GET: getTeacher', data.error);
        } else {
            dispatch({ type: TeacherGetItem, item: data.item });
            done && done(data.item);
        
        }
    });
}

export function createTeacher(data, done) {
    return dispatch => {
        const url = '/api/teacher';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo giáo viên bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo giáo viên thanh công!', 'success');
                done && done(data);
                dispatch(getTeacherPage());
            }
        }, error => console.error(error) || T.notify('Tạo giáo viên bị lỗi!', 'danger'));
    };
}

export function updateTeacher(_id, changes, done) {
    return dispatch => {
        const url = '/api/teacher';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin giáo viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin giáo viên thành công!', 'success');
                dispatch(getTeacherPage());
                dispatch({ type: TeacherGetItem, item: data.item });
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin giáo viên bị lỗi!', 'danger'));
    };
}

export function deleteTeacher(_id) {
    return dispatch => {
        const url = '/api/teacher';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin giáo viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa thông tin giáo viên thành công!', 'error', false, 800);
                dispatch(getTeacherPage());
            }
        }, error => console.error(error) || T.notify('Xóa thông tin giáo viên bị lỗi!', 'danger'));
    };
}

// TeacherCertification ---------------------------------------------------------------------------------------------------------------

export function getTeacherCertificationAll(condition, done) {
    return dispatch => {
        const url = '/api/teacher-certification/all';
        if (typeof condition == 'function') {
            done = condition;
            condition = {};
        }
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ của giáo viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: TeacherCertificationGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy chứng chỉ giáo viên bị lỗi!', 'danger'));
    };
}

export function createTeacherCertification(data, done) {
    return () => {
        const url = '/api/teacher-certification';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo chứng chỉ bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo chứng chỉ thanh công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Tạo chứng chỉ bị lỗi!', 'danger'));
    };
}

export function updateTeacherCertification(_id, changes, done) {
    return () => {
        const url = '/api/teacher-certification';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin chứng chỉ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chứng chỉ thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin chứng chỉ bị lỗi!', 'danger'));
    };
}

export function deleteTeacherCertification(_id,done) {
    return () => {
        const url = '/api/teacher-certification';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin chứng chỉ bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa thông tin chứng chỉ thành công!', 'error', false, 800);
                done && done();
            }
        }, error => console.error(error) || T.notify('Xóa thông tin chứng chỉ bị lỗi!', 'danger'));
    };
}

// TeacherProfile ---------------------------------------------------------------------------------------------------------------

export function getTeacherProfileAll(condition, done) {
    return dispatch => {
        const url = '/api/teacher-profile/all';
        if (typeof condition == 'function') {
            done = condition;
            condition = {};
        }
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hồ sơ của giáo viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: TeacherProfileGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy hồ sơ giáo viên bị lỗi!', 'danger'));
    };
}

export function createTeacherProfile(data, done) {
    return () => {
        const url = '/api/teacher-profile';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo hồ sơ bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo hồ sơ thanh công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Tạo hồ sơ bị lỗi!', 'danger'));
    };
}

export function updateTeacherProfile(_id, changes, done) {
    return () => {
        const url = '/api/teacher-profile';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin hồ sơ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hồ sơ thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin hồ sơ bị lỗi!', 'danger'));
    };
}

export function deleteTeacherProfile(_id,done) {
    return () => {
        const url = '/api/teacher-profile';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin hồ sơ bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa thông tin hồ sơ thành công!', 'error', false, 800);
                done && done();
            }
        }, error => console.error(error) || T.notify('Xóa thông tin hồ sơ bị lỗi!', 'danger'));
    };
}

// AJAX ---------------------------------------------------------------------------------------------------------------

export function ajaxGetTeacher(_id, done) {
    const url = '/api/teacher';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy thông tin giáo viên bị lỗi!', 'danger'));
}