import T from 'view/js/common';

const FeedbackGetAll = 'FeedbackGetAll';
const FeedbackChange = 'FeedbackChange';
const FeedbackGetPage = 'FeedbackGetPage';

export default function feedbackReducer(state = {}, data) {
    switch (data.type) {
        case FeedbackGetAll:
            return Object.assign({}, state, { list: data.list });
        case FeedbackGetPage:
            return Object.assign({}, state, { page: data.page });

        // case FeedbackGetItem:
        //     return Object.assign({}, state, { item: Object.assign({}, state ? state.item : {}, data.item || {}) });

        case FeedbackChange: {
            let updateItemState = state.slice();
            for (let i = 0; i < updateItemState.length; i++) {
                if (updateItemState[i]._id == data.item._id) {
                    updateItemState[i] = data.item;
                    break;
                }
            }
            return updateItemState;
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getFeedbackAll(type, _refId, done) {
    return dispatch => {
        const url = `/api/feedback/${type}`;
        T.get(url, { _refId }, data => {
            if (data.error) {
                T.notify('Lấy phản hồi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: FeedbackGetAll, items: data.items });
                done && done(data.items);
            }
        }, error => console.error(error) || T.notify('Lấy phản hồi bị lỗi!', 'danger'));
    };
}

export function updateFeedback(_id, changes, done) {
    return dispatch => {
        const url = '/api/feedback';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật phản hồi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch((getFeedbackAll(data.item.type, data.item._refId)));
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Cập nhật phản hồi bị lỗi!', 'danger'));
    };
}

export function getFeedbackAllByUser(type, _refId, done) {
    return dispatch => {
        const url = `/api/feedback/student/${type}`;
        T.get(url, { _refId }, data => {
            if (data.error) {
                T.notify('Lấy phản hồi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: FeedbackGetAll, items: data.items });
                done && done(data.items);
            }
        }, error => console.error(error) || T.notify('Lấy phản hồi bị lỗi!', 'danger'));
    };
}

export function getFeedbackPage(pageNumber, pageSize, pageCondition, done) {
    return dispatch => {
        const url = `/api/feedback/page/${pageNumber}/${pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy phản hồi bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: FeedbackGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy phản hồi bị lỗi!', 'danger'));
    };
}

export function getFeedbackPageByStudent(pageNumber, pageSize, pageCondition, done) {
    return dispatch => {
        const url = `/api/feedback/student/page/${pageNumber}/${pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy phản hồi bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: FeedbackGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy phản hồi bị lỗi!', 'danger'));
    };
}

export function createFeedback(newData, done) {
    return dispatch => {
        const url = '/api/feedback/student';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo phản hồi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getFeedbackAllByUser(newData.type, newData._refId));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo phản hồi bị lỗi!', 'danger'));
    };
}


// export function updateFeedback(_id, changes, done) {
//     return dispatch => {
//         const url = '/api/feedback';
//         T.put(url, { _id, changes }, data => {
//             if (data.error) {
//                 T.notify('Cập nhật phản hồi bị lỗi!', 'danger');
//                 console.error('PUT: ' + url + '.', data.error);
//                 done && done(data.error);
//             } else {
//                 T.notify('Cập nhật phản hồi thành công!', 'success');
//                 dispatch(getFeedbackAll(data.item.type));
//                 done && done();
//             }
//         }, error => console.error(error) || T.notify('Cập nhật phản hồi bị lỗi!', 'danger'));
//     };
// }

export function changeFeedback(feedback) {
    return { type: FeedbackChange, item: feedback };
}