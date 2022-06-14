import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const AnnouncementGetAll = 'AnnouncementGetAll';
const AnnouncementGetPage = 'AnnouncementGetPage';
const AnnouncementGetItem = 'AnnouncementGetItem';
const AnnouncementGetPageByUser = 'AnnouncementGetPageByUser';
const AnnouncementUserGetItem = 'AnnouncementUserGetItem';

export default function AnnouncementReducer(state = {}, data) {
    switch (data.type) {
        case AnnouncementGetAll:
            return Object.assign({}, state, { list: data.list });

        case AnnouncementGetPage:
            return Object.assign({}, state, { page: data.page });
        case AnnouncementGetItem:
            return Object.assign({}, state, { item: data.item });
        case AnnouncementGetPageByUser:
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
        case AnnouncementUserGetItem:
            return Object.assign({}, state, { userNews: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageAnnouncement', true);
export function getAnnouncementPage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage('pageAnnouncement', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/announcement/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page);
                dispatch({ type: AnnouncementGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

export function getAnnouncementAll(done) {
    return dispatch => {
        const url = '/api/announcement/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy câu hỏi thường gặp bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: AnnouncementGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy câu hỏi thường gặp bị lỗi', 'danger'));
    };
}

export function createAnnouncement(data, done) {
    return dispatch => {
        const url = '/api/announcement';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo câu hỏi thường gặp thanh công!', 'success');
                dispatch(getAnnouncementPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

export function getAnnouncement(_id, done) {
    return dispatch => ajaxGetAnnouncement(_id, data => {
        if (data.error) {
            T.notify('Lấy câu hỏi thường gặp bị lỗi!', 'danger');
            console.error('GET: getAnnouncement.', data.error);
        } else {
            done && done(data);
            dispatch({ type: AnnouncementGetItem, item: data.item });
        }
    });
}

export function updateAnnouncement(_id, changes, done) {
    return dispatch => {
        const url = '/api/announcement';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật câu hỏi thường gặp thành công!', 'success');
                dispatch(getAnnouncementPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

export function swapAnnouncement(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/announcement/swap';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự tin tức thành công!', 'info');
                dispatch(getAnnouncementPage());
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger'));
    };
}

export function deleteAnnouncement(_id) {
    return dispatch => {
        const url = '/api/announcement';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa câu hỏi thường gặp thành công!', 'error', false, 800);
                dispatch(getAnnouncementPage());
            }
        }, error => console.error(error) || T.notify('Xóa câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

export function checkLink(_id, link, done) {
    return () => {
        const url = '/api/announcement/check-link';
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
export function getAnnouncementPageByUser(pageNumber, pageSize,condition , done) {
    return dispatch => {
        const url = '/api/home/announcement/page/' + pageNumber + '/' + pageSize;
        T.get(url,{ condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi thường gặp bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: AnnouncementGetPageByUser, page: data.page });
                done && done();
            }
        }, error => console.error(error) || T.notify('Lấy danh sách câu hỏi thường gặp bị lỗi!', 'danger'));
    };
}

export function getAnnouncementByUser(_id, link, done) {
    return dispatch => {
        const url = '/home/announcement/item';
        T.get(url, { _id, link }, data => {
            if (data.error) {
                T.notify('Lấy thông báo bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: AnnouncementUserGetItem, item: data.item });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy thông báo bị lỗi!', 'danger'));
    };
}


export const ajaxSelectAnnouncement = {
    ajax: true,
    url: '/api/announcement/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title, isExtra: item.isExtra })) : []
    }),
    fetchOne: (_id, done) => getAnnouncement(_id, ({ item }) => done && done({ id: item._id, text: item.title, isExtra: item.isExtra }))
};

export function ajaxGetAnnouncement(_id, done) {
    const url = '/api/announcement';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy câu hỏi thường gặp bị lỗi!', 'danger'));
}