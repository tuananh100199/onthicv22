import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TeacherDiplomaGetAll = 'TeacherDiplomaGetAll';
const TeacherDiplomaGetPage = 'TeacherDiplomaGetPage';
const TeacherDiplomaGetItem = 'TeacherDiplomaGetItem';

export default function teacherDiplomaReducer(state = {}, data) {
    switch (data.type) {
        case TeacherDiplomaGetAll:
            return Object.assign({}, state, { list: data.list });
        case TeacherDiplomaGetPage:
            return Object.assign({}, state, { page: data.page });

        case TeacherDiplomaGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageTeacherDiploma');
export function getTeacherDiplomaPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageTeacherDiploma', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/teacher-diploma/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: TeacherDiplomaGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger'));
    };
}

export function getTeacherDiplomaAll(condition,done) {
    return dispatch => {
        const url = '/api/teacher-diploma/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy chứng chỉ bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: TeacherDiplomaGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy chứng chỉ bị lỗi', 'danger'));
    };
}

export function getTeacherDiploma(_id, done) {
    return dispatch => ajaxGetTeacherDiploma(_id, data => {
        if (data.error) {
            T.notify('Lấy chứng chỉ bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: TeacherDiplomaGetItem, item: data.item });
        }
    });
}

export function createTeacherDiploma(data, done) {
    return dispatch => {
        const url = '/api/teacher-diploma';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo chứng chỉ bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getTeacherDiplomaPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo chứng chỉ bị lỗi!', 'danger'));
    };
}

export function updateTeacherDiploma(_id, changes, done) {
    return dispatch => {
        const url = '/api/teacher-diploma';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin chứng chỉ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: TeacherDiplomaGetItem, item: data.item });
                dispatch(getTeacherDiplomaPage());
                T.notify('Cập nhật chứng chỉ thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật chứng chỉ bị lỗi!', 'danger'));
    };
}

export function updateTeacherDiplomaDefault(diploma, done) {
    return dispatch => {
        const url = '/api/teacher-diploma/default';
        T.put(url, { diploma }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin chứng chỉ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: TeacherDiplomaGetItem, item: data.item });
                dispatch(getTeacherDiplomaPage());
                T.notify('Cập nhật chứng chỉ thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật chứng chỉ bị lỗi!', 'danger'));
    };
}

export function deleteTeacherDiploma(_id) {
    return dispatch => {
        const url = '/api/teacher-diploma';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa chứng chỉ bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá chứng chỉ thành công!', 'success');
                dispatch(getTeacherDiplomaPage());
            }
        }, error => console.error(error) || T.notify('Xóa chứng chỉ bị lỗi!', 'danger'));
    };
}


export const ajaxSelectTeacherDiploma = {
    ajax: true,
    url: '/api/teacher-diploma/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    }),
    fetchOne: (_id, done) => getTeacherDiploma(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
};

export function ajaxGetTeacherDiploma(_id, done) {
    const url = '/api/teacher-diploma';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy chứng chỉ bị lỗi!', 'danger'));
}