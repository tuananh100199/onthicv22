import T from 'view/js/common';

const CarGetAll = 'CarGetAll';
const CarChange = 'CarChange';
const CarGetItem = 'CarGetItem';
const CarGetPage = 'CarGetPage';

export default function CarReducer(state = [], data) {
    switch (data.type) {
        case CarGetAll:
            return data.items;

        case CarGetPage:
            return Object.assign({}, state, { page: data.page });

        case CarGetItem:
            return Object.assign({}, state, { item: data.item });

        case CarChange: {
            let updateItemState = state.slice();
            for (let i = 0; i < updateItemState.length; i++) {
                if (updateItemState[i]._id == data.item._id) {
                    updateItemState[i] = data.item;
                    break;
                }
            }
            return updateItemState;
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getCarPage(pageNumber, pageSize, pageCondition, filter,sort, done) {
    if(typeof sort=='function'){
        done=sort;
        sort=undefined;
    }
    else if(typeof filter=='function'){
        done=filter;
        filter=undefined;
    }
    const page = T.updatePage('adminCar', pageNumber, pageSize, pageCondition, filter, sort);
    return dispatch => {
        const url = `/api/car/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition,filter:page.filter,sort:page.sort }, data => {
            if (data.error) {
                T.notify('Lấy danh sách xe bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: CarGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách xe bị lỗi!', 'danger'));
    };
}

export function getAllCars(condition, done) {
    return dispatch => {
        const url = '/api/car/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy tất cả xe bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: CarGetAll, items: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả xe bị lỗi!', 'danger'));
    };
}

export function getAvaiableLecturers(condition, done) {
    return () => {
        const url = '/api/car/avaiable-lecturer';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy giáo viên chưa có xe bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
            }
        }, error => console.error(error) || T.notify('Lấy giáo viên chưa có xe bị lỗi!', 'danger'));
    };
}

export function getCar(_id, done) {
    return dispatch => {
        const url = '/api/car';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin xe bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy thông tin xe bị lỗi!', 'danger'));
    };
}

export function getCarOfLecturer(condition, done) {
    return () => {
        const url = '/api/car/lecturer';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thông tin xe bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                // dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy thông tin xe bị lỗi!', 'danger'));
    };
}

export function createCar(data, done) {
    return dispatch => {
        const url = '/api/car';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo xe bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật thông tin xe thành công!', 'success');
                dispatch(getCarPage(undefined,undefined,{status: 'dangSuDung'}));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo xe bị lỗi!', 'danger'));
    };
}

export function updateCar(_id, changes, done) {
    return dispatch => {
        const url = '/api/car';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin xe bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin xe thành công!', 'success');
                dispatch(getCarPage(undefined,undefined,{status: 'dangSuDung'}));
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin xe bị lỗi!', 'danger'));
    };
}

export function deleteCar(item) {
    return dispatch => {
        const url = '/api/car';
        T.delete(url, { item }, data => {
            if (data.error) {
                T.notify('Xóa thông tin xe bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xóa thông tin xe thành công!', 'success', false, 800);
                dispatch(getCarPage(undefined,undefined,{status: 'dangSuDung'}));
            }
        }, error => console.error(error) || T.notify('Xóa thông tin xe bị lỗi!', 'danger'));
    };
}

export function liquidateCar(item) {
    return dispatch => {
        const url = '/api/car/liquidate';
        T.put(url, { item }, data => {
            if (data.error) {
                T.notify('Thanh lý xe bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Thanh lý xe thành công!', 'success', false, 800);
                dispatch(getCarPage(undefined,undefined,{status: 'dangSuDung'}));
            }
        }, error => console.error(error) || T.notify('Thanh lý xe bị lỗi!', 'danger'));
    };
}

export function addCarFuel(_carId, data, done) {
    return dispatch => {
        const url = '/api/car/fuel';
        T.post(url, { _carId, data }, data => {
            if (data.error) {
                T.notify('Thêm data tiếp nhiên liệu bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function addCarRepair(_carId, data, done) {
    return dispatch => {
        const url = '/api/car/repair';
        T.post(url, { _carId, data }, data => {
            if (data.error) {
                T.notify('Thêm lịch sử sửa chữa bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function addCarCourse(_carId, data, done) {
    return dispatch => {
        const url = '/api/car/course';
        T.post(url, { _carId, data }, data => {
            if (data.error) {
                T.notify('Thay đổi lịch sử xe đi khóa bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function addCarRegistration(_carId, data, done) {
    return dispatch => {
        const url = '/api/car/registration';
        T.post(url, { _carId, data }, data => {
            if (data.error) {
                T.notify('Thêm lịch sử đăng kiểm bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function addCarInsurance(_carId, data, done) {
    return dispatch => {
        const url = '/api/car/insurance';
        T.post(url, { _carId, data }, data => {
            if (data.error) {
                T.notify('Thêm lịch sử đóng bảo hiểm bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function addCarPractice(_carId, data, done) {
    return dispatch => {
        const url = '/api/car/practice';
        T.post(url, { _carId, data }, data => {
            if (data.error) {
                T.notify('Thêm lịch sử đăng ký bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: CarGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function deleteCarElement(_carId, data, done) {
    return dispatch => {
        const url = '/api/car/element';
        T.delete(url, { _carId, data }, data => {
            if (data.error) {
                T.notify('Xóa lịch sử xe bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xóa lịch sử xe thành công!', 'success');
                dispatch({ type: CarGetItem, item: data.item });
                done && done();
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}


export function importCar(cars, division, courseType, done) {
    return dispatch => {
        const url = '/api/car/import';
        T.post(url, { cars, division, courseType }, data => {
            if (data.error) {
                T.notify('Tạo xe bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo xe thành công!', 'success');
                dispatch(getCarPage(undefined,undefined,{status: 'dangSuDung'}));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo xe bị lỗi!', 'danger'));
    };
}

// Ajax ---------------------------------------------------------------------------------------------------------------
export const ajaxSelectAvaiableLecturer = (currentLecturer) => T.createAjaxAdapter(
    '/api/car/avaiable-lecturer',
    params => ({ condition: { searchText: params.term } }),
    response => {
        let list =  [];
        list = response && response.list ?
        response.list.map(user => ({ id: user._id, text: user.lastname + ' ' + user.firstname })) : [];
        currentLecturer ? list.push({ id: currentLecturer._id, text: currentLecturer.lastname + ' ' + currentLecturer.firstname }) : null;
        list.push({ id: '0', text: 'Trống' });
        return list;    
    },
);

// Export to Excel ----------------------------------------------------------------------------------------------------
export function exportInfoCar(filterKey) {
    if (filterKey == undefined) filterKey = 1;
    T.download(T.url(`/api/car/info/export/${filterKey}`));
}

export function exportExpiredCar(fileType, carType) {
    const filterType = (carType == undefined ? 0 : carType);
    T.download(T.url(`/api/car/expired/export/${fileType}/${filterType}`));
}

export function exportListRepairCar(carType) {
    const filterType = (carType == undefined ? 'tatCa' : carType);
    T.download(T.url(`/api/car/list-repair/export/${filterType}`));
}

export function exportFuelCar(_carId) {
    T.download(T.url(`/api/car/fuel/export/${_carId}`));
}

export function exportRepairCar(_carId) {
    T.download(T.url(`/api/car/repair/export/${_carId}`));
}

export function exportPracticeCar(_carId) {
    T.download(T.url(`/api/car/practice/export/${_carId}`));
}

export function exportRegistrationCar(_carId) {
    T.download(T.url(`/api/car/registration/export/${_carId}`));
}
export function exportInsuranceCar(_carId) {
    T.download(T.url(`/api/car/insurance/export/${_carId}`));
}
export function exportCourseCar(_carId) {
    T.download(T.url(`/api/car/course/export/${_carId}`));
}
export function exportCarCalendar(_carId) {
    T.download(T.url(`/api/car/calendar/export/${_carId}`));
}

