import T from 'view/js/common';

const RateGetItem = 'RateGetItem';

export default function rateReducer(state = {}, data) {
    switch (data.type) {
        case RateGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
// export function getRateAll(type, _refId, done) {
//     return dispatch => {
//         const url = `/api/rate/${type}`;
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

export function getRateByUser(type, _refId, done) {
    return dispatch => {
        const url = `/api/rate/${type}`;
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

// export function updateRate(_id, changes, done) {
//     return dispatch => {
//         const url = '/api/rate';
//         T.put(url, { _id, changes }, data => {
//             if (data.error) {
//                 T.notify('Cập nhật đánh giá bị lỗi!', 'danger');
//                 console.error('PUT: ' + url + '.', data.error);
//                 done && done(data.error);
//             } else {
//                 dispatch((getRateAll(data.item.type,data.item._refId)));
//                 done && done(data.item);
//             }
//         }, error => console.error(error) || T.notify('Cập nhật đánh giá bị lỗi!', 'danger'));
//     };
// }

// export function getRateAllByUser(type, _refId, done) {
//     return dispatch => {
//         const url = `/home/rate/${type}`;
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
    return () => {
        const url = '/home/rate';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo đánh giá bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                // dispatch(getRateAllByUser(newData.type,newData._refId));
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