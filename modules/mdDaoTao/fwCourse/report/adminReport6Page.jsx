import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportPhuLuc6, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox , renderTable, TableCell, AdminModal, CirclePageButton, FormSelect } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        this.itemTitle.value(item.title || '');
        this.itemTotalTime.value(item.totalTime || '');
        this.itemLyThuyet.value(item.gioHocLyThuyet || '');
        // this.itemTrongHinh.value(item.gioHocTrongHinh || '');
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
        title: 'Chỉnh sửa học viên',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-6' label='Tên học viên' readOnly={false} />
                <FormTextBox ref={e => this.itemTotalTime = e} className='col-md-6' label='Ngày sinh' readOnly={false} />
                <FormTextBox ref={e => this.itemLyThuyet = e} className='col-md-6' label='Nơi cư trú' readOnly={false} />
                {/* <FormTextBox ref={e => this.itemTrongHinh = e} className='col-md-6' label='Số học viên tốt nghiệp' readOnly={false} /> */}
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
                    this.setState({course, courseId: course._id, listTeacher, listStudent: course.teacherGroups[0].student, teacherId: listTeacher[0].id});

                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            const listTeacher = data.item && data.item.teacherGroups.map(group => ({id: group.teacher._id, text:group.teacher.lastname + ' ' + group.teacher.firstname}));
                            this.setState({course: data, courseId: params._id, listTeacher, listStudent: data.item.teacherGroups[0].student, teacherId: listTeacher[0].id});
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
        // const course = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        const list = this.state.listStudent ? this.state.listStudent : [];
        const backRoute = `/user/course/${this.state.courseId}/report`;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi cư trú</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.lastname + ' ' + item.firstname} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.birthday ? T.dateToText(item.birthday,'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.residence} style={{ whiteSpace: 'nowrap' }} />
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
                        <FormSelect ref={e => this.teacher = e} label='Giáo viên' data={this.state.listTeacher} onChange={data => this.onChangeTeacher(data.id)} className='col-md-4' readOnly={false} />
                        {table}
                    </div>
                </div>
                <SubjectModal readOnly={false} updateState={this.updateState} listStudent={this.state.listStudent} courseId={this.state.courseId} ref={e => this.modal = e} update={this.props.updateStudent} />
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
