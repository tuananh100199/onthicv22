import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ReviewClassGetAll = 'ReviewClassGetAll';
const ReviewClassGetPage = 'ReviewClassGetPage';
const ReviewClassGetItem = 'ReviewClassGetItem';

export default function reviewClassReducer(state = {}, data) {
    switch (data.type) {
        case ReviewClassGetAll:
            return Object.assign({}, state, { list: data.list });
        case ReviewClassGetPage:
            return Object.assign({}, state, { page: data.page });

        case ReviewClassGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageReviewClass');
export function getReviewClassPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageReviewClass', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/review-class/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách lớp ôn tập  bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: ReviewClassGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách lớp ôn tập  bị lỗi!', 'danger'));
    };
}

export function getReviewClassAll(condition,done) {
    return dispatch => {
        const url = '/api/review-class/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy lớp ôn tập  bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: ReviewClassGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy lớp ôn tập  bị lỗi', 'danger'));
    };
}

export function getReviewClass(_id, done) {
    return dispatch => ajaxGetReviewClass(_id, data => {
        if (data.error) {
            T.notify('Lấy lớp ôn tập  bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: ReviewClassGetItem, item: data.item });
        }
    });
}

export function createReviewClass(data, done) {
    return dispatch => {
        const url = '/api/review-class';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo lớp ôn tập  bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getReviewClassPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo lớp ôn tập  bị lỗi!', 'danger'));
    };
}

export function updateReviewClass(_id, changes, done) {
    return dispatch => {
        const url = '/api/review-class';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin lớp ôn tập  bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: ReviewClassGetItem, item: data.item });
                dispatch(getReviewClassPage());
                T.notify('Cập nhật lớp ôn tập  thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật lớp ôn tập  bị lỗi!', 'danger'));
    };
}

export function updateReviewClassDefault(diploma, done) {
    return dispatch => {
        const url = '/api/review-class/default';
        T.put(url, { diploma }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin lớp ôn tập  bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: ReviewClassGetItem, item: data.item });
                dispatch(getReviewClassPage());
                T.notify('Cập nhật lớp ôn tập  thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật lớp ôn tập  bị lỗi!', 'danger'));
    };
}

export function deleteReviewClass(_id) {
    return dispatch => {
        const url = '/api/review-class';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa lớp ôn tập  bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá lớp ôn tập  thành công!', 'success');
                dispatch(getReviewClassPage());
            }
        }, error => console.error(error) || T.notify('Xóa lớp ôn tập  bị lỗi!', 'danger'));
    };
}


export const ajaxSelectReviewClass = {
    ajax: true,
    url: '/api/review-class/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    }),
    fetchOne: (_id, done) => getReviewClass(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
};

export function ajaxGetReviewClass(_id, done) {
    const url = '/api/review-class';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy lớp ôn tập  bị lỗi!', 'danger'));
}