import T from '../../view/js/common';
T.initCookiePage('pageCourse');
// T.initCookiePage('pageDraftCourse');

// Reducer ------------------------------------------------------------------------------------------------------------
const CourseGetCourseInPage = 'Course:GetCourseInPage';
// const CourseGetDraftCourseInPage = 'Course:GetDraftCourseInPage';
const CourseGetCourse = 'Course:GetCourse';
// const CourseGetDraftCourse = 'Course:GetDraftCourse';

const CourseGetCourseInPageByUser = 'Course:GetCourseInPageByUser';
const CourseGetCourseByUser = 'Course:GetCourseByUser';
const CourseGetCourseFeed = 'Course:GetCourseFeed';

export default function courseReducer(state = null, data) {
    switch (data.type) {
        case CourseGetCourseInPage:
            return Object.assign({}, state, { page: data.page });
        // case CourseGetDraftCourseInPage:
        //     return Object.assign({}, state, { draft: data.page });
        case CourseGetCourse:
            return Object.assign({}, state, { Course: data.item, categories: data.categories});
        // case CourseGetDraftCourse:
        //     return Object.assign({}, state, { draftCourse: data.item, categories: data.categories });

        case CourseGetCourseInPageByUser:
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

        case CourseGetCourseByUser:
            return Object.assign({}, state, { userCourse: data.item });

        case CourseGetCourseFeed:
            return Object.assign({}, state, { courseFeed: data.list });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getCourseInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageCourse', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/course/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CourseGetCourseInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}

// export function getDraftCourseInPage(pageNumber, pageSize, done) {
//     const page = T.updatePage('pageDraftCourse', pageNumber, pageSize);
//     return (dispatch) => {
//         const url = '/api/draft-course/page/' + page.pageNumber + '/' + page.pageSize;
//         T.get(url, data => {
//             if (data.error) {
//                 T.notify('Lấy danh sách bản nháp khóa học bị lỗi!', 'danger');
//                 console.error('GET: ' + url + '.', data.error);
//             } else {
//                 if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
//                 dispatch({ type: CourseGetDraftCourseInPage, page: data.page });
//             }
//         }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
//     }
// }
// export function draftToCourse(draftCourseId, done) {
//     return dispatch => {
//         const url = '/api/draft-course/toCourse/' + draftCourseId;
//         T.get(url, data => {
//             if (data.error) {
//                 T.notify('Thao tác bị lỗi!', 'danger');
//                 console.error('GET: ' + url + '.', data.error);
//             } else {
//                 T.notify('Bản nháp đã được duyệt thành công!', 'info');
//                 dispatch(getDraftCourseInPage());
//                 dispatch(getCourseInPage());
//             }
//         }, error => T.notify('Thao tác bị lỗi bị lỗi!', 'danger'));
//     }
// }

export function createCourse(done) {
    return dispatch => {
        const url = '/api/course/default';
        T.post(url, data => {
            // console.log('data',data)
            if (data.error) {
                T.notify('Tạo khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCourseInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo khóa học bị lỗi!', 'danger'));
    }
}
// export function createDraftCourseDefault(done) {
//     return (dispatch, getState) => {
//         const state = getState();
//         const docData = {
//             categories: [],
//             link: '',
//             active: false,
//             abstract: JSON.stringify({ vi: '', en: '' }),
//             content: JSON.stringify({ vi: '', en: '' }),
//         }, passValue = {
//             title: '{\"vi\":\"Bản nháp\",\"en\":\"Draft\"}',
//             editorId: state.system.user._id,
//             documentType: 'course',
//             documentJson: JSON.stringify(docData),
//             editorName: state.system.user.firstname,
//         }
//         const url = '/api/course/draft';
//         T.post(url, passValue, data => {
//             if (data.error) {
//                 T.notify('Tạo bản nháp khóa học bị lỗi!', 'danger');
//                 console.error('PUT: ' + url + '.', data.error);
//                 done && done(data.error);
//             } else {
//                 T.notify('Bản nháp khóa học đã tạo thành công!', 'info');
//                 dispatch(getDraftCourseInPage());
//                 done && done(data);
//             }
//         })
//     }
// }
// export function createDraftCourse(result, done) {
//     return dispatch => {
//         const url = '/api/course/draft';
//         T.post(url, result, data => {
//             if (data.error) {
//                 T.notify('Tạo bản nháp khóa học bị lỗi!', 'danger');
//                 console.error('PUT: ' + url + '.', data.error);
//                 done && done(data.error);
//             } else {
//                 T.notify('Bản nháp khóa học đã tạo thành công!', 'info');
//                 dispatch(getDraftCourseInPage());
//                 done && done();
//             }
//             if (done) done(data);
//         })
//     }
// }

export function updateCourse(_id, changes, done) {
    return dispatch => {
        const url = '/api/course';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khóa học thành công!', 'info');
                dispatch(getCourseInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger'));
    }
}
// export function updateDraftCourse(_id, changes, done) {
//     return dispatch => {
//         const url = '/api/draft-course';
//         T.put(url, { _id, changes }, data => {
//             if (data.error) {
//                 T.notify('Cập nhật thông tin bản nháp khóa học bị lỗi!', 'danger');
//                 console.error('PUT: ' + url + '.', data.error);
//                 done && done(data.error);
//             } else {
//                 T.notify('Cập nhật thông tin bản nháp khóa học thành công!', 'info');
//                 dispatch(getDraftCourseInPage());
//                 done && done();
//             }
//         }, () => T.notify('Cập nhật thông tin bản nháp khóa học bị lỗi!', 'danger'));
//     }
// }

export function swapCourse(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/course/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự khóa học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự khóa học thành công!', 'info');
                dispatch(getCourseInPage());
            }
        }, error => T.notify('Thay đổi thứ tự khóa học bị lỗi!', 'danger'));
    }
}

export function deleteCourse(_id) {
    return dispatch => {
        const url = '/api/course';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getCourseInPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}
// export function deleteDraftCourse(_id) {
//     return dispatch => {
//         const url = '/api/draft-course';
//         T.delete(url, { _id }, data => {
//             if (data.error) {
//                 T.notify('Xóa mẫu khóa học bị lỗi!', 'danger');
//                 console.error('DELETE: ' + url + '.', data.error);
//             } else {
//                 T.alert('Người dùng được xóa thành công!', 'error', false, 800);
//                 dispatch(getDraftCourseInPage());
//             }
//         }, error => T.notify('Xóa bản nháp bị lỗi!', 'danger'));
//     }
// }

export function getCourse(_id, done) {
    return (dispatch, getState) => {
        const url = '/api/course/item/' + _id;
        const state = getState();
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } 
            else {
                // const url2 = '/api/draftcourse/' + state.system.user._id;
                // T.get(url2, draft => {
                //     if (done) done(data);
                //     dispatch({ type: CourseGetCourse, item: data.item, categories: data.categories, docDraftUser: draft });
                // }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'))
                // if (done) done(data);
            }
        }, error => done({ error }));
    }
}
// export function getDraftCourse(_id, done) {
//     return dispatch => {
//         const url = '/api/draft-course/item/' + _id;
//         T.get(url, data => {
//             if (data.error) {
//                 T.notify('Lấy khóa học bị lỗi!', 'danger');
//                 console.error('GET: ' + url + '.', data.error);
//             } else {
//                 if (done) done(data);
//                 dispatch({ type: CourseGetDraftCourse, item: data.item, categories: data.categories });
//             }
//         }, error => done({ error }));
//     }
// }

// Actions (user) -----------------------------------------------------------------------------------------------------
const texts = {
    vi: {
        getCourseInPageByUserError: 'Lấy danh sách khóa học bị lỗi!',
        getCourseByUserError: 'Lấy khóa học bị lỗi!',
        getCourseFeedError: 'Lấy new feed bị lỗi!',
    },
    en: {
        getCourseInPageByUserError: 'Errors when get Course list!',
        getCourseByUserError: 'Errors when get one Course!',
        getCourseFeedError: 'Errors when get Course feed!',
    }
};
const language = T.language(texts);

export function getCourseInPageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = 'course/page/' + pageNumber + '/' + pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getCourseInPageByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CourseGetCourseInPageByUser, page: data.page });
                done && done()
            }
        }, error => T.notify(language.getCourseInPageByUserError, 'danger'));
    }
}

export function getCourseByUser(courseId, courseLink, done) {
    return dispatch => {
        const url = courseId ? 'course/item/id/' + courseId : 'course/item/link/' + courseLink;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getCourseByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CourseGetCourseByUser, item: data.item });
                done && done(data);
            }
        }, error => T.notify(language.getCourseByUserError, 'danger'));
    }
}

export function getCourseFeed(done) {
    return dispatch => {
        const url = 'course/page/1/' + T.courseFeedPageSize
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getCourseFeedError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.list);
                dispatch({ type: CourseGetCourseFeed, list: data.page.list });
            }
        }, error => T.notify(language.getCourseFeedError, 'danger'));
    }
}

export function checkLink(_id, link) {
    return dispatch => {
        const url = 'course/item/check-link';
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