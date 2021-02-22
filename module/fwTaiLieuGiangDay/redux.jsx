import T from '../../view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const DocumentGetDocumentInPage = 'Document:GetDocumentInPage';
const DocumentGetDocument = 'Document:GetDocument';
const DocumentGetDocumentInPageByUser = 'Document:GetDocumentInPageByUser';
const DocumentGetDocumentByUser = 'Document:GetDocumentByUser';
const DocumentGetDocumentFeed = 'Document:GetDocumentFeed';

export default function documentReducer(state = null, data) {
    switch (data.type) {
        case DocumentGetDocumentInPage:
            return Object.assign({}, state, { page: data.page });

        case DocumentGetDocument:
            return Object.assign({}, state, { document: data.item, categories: data.categories });

        case DocumentGetDocumentInPageByUser:
            if (state == null || state.userCondition != data.condition) {
                return Object.assign({}, state, { userCondition: data.condition, userPage: data.page });
            } else {
                const userPage = Object.assign({}, data.page);
                userPage.list = state.userPage && state.userPage.list ? state.userPage.list.slice() : [];
                let _ids = userPage.list.map(item => item._id);
                if (data.page && data.page.list && data.page.list.length > 0) {
                    data.page.list.forEach(item => {
                        if (_ids.indexOf(item._id) == -1) {
                            _ids.push(item._id);
                            userPage.list.push(item);
                        }
                    });
                }
                return Object.assign({}, state, { userPage });
            }

        case DocumentGetDocumentByUser:
            return Object.assign({}, state, { userDocument: data.item });

        case DocumentGetDocumentFeed:
            return Object.assign({}, state, { documentFeed: data.list });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageDocument');
export function getDocumentInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDocument', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/document/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DocumentGetDocumentInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}

export function getDocument(_id, done) {
    return dispatch => {
        const url = '/api/document/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: DocumentGetDocument, item: data.item, categories: data.categories });
            }
        }, error => T.notify('Lấy khóa học bị lỗi!', 'danger'));
    }
}

export function createDocument(done) {
    return dispatch => {
        const url = '/api/document';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getDocumentInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo khóa học bị lỗi!', 'danger'));
    }
}

export function updateDocument(_id, changes, done) {
    return dispatch => {
        const url = '/api/document';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khóa học thành công!', 'info');
                dispatch(getDocumentInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger'));
    }
}

export function deleteDocument(_id) {
    return dispatch => {
        const url = '/api/document';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getDocumentInPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}

// Actions (user) -----------------------------------------------------------------------------------------------------
const texts = {
    getDocumentInPageByUserError: 'Lấy danh sách khóa học bị lỗi!',
    getDocumentByUserError: 'Lấy khóa học bị lỗi!',
    getDocumentFeedError: 'Lấy new feed bị lỗi!',
};

export function getDocumentInPageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = '/document/page/' + pageNumber + '/' + pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: DocumentGetDocumentInPageByUser, page: data.page });
                done && done()
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}

export function getDocumentByUser(documentId, documentLink, done) {
    return dispatch => {
        const url = documentId ? '/document/item/id/' + documentId : '/document/item/link/' + documentLink;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: DocumentGetDocumentByUser, item: data.item });
                done && done(data);
            }
        }, error => T.notify('Lấy khóa học bị lỗi!', 'danger'));
    }
}

export function getDocumentFeed(done) {
    return dispatch => {
        const url = '/document/page/1/' + T.documentFeedPageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.list);
                dispatch({ type: DocumentGetDocumentFeed, list: data.page.list });
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}

export function checkLink(_id, link) {
    return dispatch => {
        const url = '/document/item/check-link';
        T.put(url, { _id, link }, data => {
            if (data.error) {
                T.notify('Link không hợp lệ!', 'danger');
                console.error('PUT: ' + url + '.', error);
            } else {
                T.notify('Link hợp lệ!', 'success');
            }
        }, error => T.notify('Kiểm tra Link bị lỗi!', 'danger'));
    }
}