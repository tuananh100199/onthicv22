import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar } from '../redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { AdminPage } from 'view/component/AdminPage';


import SectionCar from '../sectionCar';

const dataCarType = [{ id: 0, text: 'Tất cả xe' }, { id: 1, text: 'Hết hạn < 1 tháng' }, { id: 3, text: 'Hết hạn < 3 tháng' }, { id: -1, text: 'Đã hết hạn' }];
class CarPage extends AdminPage {
    render() {
        return (
            <SectionCar dataCarType={dataCarType} title={'Ngày hết hạn đăng ký xe tập lái'} isTapLai={true}></SectionCar>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar, getAllLecturer };
export default connect(mapStateToProps, mapActionsToProps)(CarPage);
