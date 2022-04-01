import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportTN03, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, CirclePageButton } from 'view/component/AdminPage';

class AdminReportTN03Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/hoi-dong-thi-tot-nghiep').parse(window.location.pathname);
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

    exportTN03 = () => {
        const courseId = this.state.courseId;
        if(courseId){
            this.props.exportTN03(courseId, (data) => {
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
            title: 'Quyết định thành lập hội đồng thi tốt nghiệp (Phụ lục TN03)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Quyết định thành lập hội đồng thi tốt nghiệp (Phụ lục TN03)'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-md-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Thông tin biên bản</h3>
                        <FormTextBox ref={e => this.sex1 = e} className={'col-md-2'} label='Giới tính' readOnly={false} />
                        <FormTextBox ref={e => this.hoten1 = e} className={'col-md-3'} label='Họ và tên' readOnly={false} />
                        <FormTextBox ref={e => this.chucvu1 = e} className={'col-md-3'} label='Chức vụ' readOnly={false} />
                        <FormTextBox ref={e => this.hoidong1 = e} className={'col-md-4'} label='Nhiệm vụ' readOnly={false} />
                        <FormTextBox ref={e => this.sex2 = e} className={'col-md-2'} label='Giới tính' readOnly={false} />
                        <FormTextBox ref={e => this.hoten2 = e} className={'col-md-3'} label='Họ và tên' readOnly={false} />
                        <FormTextBox ref={e => this.chucvu2 = e} className={'col-md-3'} label='Chức vụ' readOnly={false} />
                        <FormTextBox ref={e => this.hoidong2 = e} className={'col-md-4'} label='Nhiệm vụ' readOnly={false} />
                        <FormTextBox ref={e => this.sex3 = e} className={'col-md-2'} label='Giới tính' readOnly={false} />
                        <FormTextBox ref={e => this.hoten3 = e} className={'col-md-3'} label='Họ và tên' readOnly={false} />
                        <FormTextBox ref={e => this.chucvu3 = e} className={'col-md-3'} label='Chức vụ' readOnly={false} />
                        <FormTextBox ref={e => this.hoidong3 = e} className={'col-md-4'} label='Nhiệm vụ' readOnly={false} />
                        <FormTextBox ref={e => this.sex4 = e} className={'col-md-2'} label='Giới tính' readOnly={false} />
                        <FormTextBox ref={e => this.hoten4 = e} className={'col-md-3'} label='Họ và tên' readOnly={false} />
                        <FormTextBox ref={e => this.chucvu4 = e} className={'col-md-3'} label='Chức vụ' readOnly={false} />
                        <FormTextBox ref={e => this.hoidong4 = e} className={'col-md-4'} label='Nhiệm vụ' readOnly={false} />
                    </div>
                </div>
                <CirclePageButton type='export' onClick={() => this.exportTN03()} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} style={{ left: 320 }}
                    getPage={(pageNumber, pageSize) => this.props.getStudentPage(pageNumber, pageSize, { courseId: this.state.courseId, totNghiep: 'true', datSatHach: 'false' })} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportTN03, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReportTN03Page);
