import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CandidateGetPage = 'CandidateGetPage';
const CandidateUpdate = 'CandidateUpdate';

export default function candidateReducer(state = null, data) {
    switch (data.type) {
        case CandidateGetPage:
            return Object.assign({}, state, { page: data.page });

        case CandidateUpdate: {
            if (state) {
                let updatedList = Object.assign({}, state.list),
                    updatedPage = Object.assign({}, state.page),
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
                return Object.assign({}, state, { list: updatedList, page: updatedPage });
            } else {
                return state;
            }
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageCandidate');
export function getCandidatePage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageCandidate', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/candidate/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CandidateGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function getCandidate(_id, done) {
    return dispatch => {
        const url = '/api/candidate';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: CandidateUpdate, item: data.item });
            }
        }, error => T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function updateCandidate(_id, changes, done) {
    return dispatch => {
        const url = '/api/candidate';
        T.put(url, { _id, changes }, data => {
            console.log('data', data)
            if (data.error) {
                T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký tư vấn thành công!', 'info');
                dispatch(getCandidatePage());
                done && done();
            }
        }, error => T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger'));
    }
}

export function deleteCandidate(_id) {
    return dispatch => {
        const url = '/api/candidate';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá đăng ký tư vấn thành công!', 'error', false, 800);
                dispatch(getCandidatePage());
            }
        }, error => T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger'));
    }
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
            }
        }, error => T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger'));
    }
}
export function exportCandidateToExcel(done) {
    return dispatch => {
        T.download(T.url(`/api/candidate/export`));
    }
}