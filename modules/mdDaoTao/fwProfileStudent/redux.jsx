import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ProfileStudentGetPage = 'ProfileStudentGetPage';

export default function profileStudentReducer(state = {}, data) {
    switch (data.type) {
        case ProfileStudentGetPage:
            return Object.assign({}, state, { page: data.page });

        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initCookiePage('pageProfileStudent');
export function getProfileStudentPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageProfileStudent', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/profile-student/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hồ sơ học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: ProfileStudentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách hồ sơ học viên bị lỗi!', 'danger'));
    };
}
export function updateProfileStudent(_id, changes, done) {
    return () => {
        const url = '/api/profile-student';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật hồ sơ học viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hồ sơ học viên thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật hồ sơ học viên bị lỗi!', 'danger'));
    };
}