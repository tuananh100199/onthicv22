import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StudentGetPage = 'StudentGetPage';
const StudentUpdate = 'StudentUpdate';
const StudentGetCourse = 'StudentGetCourse';
const PreStudentGetPage = 'PreStudentGetPage';
const PreStudentGetAll = 'PreStudentGetAll';
const StudentGetItem = 'StudentGetItem';

export default function studentReducer(state = {}, data) {
    switch (data.type) {
        case PreStudentGetAll:
            return Object.assign({}, state, { list: data.list });

        case StudentGetPage:
            return Object.assign({}, state, { page: data.page });

        case StudentGetCourse:
            return Object.assign({}, state, {
                courseList: {
                    all: data.all,
                    teachers: data.teachers,
                }
            });

        case StudentUpdate: {
            let updatedPage = Object.assign({}, state.page),
                updatedItem = data.item;
            if (updatedPage.list) {
                for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                    if (updatedPage.list[i]._id == updatedItem._id) {
                        updatedPage.list.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return Object.assign({}, state, { page: updatedPage });
        }

        case PreStudentGetPage:
            return Object.assign({}, state, { prePage: data.page });

        case StudentGetItem:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Student Actions ----------------------------------------------------------------------------------------------------
T.initCookiePage('adminStudent');
export function getStudentPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminStudent', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/student/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: StudentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách học viên bị lỗi!', 'danger'));
    };
}

export function getDebtStudentPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminStudent', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/student/debt/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: StudentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách học viên bị lỗi!', 'danger'));
    };
}

export function updateStudent(_id, changes, done) {
    return dispatch => {
        const url = '/api/student';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin học viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                !(changes.tongThoiGianChat || changes.tongThoiGianForum || changes.tongThoiGianTaiLieu || changes.cart) && T.notify('Cập nhật thông tin học viên thành công!', 'success');
                done && done(data.item);
                dispatch({ type: StudentUpdate, item: data.item });
                // dispatch(getStudentPage());
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật thông tin học viên bị lỗi!', 'danger'));
    };
}

export function addStudentPayment(_studentId, payment,courseFee, fee, done) {
    return dispatch => {
        const url = '/api/student/payment';
        T.post(url, { _studentId, payment, courseFee, fee }, data => {
            if (data.error) {
                T.notify('Thêm thanh toán bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: StudentGetItem, item:  data.item});
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function addStudentPaymentExtra(_studentId, done) {
    return dispatch => {
        const url = '/api/student/payment-extra';
        T.post(url, { _studentId }, data => {
            if (data.error) {
                T.notify('Thêm thanh toán bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: StudentGetItem, item:  data.item});
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function deleteStudent(_id) {
    return dispatch => {
        const url = '/api/student';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa học viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Học viên được xóa thành công!', 'error', false, 800);
                dispatch(getStudentPage());
            }
        }, error => console.error(error) || T.notify('Xóa học viên bị lỗi!', 'danger'));
    };
}

export function getStudent(_id, done) {
    return dispatch => {
        const url = '/api/student';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                // T.alert('Lấy thông tin học viên thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch({ type: StudentGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy thông tin học viên bị lỗi', 'danger'));
    };
}

export function getStudentScore(courseId, done) {
    return dispatch => {
        const url = '/api/student/score';
        T.get(url, { courseId }, data => {
            if (data.error) {
                T.notify('Lấy thông tin học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                // T.alert('Lấy thông tin học viên thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch({ type: StudentUpdate, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy thông tin học viên bị lỗi', 'danger'));
    };
}

export function getStudentSubjectScore(courseId, done) {
    return dispatch => {
        const url = '/api/student/subject/score';
        T.get(url, { courseId }, data => {
            if (data.error) {
                T.notify('Lấy thông tin học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                // T.alert('Lấy thông tin học viên thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch({ type: StudentUpdate, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy thông tin học viên bị lỗi', 'danger'));
    };
}

export function exportExamStudent(_courseId, filter) {
    T.download(T.url(`/api/student/export/${_courseId}/${filter}`));
}

// Active Course Actions ------------------------------------------------------------------------------------------------
export function getActiveCourseStudentPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminStudent', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/student/active-course/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: StudentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách học viên bị lỗi!', 'danger'));
    };
}

export function updateActiveCourse(_id, type, done) {
    return () => {
        const url = '/api/student/active-course';
        T.put(url, { _id, type }, data => {
            if (data.error) {
                T.notify('Kích hoạt khóa học bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Kích hoạt khóa học thành công!', 'success');
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Kích hoạt khóa học bị lỗi!', 'danger'));
    };
}



// Pre-student Actions ------------------------------------------------------------------------------------------------
T.initCookiePage('adminPreStudent');
export function getPreStudentPage(pageNumber, pageSize, pageCondition, sort, done) {
    const page = T.updatePage('adminPreStudent', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/pre-student/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, sort }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: PreStudentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách học viên bị lỗi!', 'danger'));
    };
}

export function getPreStudentByCourseTypePage(pageNumber, pageSize, pageCondition, sort,courseType, done) {
    const page = T.updatePage('adminPreStudent', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/pre-student/course/page/${page.pageNumber}/${page.pageSize}/${courseType}`;
        T.get(url, { condition: pageCondition, sort }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: PreStudentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách học viên bị lỗi!', 'danger'));
    };
}

export function createPreStudent(student, done) {
    return dispatch => {
        const url = '/api/pre-student';
        T.post(url, { student }, data => {
            if (data.error) {
                T.notify('Tạo học viên bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getPreStudentPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo học viên bị lỗi!', 'danger'));
    };
}

export function updatePreStudent(_id, changes, done) {
    return dispatch => {
        const url = '/api/pre-student';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin học viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin học viên thành công!', 'info');
                dispatch(getPreStudentPage());
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật thông tin học viên bị lỗi!', 'danger'));
    };
}

export function deletePreStudent(_id) {
    return dispatch => {
        const url = '/api/pre-student';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa học viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Học viên được xóa thành công!', 'error', false, 800);
                dispatch(getPreStudentPage());
            }
        }, error => console.error(error) || T.notify('Xóa học viên bị lỗi!', 'danger'));
    };
}

export function importPreStudent(students, division, courseType,courseFee,discount,coursePayment, done) {
    return dispatch => {
        const url = '/api/pre-student/import';
        T.post(url, { students, division, courseType,courseFee,discount,coursePayment }, data => {
            if (data.error) {
                T.notify('Tạo học viên bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo học viên thành công!', 'success');
                dispatch(getPreStudentPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo học viên bị lỗi!', 'danger'));
    };
}

export function importFailPassStudent(student, type, done) {
    return () => {
        const url = '/api/student/import-fail-pass';
        T.put(url, { student, type }, data => {
            if (data.error) {
                T.notify('Lưu danh sách học viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Lưu danh sách học viên thành công!', 'success');
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lưu danh sách học viên bị lỗi!', 'danger'));
    };
}

export function exportPhieuThu(userId, billId, feeText, done) {
    return () => {
        const url = '/api/student/phieu-thu/export';
        T.get(url, { userId, billId, feeText }, data => {
            if (data.error) {
                T.notify('Xuất file word bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                T.notify('Xuất file word thành công!', 'success');
            }
        }, error => console.error(error) || T.notify('Xuất file word bị lỗi!', 'danger'));
    };
}

export function downloadFailPassStudentFile() {
    T.download(T.url('/api/student/download-fail-pass'));
}

// User API -----------------------------------------------------------------------------------------------------------
export function getStudentByUser(condition, done) {
    return () => {
        const url = '/api/student/user';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thông tin học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy thông tin học viên bị lỗi', 'danger'));
    };
}

// Ajax Selections ----------------------------------------------------------------------------------------------------
export const ajaxSelectPreStudent = T.createAjaxAdapter(
    '/api/pre-student/page/1/20',
    response => response && response.page && response.page.list ?
        response.page.list.map(student => ({ id: student._id, text: `${student.lastname} ${student.firstname}` + (student.identityCard ? ` (${student.identityCard})` : '') })) : [],
);

export const ajaxSelectStudentByCourse = (course) => ({
    ajax: false,
    url: '/api/student/page/1/20' + (course ? `?course=${course}` : ''),
    data: {},
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(student => ({ id: student._id, text: `${student.lastname} ${student.firstname}` + (student.identityCard ? ` (${student.identityCard})` : '') })) : [] }),
    fetchOne: (_id, done) => (getStudent(_id, student => done && done({ id: student._id, text: `${student.lastname} ${student.firstname}` + (student.identityCard ? ` (${student.identityCard})` : '') })))()
});

export const ajaxSelectStudentOfLecturer = (courseId, lecturerId) => ({
    ajax: true,
    url: '/api/course/lecturer/student',
    data: params => ({ condition: { courseId, lecturerId, title: params.term } }),
    processResults: response => ({ results: response && response.list ? response.list.map(student => ({ id: student._id, text: `${student.lastname} ${student.firstname}` })) : [] }),
    fetchOne: (_id, done) => (getStudent(_id, student => done && done({ id: student._id, text: `${student.lastname} ${student.firstname}` })))()
});