import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const PlanCourseGetAll = 'PlanCourseGetAll';
const PlanCourseGetPage = 'PlanCourseGetPage';

export default function PlanCourseReducer(state = {}, data) {
    switch (data.type) {
        case PlanCourseGetAll:
            return Object.assign({}, state, { list: data.list });
        case PlanCourseGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getPlanCourseAll(searchText, done) {
    return dispatch => {
        const url = '/api/plan-course/all';
        if (typeof searchText == 'function') {
            done = searchText;
            searchText = '';
        }
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả loại hồ sơ học viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: PlanCourseGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả loại hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export const pageName='pagePlanCourse';

T.initCookiePage(pageName, true);
export function getPlanCoursePage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage(pageName, pageNumber, pageSize);
    return dispatch => {
        const url = '/api/plan-course/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hồ sơ học viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: PlanCourseGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export function createPlanCourse(data, done) {
    return dispatch => {
        const url = '/api/plan-course';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo loại hồ sơ học viên bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo loại hồ sơ học viên thanh công!', 'success');
                done && done(data);
                dispatch(getPlanCoursePage());
            }
        }, error => console.error(error) || T.notify('Tạo loại hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export function updatePlanCourse(_id, changes, done) {
    return dispatch => {
        const url = '/api/plan-course';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật loại hồ sơ học viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại hồ sơ học viên thanh công!', 'success');
                dispatch(getPlanCoursePage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật loại hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export function deletePlanCourse(_id) {
    return dispatch => {
        const url = '/api/plan-course';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa loại hồ sơ học viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa loại hồ sơ học viên thành công!', 'error', false, 800);
                dispatch(getPlanCoursePage());
            }
        }, error => console.error(error) || T.notify('Xóa loại hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export const ajaxSelectPlanCourse = T.createAjaxAdapter(
    '/api/plan-course/page/1/20',
    params => ({condition:{searchText:params.term}}),
    response => response && response.page && response.page.list ?
        response.page.list.map(item => ({ id: item._id, text: item.title })) : [],
);

export const ajaxSelectPlanCourseByCourseType = (courseType) => T.createAjaxAdapter(
    '/api/plan-course/page/1/20',
    params => ({condition:{searchText:params.term,courseType:courseType}}),
    response =>{
        return response && response.page && response.page.list ?
        response.page.list.map(item => ({ id: item._id, text: item.title })) : [];
    }, 
);