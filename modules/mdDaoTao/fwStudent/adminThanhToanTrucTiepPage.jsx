import React from 'react';
import { connect } from 'react-redux';
import { getStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect } from 'view/component/AdminPage';

class ThanhToanTrucTiepPage extends AdminPage {
    state = { showOfficial: false, showExtra: false };
    componentDidMount() {
        T.ready('/user/student/debt', () => {
            const route = T.routeMatcher('/user/student/payment/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.setState({ userId: _id });
            this.props.getStudent(_id, data => {
                if (data)
                    this.setState({ data });
            });
        });
    }

    loadCourseFee = (id) => {
        if (parseInt(id) == 0) {
            this.setState({ showOfficial: true, showExtra: false });
        } else {
            this.setState({ showOfficial: false, showExtra: true });
        }
    }

    render() {
        const student = this.state.data;
        const { showExtra, showOfficial } = this.state;
        console.log(student);
        const name = (student ? (student.lastname + ' ' + student.firstname) : '');
        const dataCourseFeeType = [{ id: 0, text: 'Học phí chính thức' }, { id: 1, text: 'Học phí tăng thêm' }];
        const official = (
            <div className='tile'>
                <h3 className='tile-title'>Thanh toán gói học phí chính thức</h3>
                <div className='tile-body row'>
                    <label className='col-md-6'>Tên gói: <b>{student && student.courseFee ? student.courseFee.name : ''}</b></label>
                    <label className='col-md-6'>Khóa học: <b>{student && student.course ? student.course.name : 'Chưa có khóa học'}</b></label>
                </div>
            </div>
        );
        const extra = (
            <div className='tile'>
                <h3 className='tile-title'>Thanh toán gói học phí tăng thêm</h3>
                <div className='tile-body row'>
                    <label className='col-md-6'>Học viên: <b>{name}</b></label>
                    <label className='col-md-6'>Khóa học: <b>{student && student.course ? student.course.name : 'Chưa có khóa học'}</b></label>
                </div>
            </div>
        );
        return this.renderPage({
            icon: 'fa fa-money', // select icon
            title: 'Đóng tiền trực tiếp: ' + name,
            breadcrumb: [<Link key={0} to='/user/student/debt'>Theo dõi công nợ</Link>, 'Đóng tiền trực tiếp'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin học viên</h3>
                    <div className='tile-body row'>
                        <label className='col-md-6'>Học viên: <b>{name}</b></label>
                        <label className='col-md-6'>Khóa học: <b>{student && student.course ? student.course.name : 'Chưa có khóa học'}</b></label>
                        <FormSelect className='col-md-4' ref={e => this.filter = e} label='Chọn gói thanh toán' data={dataCourseFeeType} onChange={data => this.loadCourseFee(data.id)} />
                    </div>
                </div>
                {showOfficial ? official : null}
                {showExtra ? extra : null}
            </>,
            backRoute: '/user/student/debt'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getStudent };
export default connect(mapStateToProps, mapActionsToProps)(ThanhToanTrucTiepPage);
