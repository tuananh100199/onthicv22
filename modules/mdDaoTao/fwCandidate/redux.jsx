import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CandidateGetAll = 'Candidate:GetAll';
const CandidateGetPage = 'Candidate:GetPage';
const CandidateGetUnread = 'Candidate:GetUnread';
const CandidateAdd = 'Candidate:Add';
const CandidateUpdate = 'Candidate:Update';

export default function candidateReducer(state = null, data) {
    switch (data.type) {
        case CandidateGetAll:
            return Object.assign({}, state, { list: data.list });

        case CandidateGetPage:
            return Object.assign({}, state, { page: data.page });

        case CandidateGetUnread:
            return Object.assign({}, state, { unreads: data.list });

        case CandidateAdd:
            if (state) {
                let addedList = Object.assign({}, state.list),
                    addedPage = Object.assign({}, state.page),
                    addedUnreads = Object.assign({}, state.unreads),
                    addedItem = data.item;
                if (addedList) {
                    addedList.splice(0, 0, addedItem);
                }
                if (addedPage && addedPage.pageNumber == 1) {
                    addedPage.list = addedPage.list.slice(0);
                    addedPage.list.splice(0, 0, addedItem);
                }
                if (addedItem && addedItem.read == false) {
                    addedUnreads.splice(0, 0, addedItem);
                }
                return Object.assign({}, state, { list: addedList, page: addedPage, unreads: addedUnreads });
            } else {
                return state;
            }

        case CandidateUpdate: {
            if (state) {
                let updatedList = Object.assign({}, state.list),
                    updatedPage = Object.assign({}, state.page),
                    updatedUnreads = Object.assign({}, state.unreads),
                    updatedItem = data.item;
                if (updatedList) {
                    for (let i = 0, n = updatedList.length; i < n; i++) {
                        if (updatedList[i]._id == updatedItem._id) {
                            updatedList.splice(i, 1, updatedItem);
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
                return Object.assign({}, state, { list: updatedList, page: updatedPage, unreads: updatedUnreads });
            } else {
                return state;
            }
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getCandidateAll(done) {
    return dispatch => {
        const url = '/api/candidate/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả đăng ký nhận tin bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: CandidateGetAll, list: data.list });
            }
        }, error => T.notify('Lấy tất cả đăng ký nhận tin bị lỗi!', 'danger'));
    }
}

T.initCookiePage('pageCandidate');
export function getCandidatePage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageCandidate', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/candidate/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký nhận tin bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CandidateGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách đăng ký nhận tin bị lỗi!', 'danger'));
    }
}

export function getCandidate(candidateId, done) {
    return dispatch => {
        const url = '/api/candidate/item/' + candidateId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đăng ký nhận tin bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: CandidateUpdate, item: data.item });
            }
        }, error => T.notify('Lấy đăng ký nhận tin bị lỗi!', 'danger'));
    }
}

export function getUnreadCandidates(done) {
    return dispatch => {
        const url = '/api/candidate/unread';
        T.get(url, data => {
            if (data.error) {
                done && done(null, data.error);
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: CandidateGetUnread, list: data.list });
            }
        }, error => T.notify('Lấy danh sách đăng ký nhận tin bị lỗi!', 'danger'));
    }
}

export function updateCandidate(_id, changes, done) {
    return dispatch => {
        const url = '/api/candidate';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đăng ký nhận tin bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký nhận tin thành công!', 'info');
                dispatch(getCandidatePage());
                done && done();
            }
        }, error => T.notify('Cập nhật đăng ký nhận tin bị lỗi', 'danger'));
    }
}

export function deleteCandidate(_id) {
    return dispatch => {
        const url = '/api/candidate';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá đăng ký nhận tin bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá đăng ký nhận tin thành công!', 'error', false, 800);
                dispatch(getCandidatePage());
            }
        }, error => T.notify('Xoá đăng ký nhận tin bị lỗi', 'danger'));
    }
}

export function addCandidate(item) {
    return { type: CandidateAdd, item };
}
export function changeCandidate(item) {
    return { type: CandidateUpdate, item };
}

export function createCandidate(candidate, done) {
    return dispatch => {
        const url = '/api/candidate';
        T.post(url, { candidate }, data => {
            if (data.error) {
                T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                T.notify('Gửi đăng ký tư vấn thành công!', 'danger');
            }
        }, error => T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger'));
    }
}
export function exportCandidateToExcel(done) {
    return dispatch => {
        T.download(T.url(`/api/candidate/export`));
    }
}