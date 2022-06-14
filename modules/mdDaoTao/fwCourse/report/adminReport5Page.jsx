import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportPhuLuc5, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox , renderTable, TableCell, AdminModal, CirclePageButton } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const name = this.props.course && this.props.course.name;
        this.itemTitle.value(name || '');
        this.itemTeacher.value(item.teacher ? item.teacher.lastname + ' ' + item.teacher.firstname : '');
        this.itemSoLuongHocVien.value(item.student ? item.student.length : 0);
        this.itemSoLuongHocVienTotNghiep.value(item.soLuongHocVienTotNghiep || 0);
    }

    onSubmit = () => {
        const current = this.state.student;
        const listStudent = this.props.listStudent;
        const changes = {
            lastname: this.itemLastname.value(),
            firstname: this.itemFirstname.value(),
            identityCard: this.itemIdentityCard.value(),
            residence: this.itemResidence.value(),
            isGiayKhamSucKhoe: this.itemGiaySucKhoe.value(),
            isBangLaiA1: this.itemGPLX.value(),
            birthday: this.itemBirth.value(),
            soNamLaiXe: this.itemSoNamLaiXe.value(),
            soKMLaiXe: this.itemKMLaiXe.value(),
        };
        let index = listStudent.findIndex(student => student._id == current._id);
        if(listStudent[index]) listStudent[index] = changes;
        this.props.updateState({listStudent: listStudent});
        this.props.update(current._id, changes, () => this.hide());       
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa tiến độ',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-6' label='Tên lớp' readOnly={true} />
                <FormTextBox ref={e => this.itemTeacher = e} className='col-md-6' label='Tên giáo viên' readOnly={true} />
                <FormTextBox ref={e => this.itemSoLuongHocVien = e} className='col-md-6' label='Số lượng học viên' readOnly={true} />
                <FormTextBox ref={e => this.itemSoLuongHocVienTotNghiep = e} className='col-md-6' label='Số học viên tốt nghiệp' readOnly={false} />
            </div>),
    });
}

class AdminReport5Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/tien-do-dao-tao').parse(window.location.pathname);
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

    exportPhuLuc5 = () => {
        const courseId = this.state.courseId;
        if(courseId){
            this.props.exportPhuLuc5(courseId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Phu_Luc_5.docx');
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
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const course = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        const list = course && course.teacherGroups;
        const backRoute = `/user/course/${this.state.courseId}/report`;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên lớp</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Tên giáo viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lượng học viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số học viên tốt nghiệp</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={course.name + '-' + (index + 1)} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.teacher ? item.teacher.lastname + ' ' + item.teacher.firstname : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.student ? item.student.length : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Tiến độ đào tạo (Phụ lục 5)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Tiến độ đào tạo (Phụ lục 5)'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <SubjectModal readOnly={false} updateState={this.updateState} listStudent={this.state.listStudent} courseId={this.state.courseId} ref={e => this.modal = e} course={course} update={this.props.updateStudent} />
                <CirclePageButton type='export' onClick={() => this.exportPhuLuc5()} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} style={{ left: 320 }}
                    getPage={(pageNumber, pageSize) => this.props.getStudentPage(pageNumber, pageSize, { courseId: this.state.courseId, totNghiep: 'true', datSatHach: 'false' })} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportPhuLuc5, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReport5Page);
