import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportPhuLuc3A, getCourse } from '../redux';
import FileSaver from 'file-saver';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, CirclePageButton, FormDatePicker } from 'view/component/AdminPage';

class AdminReport3APage extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/dang-ky-sat-hach').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.setState({course, courseId: course._id});
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.setState({course: data, courseId: params._id});
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    exportPhuLuc3A = () => {
        const courseId = this.state.courseId;
        if(courseId){
            this.props.exportPhuLuc3A(courseId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Bien_Ban_Tot_Nghiep.docx');
            });
        } else{
            T.notify('Danh sách học viên trống!', 'danger');
        }
    };

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá học viên', 'Bạn có chắc muốn xoá học viên ' + item.lastname + ' ' + item.firstname, true, isConfirm =>
            isConfirm && this.setState({listStudent: this.state.listStudent.filter((student) => student._id != item._id)}));
    };

    updateState = (newState) => {
        this.setState(newState);
    }

    render() {
        // const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        // const course = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        // const list = course && course.subjects;
        const backRoute = `/user/course/${this.state.courseId}/report`;
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Đăng ký sát hạch (Phụ lục 3A)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Đăng ký sát hạch (Phụ lục 3A)'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-md-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Thông tin báo cáo</h3>
                        <FormTextBox ref={e => this.soLuongHocVien = e} className={'col-md-4'} label='Số lượng học viên' readOnly={false} />
                        <FormDatePicker className='col-md-4' ref={e => this.ngayKhaiGiang = e} label='Ngày khai giảng' readOnly={false} type='date-mask' />
                    </div>
                </div>
                <CirclePageButton type='export' onClick={() => this.exportPhuLuc3A()} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportPhuLuc3A, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReport3APage);
