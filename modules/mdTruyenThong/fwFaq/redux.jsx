import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const FaqGetAll = 'FaqGetAll';
const FaqGetPage = 'FaqGetPage';
const FaqGetItem = 'FaqGetItem';
const GetFaqPageByUser = 'GetFaqPageByUser';

export default function FaqReducer(state = {}, data) {
    switch (data.type) {
        case FaqGetAll:
            return Object.assign({}, state, { list: data.list });

        case FaqGetPage:
            return Object.assign({}, state, { page: data.page });
        case FaqGetItem:
            return Object.assign({}, state, { item: data.item });
        case GetFaqPageByUser:
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
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageFaq', true);
export function getFaqPage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage('pageFaq', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/faq/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page);
                dispatch({ type: FaqGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

export function getFaqAll(done) {
    return dispatch => {
        const url = '/api/faq/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy câu hỏi thường gặp bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: FaqGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy câu hỏi thường gặp bị lỗi', 'danger'));
    };
}

export function createFaq(data, done) {
    return dispatch => {
        const url = '/api/faq';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo câu hỏi thường gặp thanh công!', 'success');
                dispatch(getFaqPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

export function getFaq(_id, done) {
    return dispatch => ajaxGetFaq(_id, data => {
        if (data.error) {
            T.notify('Lấy câu hỏi thường gặp bị lỗi!', 'danger');
            console.error('GET: getFaq.', data.error);
        } else {
            done && done(data);
            dispatch({ type: FaqGetItem, item: data.item });
        }
    });
}

export function updateFaq(_id, changes, done) {
    return dispatch => {
        const url = '/api/faq';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật câu hỏi thường gặp thành công!', 'success');
                dispatch(getFaqPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

export function swapFaq(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/faq/swap';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự tin tức thành công!', 'info');
                dispatch(getFaqPage());
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger'));
    };
}

export function deleteFaq(_id) {
    return dispatch => {
        const url = '/api/faq';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa câu hỏi thường gặp thành công!', 'error', false, 800);
                dispatch(getFaqPage());
            }
        }, error => console.error(error) || T.notify('Xóa câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

// Actions (user) -----------------------------------------------------------------------------------------------------
export function getFaqPageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = '/api/home/faq/page/' + pageNumber + '/' + pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GetFaqPageByUser, page: data.page });
                done && done();
            }
        }, error => console.error(error) || T.notify('Lấy danh sách câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}


export const ajaxSelectFaq = {
    ajax: true,
    url: '/api/faq/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title, isExtra: item.isExtra })) : []
    }),
    fetchOne: (_id, done) => getFaq(_id, ({ item }) => done && done({ id: item._id, text: item.title, isExtra: item.isExtra }))
};

export function ajaxGetFaq(_id, done) {
    const url = '/api/faq';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy câu hỏi thường gặp bị lỗi!', 'danger'));
}