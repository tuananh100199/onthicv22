import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import SectionCar from '../sectionCar';

const dataCarType = [{ id: 0, text: 'Tất cả xe' }, { id: 1, text: 'Hết hạn < 1 tháng' }, { id: 3, text: 'Hết hạn < 3 tháng' }, { id: -1, text: 'Đã hết hạn' }];
class CarPage extends AdminPage {
    render() {
        return (
            <SectionCar dataCarType={dataCarType} title={'Ngày hết hạn đăng kiểm xe'} isTapLai={false}></SectionCar>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(CarPage);
