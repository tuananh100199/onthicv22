import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const EncryptionGetAll = 'EncryptionGetAll';
const EncryptionGetPage = 'EncryptionGetPage';
const EncryptionGetItem = 'EncryptionGetItem';

export default function encryptionReducer(state = {}, data) {
    switch (data.type) {
        case EncryptionGetAll:
            return Object.assign({}, state, { list: data.list });
        case EncryptionGetPage:
            return Object.assign({}, state, { page: data.page });

        case EncryptionGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageEncryption');
export function getEncryptionPage(pageNumber, pageSize, pageCondition, filter, sort, done) {
    if(typeof sort=='function'){
        done=sort;
        sort=undefined;
    }
    else if(typeof filter=='function'){
        done=filter;
        filter=undefined;
    }
    const page = T.updatePage('pageEncryption', pageNumber, pageSize, pageCondition, filter, sort);
    return (dispatch) => {
        const url = `/api/encryption/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition,filter:page.filter,sort:page.sort }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: EncryptionGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger'));
    };
}

export function getEncryptionAll(condition,done) {
    return dispatch => {
        const url = '/api/encryption/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy chứng chỉ bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: EncryptionGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy chứng chỉ bị lỗi', 'danger'));
    };
}

// export function getEncryption(_id, done) {
//     return dispatch => ajaxGetEncryption(_id, data => {
//         if (data.error) {
//             T.notify('Lấy chứng chỉ bị lỗi!', 'danger');
//             console.error('GET: getCourseType.', data.error);
//         } else {
//             done && done(data.item);
//             dispatch({ type: EncryptionGetItem, item: data.item });
//         }
//     });
// }

export function createEncryption(data, done) {
    return dispatch => {
        const url = '/api/encryption';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo chứng chỉ bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getEncryptionPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo chứng chỉ bị lỗi!', 'danger'));
    };
}

export function updateEncryption(_id, changes, done) {
    return dispatch => {
        const url = '/api/encryption';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin chứng chỉ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: EncryptionGetItem, item: data.item });
                dispatch(getEncryptionPage());
                T.notify('Cập nhật chứng chỉ thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật chứng chỉ bị lỗi!', 'danger'));
    };
}

export function updateEncryptionDefault(diploma, done) {
    return dispatch => {
        const url = '/api/encryption/default';
        T.put(url, { diploma }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin chứng chỉ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: EncryptionGetItem, item: data.item });
                dispatch(getEncryptionPage());
                T.notify('Cập nhật chứng chỉ thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật chứng chỉ bị lỗi!', 'danger'));
    };
}

export function deleteEncryption(_id) {
    return dispatch => {
        const url = '/api/encryption';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa chứng chỉ bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá chứng chỉ thành công!', 'success');
                dispatch(getEncryptionPage());
            }
        }, error => console.error(error) || T.notify('Xóa chứng chỉ bị lỗi!', 'danger'));
    };
}


// export const ajaxSelectEncryption = {
//     ajax: true,
//     url: '/api/encryption/all',
//     data: {},
//     processResults: response => ({
//         results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
//     }),
//     fetchOne: (_id, done) => getEncryption(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
// };
