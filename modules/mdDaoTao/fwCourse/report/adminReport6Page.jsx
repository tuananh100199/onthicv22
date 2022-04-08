import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportPhuLuc6, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormDatePicker, renderTable, TableCell, AdminModal, CirclePageButton, FormSelect } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        this.itemLastname.value(item.lastname || '');
        this.itemFirstname.value(item.firstname || '');
        this.itemResidence.value(item.residence || '');
        this.itemBirth.value(item.birthday || '');
        this.itemKMThucHanh.value(item.soKMThucHanh || 0);
        this.itemDiemCuoiKhoa.value(item.diemCuoiKhoa || 0);
        this.setState({student: item});
    }

    onSubmit = () => {
        const current = this.state.student;
        const {listStudent,teacherId} = this.props;
        const changes = {
            lastname: this.itemLastname.value(),
            firstname: this.itemFirstname.value(),
            residence: this.itemResidence.value(),
            birthday: this.itemBirth.value(),
            soKMThucHanh: this.itemKMThucHanh.value(),
            diemCuoiKhoa: this.itemDiemCuoiKhoa.value(),
        };
        let index = listStudent[teacherId].findIndex(student => student._id == current._id);
        if(listStudent[teacherId][index]) listStudent[teacherId][index] = changes;
        this.props.updateState({listStudent: listStudent});
        this.props.update(current._id, changes, () => this.hide());       
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa học viên',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemLastname = e} className='col-md-6' label='Họ' readOnly={false} />
                <FormTextBox ref={e => this.itemFirstname = e} className='col-md-6' label='Tên' readOnly={false} />
                <FormDatePicker className='col-md-6' ref={e => this.itemBirth = e} label='Ngày tháng năm sinh (dd/mm/yyyy)' readOnly={false} type='date-mask' />
                <FormTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Nơi cư trú' readOnly={false} />
                <FormTextBox ref={e => this.itemKMThucHanh = e} type='number' className='col-md-6' label='Số km thực hành' readOnly={false} />
                <FormTextBox ref={e => this.itemDiemCuoiKhoa = e} type='number' className='col-md-6' label='Điểm kiểm tra cuối khoá' readOnly={false} />
            </div>),
    });
}

class AdminReport6Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/theo-doi-thuc-hanh').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    const listTeacher = course.teacherGroups.map(group => ({id: group.teacher._id, text:group.teacher.lastname + ' ' + group.teacher.firstname}));
                    const listStudent = {};
                            course.teacherGroups.forEach(group => {
                                listStudent[group.teacher._id] = group.student;
                            });
                    this.setState({course, courseId: course._id, listTeacher, listStudent, teacherId: listTeacher[0].id});

                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            const listTeacher = data.item && data.item.teacherGroups.map(group => ({id: group.teacher._id, text:group.teacher.lastname + ' ' + group.teacher.firstname}));
                            const listStudent = {};
                            data.item && data.item.teacherGroups.forEach(group => {
                                listStudent[group.teacher._id] = group.student;
                            });
                            
                            this.setState({course: data, courseId: params._id, listTeacher, listStudent, teacherId: listTeacher[0].id});
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    exportPhuLuc6 = () => {
        const courseId = this.state.courseId;
        if(courseId){
            this.props.exportPhuLuc6(courseId, this.state.teacherId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Phu_Luc_6.docx');
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

    onChangeTeacher = (teacher) => {
        this.setState({teacherId: teacher});
    }

    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 60, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const course = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        const { listStudent, teacherId, listTeacher } = this.state; 
        const list = listStudent ? listStudent[teacherId] : [];
        const backRoute = `/user/course/${course._id}/report`;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi cư trú</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số KM thực hành</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Điểm cuối khoá</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.lastname + ' ' + item.firstname} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.birthday ? T.dateToText(item.birthday,'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.residence} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.soKMThucHanh} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.diemCuoiKhoa} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Theo dõi thực hành (Phụ lục 6)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Theo dõi thực hành (Phụ lục 6)'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        <FormSelect ref={e => this.teacher = e} label='Giáo viên' data={listTeacher} onChange={data => this.onChangeTeacher(data.id)} className='col-md-4' readOnly={false} />
                        {table}
                    </div>
                </div>
                <SubjectModal readOnly={false} updateState={this.updateState} listStudent={listStudent} teacherId={teacherId} courseId={this.state.courseId} ref={e => this.modal = e} update={this.props.updateStudent} />
                <CirclePageButton type='export' onClick={() => this.exportPhuLuc6()} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} style={{ left: 320 }}
                    getPage={(pageNumber, pageSize) => this.props.getStudentPage(pageNumber, pageSize, { courseId: this.state.courseId, totNghiep: 'true', datSatHach: 'false' })} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportPhuLuc6, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReport6Page);
