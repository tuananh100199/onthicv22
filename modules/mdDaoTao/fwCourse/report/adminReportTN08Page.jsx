import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportTN08, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, CirclePageButton, FormDatePicker } from 'view/component/AdminPage';

class AdminReportTN08Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/xet-ket-qua-tot-nghiep').parse(window.location.pathname);
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

    exportTN08 = () => {
        const courseId = this.state.courseId;
        if(courseId){
            this.props.exportTN08(courseId, (data) => {
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
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        // const course = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        // const list = course && course.subjects;
        const backRoute = `/user/course/${this.state.courseId}/report`;
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'BB Họp xét kết quả tốt nghiệp (Phụ lục TN08)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'BB Họp xét kết quả tốt nghiệp (Phụ lục TN08)'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-md-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Thông tin biên bản</h3>
                        <FormTextBox ref={e => this.hoten1 = e} className={'col-md-3'} label='Họ và tên' readOnly={false} />
                        <FormTextBox ref={e => this.chucvu1 = e} className={'col-md-3'} label='Chức vụ' readOnly={false} />
                        <FormTextBox ref={e => this.nhiemvu1 = e} className={'col-md-4'} label='Nhiệm vụ' readOnly={false} />
                        <FormTextBox ref={e => this.hoten2 = e} className={'col-md-3'} label='Họ và tên' readOnly={false} />
                        <FormTextBox ref={e => this.chucvu2 = e} className={'col-md-3'} label='Chức vụ' readOnly={false} />
                        <FormTextBox ref={e => this.nhiemvu2 = e} className={'col-md-4'} label='Nhiệm vụ' readOnly={false} />
                        <FormTextBox ref={e => this.hoten3 = e} className={'col-md-3'} label='Họ và tên' readOnly={false} />
                        <FormTextBox ref={e => this.chucvu3 = e} className={'col-md-3'} label='Chức vụ' readOnly={false} />
                        <FormTextBox ref={e => this.nhiemvu3 = e} className={'col-md-4'} label='Nhiệm vụ' readOnly={false} />
                        <FormTextBox ref={e => this.hotenBaoCao = e} className={'col-md-3'} label='Họ và tên nhân viên báo cáo' readOnly={false} />
                        <FormTextBox ref={e => this.chucvuBaoCao = e} className={'col-md-3'} label='Chức vụ  nhân viên báo cáo' readOnly={false} />
                        <FormTextBox ref={e => this.hoidongBaoCao = e} className={'col-md-4'} label='Nhiệm vụ  nhân viên báo cáo' readOnly={false} />
                        <FormTextBox ref={e => this.totalStudentRegister = e} className={'col-md-3'} label='Tổng số học viên đăng ký' readOnly={false} />
                        <FormTextBox ref={e => this.totalStudent = e} className={'col-md-3'} label='Tổng số học viên dự thi' readOnly={false} />
                        <FormTextBox ref={e => this.vang = e} className={'col-md-3'} label='Số học viên vắng' readOnly={false} />
                        <FormTextBox ref={e => this.passLT = e} className={'col-md-3'} label='Số học viên đậu lý thuyết' readOnly={false} />
                        <FormTextBox ref={e => this.unPassLT = e} className={'col-md-3'} label='Số học viên rớt lý thuyết' readOnly={false} />
                        <FormTextBox ref={e => this.passTH = e} className={'col-md-3'} label='Số học viên đậu thực hành' readOnly={false} />
                        <FormTextBox ref={e => this.unPassTH = e} className={'col-md-3'} label='Số học viên rớt thực hành' readOnly={false} />
                        <FormTextBox ref={e => this.pass = e} className={'col-md-3'} label='Số học viên tốt nghiệp' readOnly={false} />
                        <FormDatePicker className='col-md-4' ref={e => this.ngayThi = e} label='Ngày thi' readOnly={false} type='date-mask' />
                    </div>
                </div>
                <CirclePageButton type='export' onClick={() => this.exportTN08()} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} style={{ left: 320 }}
                    getPage={(pageNumber, pageSize) => this.props.getStudentPage(pageNumber, pageSize, { courseId: this.state.courseId, totNghiep: 'true', datSatHach: 'false' })} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportTN08, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReportTN08Page);
