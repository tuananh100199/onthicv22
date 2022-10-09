import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ForumGetCategories = 'ForumGetCategories';
const ForumGetPage = 'ForumGetPage';
const ForumGetPageByUser = 'ForumGetPageByUser';
const ForumGetItem = 'ForumGetItem';
const ForumGetForumByUser = 'ForumGetForumByUser';
const ForumMessageUserGetPage = 'ForumMessageUserGetPage';

export default function forumReducer(state = {}, data) {
    switch (data.type) {
        case ForumGetCategories:
            return Object.assign({}, state, { categories: data.categories });

        case ForumGetPage:
            return Object.assign({}, state, { category: data.category, page: data.page });

        case ForumGetItem:
            return Object.assign({}, state, { item: Object.assign({}, state ? state.item : {}, data.item || {}) });
        
        case ForumGetPageByUser:
            if (state == null || state.category && data.category && state.category._id != data.category._id) {
                return Object.assign({}, state, { category:data.category, userForumPage: data.page });
            } else {
                const userForumPage = Object.assign({}, data.page);
                userForumPage.list = state.userForumPage && state.userForumPage.list ? state.userForumPage.list.slice() : [];
                let _ids = userForumPage.list.map(item => item._id);
                if (data.page && data.page.list && data.page.list.length > 0) {
                    data.page.list.forEach(item => {
                        if (_ids.indexOf(item._id) == -1) {
                            _ids.push(item._id);
                            userForumPage.list.push(item);
                        }
                    });
                }
                return Object.assign({}, state, { userForumPage,category: data.category });
            }
        case ForumGetForumByUser:
            return Object.assign({}, state, { userForum: data.item });
        case ForumMessageUserGetPage:
            if (state == null || state.forum && data.forum && state.forum._id!= data.forum._id) {
                return Object.assign({}, state, { forum: data.forum, userMessagePage: data.page });
            } else {
                const userMessagePage = Object.assign({}, data.page);
                userMessagePage.list = state.userMessagePage && state.userMessagePage.list ? state.userMessagePage.list.slice() : [];
                let _ids = userMessagePage.list.map(item => item._id);
                if (data.page && data.page.list && data.page.list.length > 0) {
                    data.page.list.forEach(item => {
                        if (_ids.indexOf(item._id) == -1) {
                            _ids.push(item._id);
                            userMessagePage.list.push(item);
                        }
                    });
                }
                return Object.assign({}, state, { userMessagePage, forum:data.forum });
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getForumCategories(course, done) {
    return dispatch => {
        const url = '/api/forum/categories';
        T.get(url, { course }, data => {
            if (data.error) {
                T.notify('Lấy danh mục forum bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: ForumGetCategories, categories: data.categories });
            }
        }, error => console.error(error) || T.notify('Lấy danh mục forum bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageForum');
export function getForumPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageForum', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/forum/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách forum bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: ForumGetPage, category: data.category, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách forum bị lỗi!', 'danger'));
    };
}

export function getForum(_id, done) {
    return dispatch => {
        const url = '/api/forum';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy forum bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: ForumGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy forum bị lỗi!', 'danger'));
    };
}

export function createForum(data, done) {
    return dispatch => {
        const url = '/api/forum';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo forum bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                done && done(data);
                T.notify('Tạo forum thành công!', 'success');
                data.item && data.item.category && dispatch(getForumPage( undefined, undefined,{ categoryId: data.item.category, searchText: null, courseId: data.item.course }));
            }
        }, error => console.error(error) || T.notify('Tạo forum bị lỗi!', 'danger'));
    };
}

export function updateForum(_id, changes, condition, done) {
    return dispatch => {
        const url = '/api/forum';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật forum bị lỗi', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                done && done(data);
                T.notify('Cập nhật forum thành công!', 'success');
                data.item && data.item.category && dispatch(getForumPage( undefined, undefined,{ categoryId: data.item.category, searchText: null, filterType: condition.filterType, courseId: data.item.course }));
            }
        }, error => console.error(error) || T.notify('Cập nhật forum bị lỗi', 'danger'));
    };
}

export function deleteForum(_id, condition) {
    return dispatch => {
        const url = '/api/forum';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa forum bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Forum được xóa thành công!', 'error', false, 800);
                data.item && data.item.category && dispatch(getForumPage( undefined, undefined,{ categoryId: data.item.category, searchText: null, filterType: condition.filterType, courseId: data.item.course }));
            }
        }, error => console.error(error) || T.notify('Xóa forum bị lỗi!', 'danger'));
    };
}




// Message -------------------------------------------------------------------------------------------------------
T.initCookiePage('pageForumMessage');
export function getForumMessagePage(_forumId, pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageForum', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/forum/message/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { _forumId, searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: ForumGetItem, item: { page: data.page } });
            }
        }, error => console.error(`GET: ${url}. ${error}`) || T.notify('Lấy danh sách bài viết bị lỗi!', 'danger'));
    };
}

export function createForumMessage(data, done) {
    return dispatch => {
        const url = '/api/forum/message';
        T.post(url, data, data => {
            if (data.error) {
                T.notify('Thêm bài viết bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                done && done(data);
                T.notify('Cập nhật bài viết thành công!', 'success');
                data.item && data.item.forum && dispatch(getForumMessagePage(data.item.forum));
            }
        }, error => console.error(`POST: ${url}. ${error}`) || T.notify('Thêm bài viết bị lỗi!', 'danger'));
    };
}

export function updateForumMessage(_id, changes, done) {
    return dispatch => {
        const url = '/api/forum/message';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật bài viết bị lỗi', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                done && done(data);
                T.notify('Cập nhật bài viết thành công!', 'success');
                data.item && data.item.forum && dispatch(getForumMessagePage(data.item.forum));
            }
        }, error => console.error(`PUT: ${url}. ${error}`) || T.notify('Cập nhật bài viết bị lỗi', 'danger'));
    };
}

export function deleteForumMessage(_id, done) {
    return dispatch => {
        const url = '/api/forum/message';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa bài viết bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                done && done(data);
                T.notify('Xóa bài viết thành công!', 'success');
                data.item && data.item.forum && dispatch(getForumMessagePage(data.item.forum));
            }
        }, error => console.error(`DELETE: ${url}. ${error}`) || T.notify('Xóa bài viết bị lỗi!', 'danger'));
    };
}

// Home--------------------------------------------------------------------

export function getForumHomePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageForum', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/home/forum/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                console.log(data.page);
                done && done(data.page);
                dispatch({ type: ForumGetPageByUser, category: data.category, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách bài viết bị lỗi!', 'danger'));
    };
}

export function getHomeForum(_id, done) {
    return dispatch => {
        const url = '/api/home/forum';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy forum bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: ForumGetForumByUser, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy forum bị lỗi!', 'danger'));
    };
}

export function getHomeForumMessagePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageForumMessage', pageNumber, pageSize);
    console.log({pageCondition});
    return dispatch => {
        const url = '/api/home/forum/message/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition:pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bình luận bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: ForumMessageUserGetPage, page: data.page ,forum:data.forum });
            }
        }, error => console.error(`GET: ${url}. ${error}`) || T.notify('Lấy danh sách bình luận bị lỗi!', 'danger'));
    };
}