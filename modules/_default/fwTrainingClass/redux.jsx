import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TrainingClassGetPage = 'TrainingClassGetPage';
const TrainingClassGetItem = 'TrainingClassGetItem';

export default function trainingClassReducer(state = {}, data) {
    switch (data.type) {
        case TrainingClassGetPage:
            return Object.assign({}, state, { page: data.page });

        case TrainingClassGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageTrainingClass');
export function getTrainingClassPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageTrainingClass', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/training-class/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách lớp tập huấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: TrainingClassGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách lớp tập huấn bị lỗi!', 'danger'));
    };
}

export function getTrainingClass(_id, done) {
    return dispatch => ajaxGetTrainingClass(_id, data => {
        if (data.error) {
            T.notify('Lấy lớp tập huấn bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: TrainingClassGetItem, item: data.item });
        }
    });
}

export function createTrainingClass(data, done) {
    return dispatch => {
        const url = '/api/training-class';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo lớp tập huấn bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Thêm lớp tập huấn thành công!', 'success');
                dispatch(getTrainingClassPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo lớp tập huấn bị lỗi!', 'danger'));
    };
}

export function updateTrainingClass(_id, changes, done) {
    return dispatch => {
        const url = '/api/training-class';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin lớp tập huấn bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: TrainingClassGetItem, item: data.item });
                dispatch(getTrainingClassPage());
                T.notify('Cập nhật lớp tập huấn thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật lớp tập huấn bị lỗi!', 'danger'));
    };
}

export function deleteTrainingClass(_id) {
    return dispatch => {
        const url = '/api/training-class';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa lớp tập huấn bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá lớp tập huấn thành công!', 'success');
                dispatch(getTrainingClassPage());
            }
        }, error => console.error(error) || T.notify('Xóa lớp tập huấn bị lỗi!', 'danger'));
    };
}

export function ajaxGetTrainingClass(_id, done) {
    const url = '/api/training-class';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy lớp tập huấn bị lỗi!', 'danger'));
}