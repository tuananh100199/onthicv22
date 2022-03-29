import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CourseGetPage = 'CourseGetPage';
const CourseGetItem = 'CourseGetItem';
const CourseGetUserChat = 'CourseGetUserChat';
const CourseGetPageByUser = 'CourseGetPageByUser';
const CourseUpdateStudentInfoInCourse = 'CourseUpdateStudentInfoInCourse';
const CourseGetCourseByStudent = 'CourseGetCourseByStudent';
const CourseGetLearningProgressPageByAdmin = 'CourseGetLearningProgressPageByAdmin';
const CourseGetAdditionProfilePage = 'CourseGetAdditionProfilePage';

export default function courseReducer(state = {}, data) {
    switch (data.type) {
        case CourseGetPage: {
            const newState = {};
            newState[data.courseTypes] = data.page;
            return Object.assign({}, state, newState);
        }

        case CourseGetItem: {
            return Object.assign({}, state, { item: data.item });
        }

        case CourseGetUserChat: {
            return Object.assign({}, state, { user: data.user });
        }

        case CourseGetLearningProgressPageByAdmin: {
            return Object.assign({}, state, { page: data.page, students: data.students, subjects: data.subjects });
        }

        case CourseGetAdditionProfilePage: {
            return Object.assign({}, state, { profilePage: data.page });
        }
        
        case CourseGetCourseByStudent: {
            return Object.assign({}, state, { student: data.student, item: data.item });
        }

        case CourseUpdateStudentInfoInCourse: {
            const studentId = data.studentId;
            const currentCoursePage = state,
                students = currentCoursePage.item.students ? currentCoursePage.item.students : [],
                teacherGroups = currentCoursePage.item.teacherGroups ? currentCoursePage.item.teacherGroups : [];

            for (let i = 0; i < students.length; i++) {
                if (students[i]._id == studentId) {
                    students.splice(i, 1, data.item);
                    currentCoursePage.item.students = students;

                    teacherGroups.forEach(teacherGroup => {
                        for (let i = 0; i < teacherGroup.student.length; i++) {
                            if (teacherGroup.student[i]._id == studentId) {
                                teacherGroup.student.splice(i, 1, data.item);
                                currentCoursePage.item.teacherGroups = teacherGroups;
                                break;
                            }
                        }
                    });
                    break;
                }
            }
            return Object.assign({}, state, currentCoursePage);
        }

        case CourseGetPageByUser:
            if (state.userCondition != data.condition) {
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
T.initCookiePage('pageCourse');
export function getCoursePage(courseType, pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageCourse', pageNumber, pageSize);
    const courseTypes = (typeof courseType == 'string') ? courseType : 'default';
    return (dispatch) => {
        const url = '/api/course/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { courseType, pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: CourseGetPage, courseTypes, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    };
}

const fetchCourse = (_id, done) => {
    const url = '/api/course';
    T.get(url, { _id }, data => {
        if (data.error) {
            T.notify('Lấy khóa học bị lỗi!', 'danger');
            console.error('GET: ' + url + '.', data.error);
        } else {
            if (data.item) {
                if (data.item.admins) data.item.admins = data.item.admins.sort((a, b) =>
                    (a.firstname + ' ' + a.lastname).toLowerCase() > (b.firstname + ' ' + b.lastname).toLowerCase() ? +1 : -1);
            }
            done && done(data);
        }
    }, error => console.error(error) || T.notify('Lấy khóa học bị lỗi!', 'danger'));
};
export function getCourse(_id, done) {
    return dispatch => {
        fetchCourse(_id, data => {
            dispatch && dispatch({ type: CourseGetItem, item: data.item });
            done && done(data);
        });
    };
}

export function createCourse(data, done) {
    return dispatch => {
        const url = '/api/course';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCoursePage(data.item.courseType));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo khóa học bị lỗi!', 'danger'));
    };
}

export function createDefaultCourse(done) {
    return dispatch => {
        const url = '/api/course/default';
        T.post(url, {}, data => {
            if (data.error) {
                T.notify('Tạo khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật khóa cơ bản thành công!', 'success');
                dispatch(getCoursePage({ isDefault: true }));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo khóa học bị lỗi!', 'danger'));
    };
}

export function updateCourse(_id, changes, done) {
    return dispatch => {
        const url = '/api/course';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khóa học thành công!');
                dispatch({ type: CourseGetItem, item: data.item });
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger'));
    };
}

export function deleteCourse(item) {
    const _id = item._id;
    return dispatch => {
        const url = '/api/course';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getCoursePage(item.courseType));
            }
        }, error => console.error(error) || T.notify('Xóa khóa học bị lỗi!', 'danger'));
    };
}

export function exportScore(_courseId) {
    T.download(T.url(`api/course/export/${_courseId}`));
}

export function exportSubject() {
    T.download(T.url('/api/course/export/subject'));
}

// Course students ----------------------------------------------------------------------------------------------------
export function updateCourseStudents(_courseId, _studentIds, type, done) {
    return dispatch => {
        const url = '/api/course/student';
        T.put(url, { _courseId, _studentIds, type }, data => {
            if (data.error) {
                T.notify('Gán học viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data.item);
                dispatch({ type: CourseGetItem, item: data.item });
            }
        }, error => console.error('PUT: ' + url + '.', error));
    };
}

export function autoAssignStudent(_courseId, done) {
    return dispatch => {
        const url = '/api/course/student/assign-auto';
        T.put(url, { _courseId }, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data.item);
                dispatch({ type: CourseGetItem, item: data.item });
            }
        }, error => console.error('PUT: ' + url + '.', error));
    };
}

// Course teacherGroups -----------------------------------------------------------------------------------------------
export function updateCourseTeacherGroup(_courseId, _teacherId, type, done) {
    return dispatch => {
        const url = '/api/course/teacher-group/teacher';
        T.put(url, { _courseId, _teacherId, type }, data => {
            if (data.error) {
                T.notify('Gán giáo viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data.item);
                dispatch({ type: CourseGetItem, item: data.item });
            }
        }, error => console.error('PUT: ' + url + '.', error));
    };
}

export function updateCourseTeacherGroupStudent(_courseId, _teacherId, _studentIds, type, done) {
    return dispatch => {
        const url = '/api/course/teacher-group/student';
        T.put(url, { _courseId, _teacherId, _studentIds, type }, data => {
            if (data.error) {
                T.notify('Gán học viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data.item);
                dispatch({ type: CourseGetItem, item: data.item });
            }
        }, error => console.error('PUT: ' + url + '.', error));
    };
}

export function updateAutoCourseTeacherGroupStudent(_courseId, teacherGroupsUpdate, type, done) {
    return dispatch => {
        const url = '/api/course/teacher-group/student/auto';
        T.put(url, { _courseId, teacherGroupsUpdate, type }, data => {
            if (data.error) {
                T.notify('Gán học viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data.item);
                dispatch({ type: CourseGetItem, item: data.item });
            }
        }, error => console.error('PUT: ' + url + '.', error));
    };
}

export function updateStudentInfoInCourse(studentId, item) {
    return { type: CourseUpdateStudentInfoInCourse, studentId, item };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getCoursePageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = `/home/course/page/${pageNumber}/${pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CourseGetPageByUser, page: data.page });
                done && done();
            }
        }, error => console.error(error) || T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    };
}

export function getCourseByUser(_id, done) {
    return () => {
        const url = '/home/course';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy khóa học bị lỗi!', 'danger'));
    };
}

export function getCourseFeed(done) {
    return () => {
        const url = '/home/course/page/1/' + T.courseFeedPageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.list);
            }
        }, error => console.error(error) || T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    };
}

//Get Course Of User --------------------------------------------------------------------------------------------------
export function getUserCourse(done) {
    return () => {
        const url = '/api/course/student/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khóa học của người dùng bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy thông tin khóa học của người dùng bị lỗi!', 'danger'));
    };
}

export function getCourseByStudent(_id, done) {
    return dispatch => {
        const url = '/api/course/student';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: CourseGetCourseByStudent, item: data.item, student: data.student });
            }
        }, error => console.error(error) || T.notify('Lấy khóa học bị lỗi!', 'danger'));
    };
}

T.initCookiePage('adminLearningProgress');
export function getLearningProgressPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminLearningProgress', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/course/learning-progress/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy tiến độ học tập bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: CourseGetLearningProgressPageByAdmin, page: data.page, students: data.students, subjects: data.subjects });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy tiến độ học tập bị lỗi!', 'danger'));
    };
}

// Additional Profile ----------------------------------------------------------------------------------------------------
T.initCookiePage('additionalProfilePage');
export function getAdditionalProfilePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('additionalProfilePage', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/course/additional-profile/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy hồ sơ học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: CourseGetAdditionProfilePage, page: data.page });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export function updateAdditionalProfile(_id,changes, done) {
    return () => {
        const url = '/api/course/additional-profile';
        T.put(url, { _id,changes }, data => {
            if (data.error) {
                T.notify('Cập nhật hồ sơ học viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật hồ sơ học viên thành công', 'success');
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Cập nhật hồ sơ học viên bị lỗi!', 'danger'));
    };
}
// Import Excel ----------------------------------------------------------------------------------------------------
export function importScore(score, courseId, done) {
    return () => {
        const url = '/api/course/import-score';
        T.put(url, { score, courseId }, data => {
            if (data.error) {
                T.notify('Import điểm thi tốt nghiệp bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Lưu điểm thi tốt nghiệp thành công', 'success');
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Import điểm thi tốt nghiệp bị lỗi!', 'danger'));
    };
}



export function importFinalScore(scores, course, done) {
    return () => {
        const url = '/api/course/import-final-score';
        T.put(url, { scores, course }, data => {
            if (data.error) {
                T.notify('Lưu điểm thi hết môn bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Lưu điểm thi hết môn thành công!', 'success');
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lưu điểm thi hết môn bị lỗi!', 'danger'));
    };
}


// Export to Excel ----------------------------------------------------------------------------------------------------
export function exportStudentInfoToExcel(_courseId) {
    T.download(T.url(`/api/course/student/export/${_courseId}`));
}
export function exportTeacherAndStudentToExcel(_courseId) {
    T.download(T.url(`/api/course/teacher-student/export/${_courseId}`));
}
export function exportLearningProgressToExcel(_courseId, filter) {
    T.download(T.url(`/api/course/learning-progress/export/${_courseId}/${filter}`));
}

export function exportFinalExam(_subjectId, _studentId, done) {
    return () => {
        const url = `/api/course/final-exam/export/${_subjectId}/${_studentId}`;
        T.get(url, data => {
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

export function exportPhuLuc3B(listId, done) {
    return () => {
        const url = '/api/course/student-3b/export';
        T.get(url, { listId }, data => {
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

export function exportPhuLuc11B(listId, done) {
    return () => {
        const url = '/api/course/student-11b/export';
        T.get(url, { listId }, data => {
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

export function exportListStudentGraduation(_courseId) {
    T.download(T.url(`/api/course/student-graduation/export/${_courseId}`));
}

// Ajax Selections ----------------------------------------------------------------------------------------------------
export const ajaxSelectCourse = {
    ajax: false,
    url: '/api/course/page/1/20',
    data: {},
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(course => ({ id: course._id, text: course.name + (course.courseType ? ` (${course.courseType.title})` : '') })) : [] }),
    fetchOne: (_id, done) => fetchCourse(_id, ({ item }) => done && done({ id: item._id, text: item.name + (item.courseType ? ` (${item.courseType.title})` : '') }))
};

export const ajaxSelectCourseByCourseType = (courseType) => ({
    ajax: false,
    url: '/api/course/page/1/20' + (courseType ? `?courseType=${courseType}` : ''),
    data: {},
    processResults: response => {
        const results = [{ id: 0, text: 'Tất cả khóa học' }];
        response && response.page && response.page.list && response.page.list.forEach(course => results.push({ id: course._id, text: course.name + (course.courseType ? ` (${course.courseType.title})` : '') }));
        return ({ results });
    },
    fetchOne: (_id, done) => fetchCourse(_id, ({ item }) => done && done({ id: item._id, text: item.name + (item.courseType ? ` (${item.courseType.title})` : '') }))
});

