import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CourseFeeGetAll = 'CourseFeeGetAll';
const CourseFeeGetPage = 'CourseFeeGetPage';
const CourseFeeGetItem = 'CourseFeeGetItem';

export default function courseTypeReducer(state = {}, data) {
    switch (data.type) {
        case CourseFeeGetAll:
            return Object.assign({}, state, { list: data.list });
        case CourseFeeGetPage:
            return Object.assign({}, state, { page: data.page });

        case CourseFeeGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageCourseFee');
export function getCourseFeePage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage('pageCourseFee', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/course-fee/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách gói học phí bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CourseFeeGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger'));
    };
}

export function getCourseFeeAll(done) {
    return dispatch => {
        const url = '/api/course-fee/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy gói học phí bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: CourseFeeGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy gói học phí bị lỗi', 'danger'));
    };
}

export function getCourseFeeByStudent(condition, done) {
    return dispatch => {
        const url = '/api/course-fee/student';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy gói học phí bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: CourseFeeGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy gói học phí bị lỗi', 'danger'));
    };
}

export function getCourseFee(_id, done) {
    return dispatch => ajaxGetCourseFee(_id, data => {
        if (data.error) {
            T.notify('Lấy gói học phí bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: CourseFeeGetItem, item: data.item });
        }
    });
}

export function createCourseFee(data, done) {
    return dispatch => {
        const url = '/api/course-fee';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo gói học phí bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCourseFeePage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo gói học phí bị lỗi!', 'danger'));
    };
}

export function updateCourseFee(_id, changes, done) {
    return dispatch => {
        const url = '/api/course-fee';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin gói học phí bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: CourseFeeGetItem, item: data.item });
                dispatch(getCourseFeePage());
                T.notify('Cập nhật gói học phí thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật gói học phí bị lỗi!', 'danger'));
    };
}

export function updateCourseFeeDefault(courseFee, done) {
    return dispatch => {
        const url = '/api/course-fee/default';
        T.put(url, { courseFee }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin gói học phí bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: CourseFeeGetItem, item: data.item });
                dispatch(getCourseFeePage());
                T.notify('Cập nhật gói học phí thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật gói học phí bị lỗi!', 'danger'));
    };
}

export function deleteCourseFee(_id) {
    return dispatch => {
        const url = '/api/course-fee';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa gói học phí bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá gói học phí thành công!', 'success');
                dispatch(getCourseFeePage());
            }
        }, error => console.error(error) || T.notify('Xóa gói học phí bị lỗi!', 'danger'));
    };
}

export function getCourseFeeByUser(_id, done) {
    return dispatch => {
        const url = `/course-fee/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy gói học phí bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: CourseFeeGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy gói học phí bị lỗi!', 'danger'));
    };
}

export const ajaxSelectCourseType = {
    ajax: true,
    url: '/api/course-fee/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    }),
    fetchOne: (_id, done) => getCourseFee(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
};

export function ajaxGetCourseFee(_id, done) {
    const url = '/api/course-fee';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy gói học phí bị lỗi!', 'danger'));
}

export const ajaxSelectCourseFeeByCourseType = (courseType,isOfficial=true) => ({
    ajax: true,
    url: '/api/course-fee/all' + (courseType ? `?courseType=${courseType}` : ''),
    data: {},
    processResults: response => ({
        results: response  && response.list ? response.list.filter(item=>item.feeType && item.feeType.official==isOfficial).map(item => ({ id: item._id, text: item.name })) : []
    }),
    fetchOne: (_id, done) => getCourseFee(_id, ({ item }) => done && done({ id: item._id, text: item.name }))
});
