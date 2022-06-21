import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const LawGetAll = 'LawGetAll';
const LawGetPage = 'LawGetPage';
const LawGetItem = 'LawGetItem';
const GetLawPageByUser = 'GetLawPageByUser';
const GetLawByUser = 'GetLawByUser';

export default function LawReducer(state = {}, data) {
    switch (data.type) {
        case LawGetAll:
            return Object.assign({}, state, { list: data.list });

        case LawGetPage:
            return Object.assign({}, state, { page: data.page });
        case LawGetItem:
            return Object.assign({}, state, { item: data.item });
        case GetLawPageByUser:
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
        case GetLawByUser:
            return Object.assign({}, state, { userLaw: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageLaw', true);
export function getLawPage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage('pageLaw', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/law/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quy định pháp luật bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page);
                dispatch({ type: LawGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách quy định pháp luật bị lỗi!', 'danger'));
    };
}

export function getLawAll(done) {
    return dispatch => {
        const url = '/api/law/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy quy định pháp luật bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: LawGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy quy định pháp luật bị lỗi', 'danger'));
    };
}

export function createLaw(data, done) {
    return dispatch => {
        const url = '/api/law';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo quy định pháp luật bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo quy định pháp luật thanh công!', 'success');
                dispatch(getLawPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo quy định pháp luật bị lỗi!', 'danger'));
    };
}

export function getLaw(_id, done) {
    return dispatch => ajaxGetLaw(_id, data => {
        if (data.error) {
            T.notify('Lấy quy định pháp luật bị lỗi!', 'danger');
            console.error('GET: getLaw.', data.error);
        } else {
            done && done(data);
            dispatch({ type: LawGetItem, item: data.item });
        }
    });
}

export function updateLaw(_id, changes, done) {
    return dispatch => {
        const url = '/api/law';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật quy định pháp luật bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật quy định pháp luật thành công!', 'success');
                dispatch(getLawPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật quy định pháp luật bị lỗi!', 'danger'));
    };
}

export function swapLaw(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/law/swap';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự tin tức thành công!', 'info');
                dispatch(getLawPage());
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger'));
    };
}

export function deleteLaw(_id) {
    return dispatch => {
        const url = '/api/law';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa quy định pháp luật bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa quy định pháp luật thành công!', 'error', false, 800);
                dispatch(getLawPage());
            }
        }, error => console.error(error) || T.notify('Xóa quy định pháp luật bị lỗi!', 'danger'));
    };
}

// Actions (user) -----------------------------------------------------------------------------------------------------
export function getLawPageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = '/api/home/law/page/' + pageNumber + '/' + pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách quy định pháp luật bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GetLawPageByUser, page: data.page });
                done && done();
            }
        }, error => console.error(error) || T.notify('Lấy danh sách quy định pháp luật bị lỗi!', 'danger'));
    };
}

export function getLawByUser(_id, done) {
    return dispatch => {
        const url = '/home/law/item';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GetLawByUser, item: data.item });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy tin tức bị lỗi!', 'danger'));
    };
}

export const ajaxSelectLaw = {
    ajax: true,
    url: '/api/law/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title, isExtra: item.isExtra })) : []
    }),
    fetchOne: (_id, done) => getLaw(_id, ({ item }) => done && done({ id: item._id, text: item.title, isExtra: item.isExtra }))
};

export function ajaxGetLaw(_id, done) {
    const url = '/api/law';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy quy định pháp luật bị lỗi!', 'danger'));
}