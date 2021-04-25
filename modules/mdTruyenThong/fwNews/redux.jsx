import T from 'view/js/common';
T.initCookiePage('pageNews');

// Reducer ------------------------------------------------------------------------------------------------------------
const NewsGetNewsPage = 'NewsGetNewsPage';
const NewsGetNewsPageByUser = 'NewsGetNewsPageByUser';
const NewsGetNewsByUser = 'NewsGetNewsByUser';
const NewsGetNewsFeed = 'NewsGetNewsFeed';

export default function newsReducer(state = null, data) {
    switch (data.type) {
        case NewsGetNewsPage:
            return Object.assign({}, state, { page: data.page });

        case NewsGetNewsPageByUser:
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

        case NewsGetNewsByUser:
            return Object.assign({}, state, { userNews: data.item });

        case NewsGetNewsFeed:
            return Object.assign({}, state, { newsFeed: data.list });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getNewsPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageNews', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/news/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: NewsGetNewsPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
    };
}

export function createNews(done) {
    return dispatch => {
        const url = '/api/news';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo tin tức bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getNewsPage());
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('Tạo tin tức bị lỗi!', 'danger'));
    };
}

export function updateNews(_id, changes, done) {
    return dispatch => {
        const url = '/api/news';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tin tức thành công!', 'info');
                dispatch(getNewsPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin tin tức bị lỗi!', 'danger'));
    };
}

export function swapNews(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/news/swap';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự tin tức thành công!', 'info');
                dispatch(getNewsPage());
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger'));
    };
}

export function deleteNews(_id) {
    return dispatch => {
        const url = '/api/news';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa tin tức bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Tin tức được xóa thành công!', 'error', false, 800);
                dispatch(getNewsPage());
            }
        }, error => console.error(error) || T.notify('Xóa tin tức bị lỗi!', 'danger'));
    };
}

export function getNews(_id, done) {
    return (dispatch) => {
        const url = '/api/news';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy tin tức bị lỗi!', 'danger'));
    };
}

export function checkLink(_id, link, done) {
    return dispatch => {
        const url = '/api/news/check-link';
        T.put(url, { _id, link }, data => {
            if (data.error) {
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                done && done();
            }
        }, error => console.error(error) || T.notify('Kiểm tra Link bị lỗi!', 'danger'));
    };
}

// Actions (user) -----------------------------------------------------------------------------------------------------
export function getNewsPageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = '/home/news/page/' + pageNumber + '/' + pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNewsPageByUser, page: data.page });
                done && done();
            }
        }, error => console.error(error) || T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
    };
}

export function getNewsByUser(_id, link, done) {
    return dispatch => {
        const url = '/home/news/item';
        T.get(url, { _id, link }, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNewsByUser, item: data.item });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy tin tức bị lỗi!', 'danger'));
    };
}

export function getNewsFeed(done) {
    return dispatch => {
        const url = '/home/news/page/1/' + T.newsFeedPageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy new feed bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.list);
                dispatch({ type: NewsGetNewsFeed, list: data.page.list });
            }
        }, error => console.error(error) || T.notify('Lấy new feed bị lỗi!', 'danger'));
    };
}