import T from 'view/js/common';
T.pushComponentTypes('all news');
T.pushComponentTypes('last news');
T.initCookiePage('pageNews');
T.initCookiePage('pageDraftNews');

// Reducer ------------------------------------------------------------------------------------------------------------
const NewsGetNewsInPage = 'News:GetNewsInPage';
const NewsGetDraftNewsInPage = 'News:GetDraftNewsInPage';
const NewsGetNews = 'News:GetNews';
const NewsGetDraftNews = 'News:GetDraftNews';

const NewsGetNewsInPageByUser = 'News:GetNewsInPageByUser';
const NewsGetNewsByUser = 'News:GetNewsByUser';
const NewsGetNewsFeed = 'News:GetNewsFeed';

export default function newsReducer(state = null, data) {
    switch (data.type) {
        case NewsGetNewsInPage:
            return Object.assign({}, state, { page: data.page });
        case NewsGetDraftNewsInPage:
            return Object.assign({}, state, { draft: data.page });
        case NewsGetNews:
            return Object.assign({}, state, { news: data.item, categories: data.categories, docDraftUser: data.docDraftUser });
        case NewsGetDraftNews:
            return Object.assign({}, state, { draftNews: data.item, categories: data.categories });

        case NewsGetNewsInPageByUser:
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
export function getNewsInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageNews', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/news/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: NewsGetNewsInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
    }
}

export function getDraftNewsInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDraftNews', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/draft-news/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bản nháp tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: NewsGetDraftNewsInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
    }
}
export function draftToNews(draftNewsId, done) {
    return dispatch => {
        const url = '/api/draft-news/toNews/' + draftNewsId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Thao tác bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                T.notify('Bản nháp đã được duyệt thành công!', 'info');
                dispatch(getDraftNewsInPage());
                dispatch(getNewsInPage());
            }
        }, error => T.notify('Thao tác bị lỗi bị lỗi!', 'danger'));
    }
}

export function createNews(done) {
    return dispatch => {
        const url = '/api/news/default';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo tin tức bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getNewsInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo tin tức bị lỗi!', 'danger'));
    }
}
export function createDraftNewsDefault(done) {
    return (dispatch, getState) => {
        const state = getState();
        const docData = {
            categories: [],
            link: '',
            active: false,
            abstract: JSON.stringify({ vi: '', en: '' }),
            content: JSON.stringify({ vi: '', en: '' }),
        }, passValue = {
            title: '{\"vi\":\"Bản nháp\",\"en\":\"Draft\"}',
            editorId: state.system.user._id,
            documentType: 'news',
            documentJson: JSON.stringify(docData),
            editorName: state.system.user.firstname,
        }
        const url = '/api/news/draft';
        T.post(url, passValue, data => {
            if (data.error) {
                T.notify('Tạo bản nháp tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Bản nháp tin tức đã tạo thành công!', 'info');
                dispatch(getDraftNewsInPage());
                done && done(data);
            }
        })
    }
}
export function createDraftNews(result, done) {
    return dispatch => {
        const url = '/api/news/draft';
        T.post(url, result, data => {
            if (data.error) {
                T.notify('Tạo bản nháp tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Bản nháp tin tức đã tạo thành công!', 'info');
                dispatch(getDraftNewsInPage());
                done && done();
            }
            if (done) done(data);
        })
    }
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
                dispatch(getNewsInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin tin tức bị lỗi!', 'danger'));
    }
}
export function updateDraftNews(_id, changes, done) {
    return dispatch => {
        const url = '/api/draft-news';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bản nháp tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin bản nháp tin tức thành công!', 'info');
                dispatch(getDraftNewsInPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin bản nháp tin tức bị lỗi!', 'danger'));
    }
}

export function swapNews(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/news/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự tin tức thành công!', 'info');
                dispatch(getNewsInPage());
            }
        }, error => T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger'));
    }
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
                dispatch(getNewsInPage());
            }
        }, error => T.notify('Xóa tin tức bị lỗi!', 'danger'));
    }
}
export function deleteDraftNews(_id) {
    return dispatch => {
        const url = '/api/draft-news';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa mẫu tin tức bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Người dùng được xóa thành công!', 'error', false, 800);
                dispatch(getDraftNewsInPage());
            }
        }, error => T.notify('Xóa bản nháp bị lỗi!', 'danger'));
    }
}

export function getNews(_id, done) {
    return (dispatch, getState) => {
        const url = '/api/news/item/' + _id;
        const state = getState();
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                const url2 = '/api/draft/news/' + state.system.user._id;
                T.get(url2, draft => {
                    if (done) done(data);
                    dispatch({ type: NewsGetNews, item: data.item, categories: data.categories, docDraftUser: draft });
                }, error => T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'))
                if (done) done(data);
            }
        }, error => done({ error }));
    }
}
export function getDraftNews(_id, done) {
    return dispatch => {
        const url = '/api/draft-news/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: NewsGetDraftNews, item: data.item, categories: data.categories });
            }
        }, error => done({ error }));
    }
}

// Actions (user) -----------------------------------------------------------------------------------------------------
export function getNewsInPageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = '/news/page/' + pageNumber + '/' + pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNewsInPageByUser, page: data.page });
                done && done()
            }
        }, error => T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
    }
}

export function getNewsByUser(newsId, newsLink, done) {
    return dispatch => {
        const url = newsId ? '/news/item/id/' + newsId : '/news/item/link/' + newsLink;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNewsByUser, item: data.item });
                done && done(data);
            }
        }, error => T.notify('Lấy tin tức bị lỗi!', 'danger'));
    }
}

export function getNewsFeed(done) {
    return dispatch => {
        const url = '/news/page/1/' + T.newsFeedPageSize
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy new feed bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.list);
                dispatch({ type: NewsGetNewsFeed, list: data.page.list });
            }
        }, error => T.notify('Lấy new feed bị lỗi!', 'danger'));
    }
}

export function checkLink(_id, link) {
    return dispatch => {
        const url = '/news/item/check-link';
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