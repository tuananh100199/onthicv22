import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ContactGetAll = 'ContactGetAll';
const ContactGetPage = 'ContactGetPage';
const ContactGetUnread = 'ContactGetUnread';
const ContactAdd = 'ContactAdd';
const ContactUpdate = 'ContactUpdate';

export default function contactReducer(state = null, data) {
    switch (data.type) {
        case ContactGetAll:
            return Object.assign({}, state, { items: data.items });

        case ContactGetPage:
            return Object.assign({}, state, { page: data.page });

        case ContactGetUnread:
            return Object.assign({}, state, { unreads: data.items });

        case ContactAdd:
            if (state) {
                let addedItems = Object.assign({}, state.items),
                    addedPage = Object.assign({}, state.page),
                    addedUnreads = Object.assign({}, state.unreads),
                    addedItem = data.item;
                if (addedItems) {
                    addedItems.splice(0, 0, addedItem);
                }
                if (addedPage && addedPage.pageNumber == 1) {
                    addedPage.list = addedPage.list.slice(0);
                    addedPage.list.splice(0, 0, addedItem);
                }
                if (addedItem && addedItem.read == false) {
                    addedUnreads.splice(0, 0, addedItem);
                }
                return Object.assign({}, state, { items: addedItems, page: addedPage, unreads: addedUnreads });
            } else {
                return state;
            }

        case ContactUpdate: {
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedUnreads = Object.assign({}, state.unreads),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i]._id == updatedItem._id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i]._id == updatedItem._id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedUnreads) {
                    if (updatedItem.read) {
                        for (let i = 0, n = updatedUnreads.length; i < n; i++) {
                            if (updatedUnreads[i]._id == updatedItem._id) {
                                updatedUnreads.splice(i, 1);
                                break;
                            }
                        }
                    } else {
                        updatedPage.list.splice(0, 1, updatedItem);
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage, unreads: updatedUnreads });
            } else {
                return state;
            }
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getContactAll(done) {
    return dispatch => {
        const url = '/api/contact/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả liên hệ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: ContactGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả liên hệ bị lỗi!', 'danger'));
    }
}

T.initCookiePage('pageContact');
export function getContactPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageContact', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/contact/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách liên hệ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: ContactGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách liên hệ bị lỗi!', 'danger'));
    }
}

export function getContact(contactId, done) {
    return dispatch => {
        const url = '/api/contact/item/' + contactId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy liên hệ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: ContactUpdate, item: data.item });
            }
        }, error => T.notify('Lấy liên hệ bị lỗi!', 'danger'));
    }
}

export function getUnreadContacts(done) {
    return dispatch => {
        const url = '/api/contact/unread';
        T.get(url, data => {
            if (data.error) {
                done && done(null, data.error);
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: ContactGetUnread, items: data.items });
            }
        }, error => T.notify('Lấy danh sách liên hệ bị lỗi!', 'danger'));
    }
}

export function updateContact(_id, changes, done) {
    return dispatch => {
        const url = '/api/contact';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật liên hệ bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật liên hệ thành công!', 'info');
                dispatch(getContactPage());
                done && done();
            }
        }, error => T.notify('Cập nhật liên hệ bị lỗi', 'danger'));
    }
}

export function deleteContact(_id) {
    return dispatch => {
        const url = '/api/contact';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá liên hệ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá liên hệ thành công!', 'error', false, 800);
                dispatch(getContactPage());
            }
        }, error => T.notify('Xoá liên hệ bị lỗi', 'danger'));
    }
}

export function addContact(item) {
    return { type: ContactAdd, item };
}
export function changeContact(item) {
    return { type: ContactUpdate, item };
}

export function createContact(contact, done) {
    return dispatch => {
        const url = '/api/contact';
        T.post(url, { contact }, data => {
            if (data.error) {
                T.notify('Gửi liên hệ bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Gửi liên hệ bị lỗi!', 'danger'));
    }
}