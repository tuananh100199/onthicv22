import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StudyProgramGet = 'StudyProgramGet';
const StudyProgramGetAll = 'StudyProgramGetAll';

export default function studyProgramReducer(state = {}, data) {
    switch (data.type) {
        case StudyProgramGetAll:
            return Object.assign({}, state, { list: data.list });

        case StudyProgramGet: {
            return Object.assign({}, state, { item: data.item });
        }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getStudyProgramAll(searchText, done) {
    return dispatch => {
        const url = '/api/study-program/all';
        if (typeof searchText == 'function') {
            done = searchText;
            searchText = '';
        }
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả chương trình học bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: StudyProgramGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả chương trình học bị lỗi!', 'danger'));
    };
}

export function getStudyProgramItem(_id, done) {
    return dispatch => ajaxGetStudyProgram(_id, data => {
        if (data.error) {
            T.notify('Lấy chương trình học bị lỗi', 'danger');
            console.error('GET: getStudyProgramItem.', data.error);
        } else {
            dispatch({ type: StudyProgramGet, item: data.item });
        }
        done && done(data);
    });
}

export function createStudyProgram(data, done) {
    return dispatch => {
        const url = '/api/study-program';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo chương trình học bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done(data);
                dispatch(getStudyProgramAll());
            }
        }, error => console.error(error) || T.notify('Tạo chương trình học bị lỗi!', 'danger'));
    };
}

export function updateStudyProgram(_id, changes, done) {
    return dispatch => {
        const url = '/api/study-program';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật chương trình học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: StudyProgramGet, item: data.item });
                dispatch(getStudyProgramAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật chương trình học bị lỗi!', 'danger'));
    };
}

export function deleteStudyProgram(_id) {
    return dispatch => {
        const url = '/api/study-program';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa chương trình học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa chương trình học thành công!', 'error', false, 800);
                dispatch(getStudyProgramAll());
            }
        }, error => console.error(error) || T.notify('Xóa chương trình học bị lỗi!', 'danger'));
    };
}

// AJAX ---------------------------------------------------------------------------------------------------------------
export const ajaxSelectStudyProgram = T.createAjaxAdapter(
    '/api/study-program/all',
    response => response && response.list ? response.list.map(item => ({ id: item._id, text: item.title + (item.isOutside ? ' (cơ sở ngoài)' : '') })) : []
);

export function ajaxGetStudyProgram(_id, done) {
    const url = '/api/study-program';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy chương trình học đào tạo bị lỗi!', 'danger'));
}