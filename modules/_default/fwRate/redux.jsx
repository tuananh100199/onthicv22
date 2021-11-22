import T from 'view/js/common';

const RateGetItem = 'RateGetItem';
const RateGetPage = 'RateGetPage';

export default function rateReducer(state = {}, data) {
    switch (data.type) {
        case RateGetItem:
            return Object.assign({}, state, { item: data.item });
        case RateGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getRatePageByAdmin(pageNumber, pageSize, pageCondition, done) {
    return dispatch => {
        const url = `/api/rate/admin/page/${pageNumber}/${pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy đánh giá bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: RateGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy đánh giá bị lỗi!', 'danger'));
    };
}

export function getRatePage(pageNumber, pageSize, pageCondition, done) {
    return dispatch => {
        const url = `/api/rate/page/${pageNumber}/${pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy đánh giá bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: RateGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy đánh giá bị lỗi!', 'danger'));
    };
}

export function getRateByUser(type, _refId, done) {
    return dispatch => {
        const url = `/api/rate/student/${type}`;
        T.get(url, { _refId }, data => {
            if (data.error) {
                T.notify('Lấy đánh giá bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: RateGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy đánh giá bị lỗi!', 'danger'));
    };
}

export function getRateStudentByAdmin(courseId, listRefId, done) {
    return dispatch => {
        const url = '/api/rate/student';
        T.get(url, { listRefId, courseId }, data => {
            if (data.error) {
                T.notify('Lấy đánh giá bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: RateGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy đánh giá bị lỗi!', 'danger'));
    };
}

export function getRateLessonByAdminPage(pageNumber, pageSize, pageCondition, done) {
    return dispatch => {
        const url = `/api/rate/lesson/page/${pageNumber}/${pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy đánh giá bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: RateGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy đánh giá bị lỗi!', 'danger'));
    };
}

export function updateRate(_id, changes, done) {
    return dispatch => {
        const url = '/api/rate/student';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đánh giá bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: RateGetItem, item: changes });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Cập nhật đánh giá bị lỗi!', 'danger'));
    };
}

// export function getRateAllByUser(type, _refId, done) {
//     return dispatch => {
//         const url = `/api/rate/student/${type}`;
//         T.get(url, { _refId }, data => {
//             if (data.error) {
//                 T.notify('Lấy đánh giá bị lỗi!', 'danger');
//                 console.error('GET: ' + url + '.', data.error);
//             } else {
//                 dispatch({ type: RateGetAll, items: data.items });
//                 done && done(data.items);
//             }
//         }, error => console.error(error) || T.notify('Lấy đánh giá bị lỗi!', 'danger'));
//     };
// }

export function createRate(newData, done) {
    return dispatch => {
        const url = '/api/rate/student';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo đánh giá bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch({ type: RateGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Tạo đánh giá bị lỗi!', 'danger'));
    };
}


// export function updateRate(_id, changes, done) {
//     return dispatch => {
//         const url = '/api/rate';
//         T.put(url, { _id, changes }, data => {
//             if (data.error) {
//                 T.notify('Cập nhật đánh giá bị lỗi!', 'danger');
//                 console.error('PUT: ' + url + '.', data.error);
//                 done && done(data.error);
//             } else {
//                 T.notify('Cập nhật đánh giá thành công!', 'success');
//                 dispatch(getRateAll(data.item.type));
//                 done && done();
//             }
//         }, error => console.error(error) || T.notify('Cập nhật đánh giá bị lỗi!', 'danger'));
//     };
// }