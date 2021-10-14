// import T from 'view/js/common';

// const RateGetAll = 'RateGetAll';
// const RateChange = 'RateChange';

// export default function rateReducer(state = {}, data) {
//     // switch (data.type) {
//     //     case RateGetAll:
//     //         return data.items;

//     //     // case RateGetItem:
//     //     //     return Object.assign({}, state, { item: Object.assign({}, state ? state.item : {}, data.item || {}) });

//     //     case RateChange: {
//     //         let updateItemState = state.slice();
//     //         for (let i = 0; i < updateItemState.length; i++) {
//     //             if (updateItemState[i]._id == data.item._id) {
//     //                 updateItemState[i] = data.item;
//     //                 break;
//     //             }
//     //         }
//     //         return updateItemState;
//     //     }

//     //     default:
//     //         return state;
//     // }
// }

// // Actions ------------------------------------------------------------------------------------------------------------
// export function getRateAll(type, _refId, done) {
//     return dispatch => {
//         const url = `/api/rate/${type}`;
//         T.get(url, { _refId }, data => {
//             if (data.error) {
//                 T.notify('Lấy phản hồi bị lỗi!', 'danger');
//                 console.error('GET: ' + url + '.', data.error);
//             } else {
//                 dispatch({ type: RateGetAll, items: data.items });
//                 done && done(data.items);
//             }
//         }, error => console.error(error) || T.notify('Lấy phản hồi bị lỗi!', 'danger'));
//     };
// }

// export function updateRate(_id, changes, done) {
//     return dispatch => {
//         const url = '/api/rate';
//         T.put(url, { _id, changes }, data => {
//             if (data.error) {
//                 T.notify('Cập nhật phản hồi bị lỗi!', 'danger');
//                 console.error('PUT: ' + url + '.', data.error);
//                 done && done(data.error);
//             } else {
//                 dispatch((getRateAll(data.item.type,data.item._refId)));
//                 done && done(data.item);
//             }
//         }, error => console.error(error) || T.notify('Cập nhật phản hồi bị lỗi!', 'danger'));
//     };
// }

// export function getRateAllByUser(type, _refId, done) {
//     return dispatch => {
//         const url = `/home/rate/${type}`;
//         T.get(url, { _refId }, data => {
//             if (data.error) {
//                 T.notify('Lấy phản hồi bị lỗi!', 'danger');
//                 console.error('GET: ' + url + '.', data.error);
//             } else {
//                 dispatch({ type: RateGetAll, items: data.items });
//                 done && done(data.items);
//             }
//         }, error => console.error(error) || T.notify('Lấy phản hồi bị lỗi!', 'danger'));
//     };
// }

// export function createRate(newData, done) {
//     return dispatch => {
//         const url = '/home/rate';
//         T.post(url, { newData }, data => {
//             if (data.error) {
//                 T.notify('Tạo phản hồi bị lỗi!', 'danger');
//                 console.error('POST: ' + url + '.', data.error);
//             } else {
//                 dispatch(getRateByUser(newData.type,newData._refId));
//                 done && done(data);
//             }
//         }, error => console.error(error) || T.notify('Tạo phản hồi bị lỗi!', 'danger'));
//     };
// }


// // export function updateRate(_id, changes, done) {
// //     return dispatch => {
// //         const url = '/api/rate';
// //         T.put(url, { _id, changes }, data => {
// //             if (data.error) {
// //                 T.notify('Cập nhật phản hồi bị lỗi!', 'danger');
// //                 console.error('PUT: ' + url + '.', data.error);
// //                 done && done(data.error);
// //             } else {
// //                 T.notify('Cập nhật phản hồi thành công!', 'success');
// //                 dispatch(getRateAll(data.item.type));
// //                 done && done();
// //             }
// //         }, error => console.error(error) || T.notify('Cập nhật phản hồi bị lỗi!', 'danger'));
// //     };
// // }

// export function changeRate(rate) {
//     return { type: RateChange, item: rate };
// }