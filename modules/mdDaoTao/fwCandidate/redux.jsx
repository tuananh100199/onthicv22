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
export function getCandidatePage(pageNumber, pageSize, condition,filter,sort, done) {
    if(typeof sort=='function'){
        done=sort;
        sort=undefined;
    }
    else if(typeof filter=='function'){
        done=filter;
        filter=undefined;
    }
    const page = T.updatePage('pageCandidate', pageNumber, pageSize,condition,filter,sort);
    return dispatch => {
        const url = '/api/candidate/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition:page.pageCondition,filter:page.filter,sort:page.sort }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CandidateGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger'));
    };
}

export function getCandidate(_id, done) {
    return dispatch => {
        const url = '/api/candidate';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.item);
                dispatch({ type: CandidateUpdate, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger'));
    };
}

export function updateCandidate(_id, changes, done) {
    return dispatch => {
        const url = '/api/candidate';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký tư vấn thành công!', 'info');
                dispatch(getCandidatePage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger'));
    };
}

export function updateUngVienTiemNang(_id) {
    return dispatch => {
        const url = '/api/candidate-potential';
        T.put(url, { _id }, data => {
            if (data.error) {
                T.notify('Chuyển thành ứng viên tiềm năng bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Chuyển thành ứng viên tiềm năng thành công!', 'success', false, 800);
                dispatch(getCandidatePage());
            }
        }, error => console.error(error) || T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger'));
    };
}

export function changeCandidate(item) {
    return { type: CandidateUpdate, item };
}

export function createCandidate(candidate, done) {
    return () => {
        const url = '/api/candidate';
        T.post(url, { candidate }, data => {
            if (data.error) {
                T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else if (data.notify) {
                T.alert(data.notify, 'error', false, 2000);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger'));
    };
}

export function exportCandidateToExcel() {
    T.download(T.url('/api/candidate/export'));
}