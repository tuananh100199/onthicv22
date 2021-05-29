import React from 'react';
import { connect } from 'react-redux';
import { updateStudentInfoInCourse, updateCourseRepresenterGroup, updateCourseRepresenterGroupStudent, exportRepresenterAndStudentToExcel } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { CirclePageButton, FormSelect, FormTextBox, FormCheckbox, AdminModal } from 'view/component/AdminPage';
import AdminStudentModal from '../adminStudentModal';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';

class RepresenterModal extends AdminModal {
    state = { representers: [] };
    onShow = ({ course, _studentIds }) => {
        let _representerId = null,
            representers = course.representerGroups.map(group => {
                group.representer.isSelected = _representerId == null;
                _representerId = _representerId || group.representer._id;
                return group.representer;
            });
        this.setState({ _courseId: course._id, _studentIds, _representerId, representers });
    };

    onClick = (e, _representerId, index) => {
        e.preventDefault();
        const representers = this.state.representers;
        representers.forEach(item => item.isSelected = false);
        representers[index].isSelected = true;
        this.setState({ representers, _representerId });
    }

    onSubmit = () => {
        const { _courseId, _representerId, _studentIds } = this.state;
        if (_representerId) {
            this.props.add(_courseId, _representerId, _studentIds, 'add', () => this.hide() || !this.props.onSuccess || this.props.onSuccess());
        } else {
            T.notify('Chưa chọn giáo viên', 'danger');
        }
    }

    render = () => {
        const { representers } = this.state;
        return this.renderModal({
            title: 'Gán Giáo viên',
            body: representers && representers.length ?
                <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                    {representers.map((representer, index) =>
                        <li style={{ margin: 10 }} key={index}>
                            <a href='#' onClick={e => this.onClick(e, representer._id, index)} style={representers[index].isSelected ? { color: '#1488db', fontWeight: 'bold', fontStyle: 'italic' } : { color: 'black' }}>
                                {representer.lastname} {representer.firstname} - {representer.division ? representer.division.title : ''}
                            </a>
                        </li>)}
                </ol> : 'Không có Giáo viên',
        });
    }
}

class AdminRepresentersView extends React.Component {
    state = { searchStudentText: '', assignedButtonVisible: false };
    students = {};

    addRepresenter = e => {
        e.preventDefault();
        const { _id, representerGroups = [] } = this.props.course.item,
            _representerId = this.selectRepresenter.value();
        if (_representerId && representerGroups.find(({ representer }) => representer._id == _representerId) == null) {
            this.props.updateCourseRepresenterGroup(_id, _representerId, 'add', () => this.selectRepresenter.value(null));
        }
    }
    removeRepresenter = (e, representer) => e.preventDefault() || T.confirm('Xoá giáo viên', `Bạn có chắc muốn xoá giáo viên '${representer.lastname} ${representer.firstname}' khỏi khóa học này?`, true, isConfirm =>
        isConfirm && this.props.course && this.props.course.item && this.props.updateCourseRepresenterGroup(this.props.course.item._id, representer._id, 'remove'));

    removeStudent = (e, representer, student) => e.preventDefault() || T.confirm('Xoá học viên', `Bạn có chắc muốn xoá học viên '${student.lastname} ${student.firstname}' khỏi giáo viên '${representer.lastname} ${representer.firstname}'?`, true, isConfirm =>
        isConfirm && this.props.updateCourseRepresenterGroupStudent(this.props.course.item._id, representer._id, [student._id], 'remove'));

    showStudentInfo = (e, student) => e.preventDefault() || this.studentModal.show(student);

    updateStudent = (studentId, changes) => {
        this.props.updateStudent(studentId, changes, (data) => {
            data && this.props.updateStudentInfoInCourse(studentId, data);
        });
    }

    selectOneStudent = () => this.setState({ assignedButtonVisible: Object.keys(this.students).filter(_studentId => this.students[_studentId] && this.students[_studentId].value()).length > 0 });
    selectManyStudents = selected => {
        this.itemSelectAll.value(true);
        this.itemDeSelectAll.value(false);
        Object.keys(this.students).forEach(_id => this.students[_id] && this.students[_id].value(selected));
        this.setState({ assignedButtonVisible: selected });
    }

    showAssignedModal = (e, course, student) => {
        e.preventDefault();
        student && this.students[student._id].value(true);
        const _studentIds = [];
        Object.keys(this.students).forEach(_studentId => {
            if (!this.students[_studentId]) {
                delete this.students[_studentId];
            } else if (this.students[_studentId].value()) {
                _studentIds.push(_studentId);
            }
        });

        student && !_studentIds.includes(student._id) && _studentIds.push(student._id);
        _studentIds.length && this.modal.show({ course, _studentIds });
    }

    onAssignSuccess = () => {
        Object.keys(this.students).forEach(_studentId => {
            if (!this.students[_studentId]) {
                delete this.students[_studentId];
            } else {
                this.students[_studentId].value(false);
            }
            this.setState({ assignedButtonVisible: false });
        });
    }

    render() {
        const permission = this.props.permission,
            currentUser = this.props.system ? this.props.system.user : null,
            permissionRepresenterWrite = permission.write || (currentUser && currentUser.isCourseAdmin);
        const { _id, students, representerGroups } = this.props.course && this.props.course.item ? this.props.course.item : {};
        const { searchStudentText, assignedButtonVisible } = this.state,
            studentList = [], assignedStudents = [];
        // const isOutsideCourseAdmin = currentUser && currentUser.isCourseAdmin && currentUser.division && currentUser.division.isOutside ? true : false;

        (representerGroups || []).forEach(item => (item.student || []).forEach(student => assignedStudents.push(student._id)));
        (students || []).forEach((student, index) => {
            if ((searchStudentText == '' || (student.lastname + ' ' + student.firstname).toLowerCase().includes(searchStudentText)) && student.division && !student.division.isOutside && !assignedStudents.includes(student._id)) {
                studentList.push(
                    <li style={{ margin: 0, display: 'block' }} key={index}>
                        <div style={{ display: 'inline-flex' }}>
                            <FormCheckbox ref={e => this.students[student._id] = e} style={{ display: 'inline-block' }} onChange={this.selectOneStudent}
                                label={`${studentList.length + 1}. ${student.lastname} ${student.firstname} (${student.identityCard})`} />
                            <div className='buttons'>
                                <a href='#' onClick={e => this.showAssignedModal(e, this.props.course.item, student)}>
                                    <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                                </a>
                            </div>
                        </div>
                    </li>);
            }
        });

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.setState({ searchStudentText: e.target.value })} />
                        <div style={{ width: '100%', display: studentList.length ? 'block' : 'none' }}>
                            <FormCheckbox ref={e => this.itemSelectAll = e} label='Chọn tất cả' onChange={() => this.selectManyStudents(true)} style={{ display: 'inline-block' }} defaultValue={true} />
                            <FormCheckbox ref={e => this.itemDeSelectAll = e} label='Không chọn tất cả' onChange={() => this.selectManyStudents(false)} style={{ display: 'inline-block', marginLeft: 12 }} defaultValue={false} />
                            <a href='#' onClick={e => this.showAssignedModal(e, this.props.course.item)} style={{ float: 'right', color: 'black', display: assignedButtonVisible ? 'block' : 'none' }}>
                                Gán <i style={{ marginLeft: 5, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                            </a>
                        </div>
                        {studentList.length ? <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>{studentList}</ul> : <label>Danh sách trống!</label>}
                    </div>
                    <RepresenterModal ref={e => this.modal = e} readOnly={!permission.write} add={this.props.updateCourseRepresenterGroupStudent} onSuccess={this.onAssignSuccess} />
                </div>

                <div className='col-md-6'>
                    <h3 className='tile-title'>Giáo viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <label>Tìm kiếm giáo viên</label>
                        <div style={{ display: permissionRepresenterWrite ? 'flex' : 'none' }}>
                            <FormSelect ref={e => this.selectRepresenter = e} data={ajaxSelectUserType(['isRepresenter'])} style={{ width: '100%' }} />
                            <div style={{ width: 'auto', paddingLeft: 8 }}>
                                <button className='btn btn-success' type='button' onClick={this.addRepresenter}><i className='fa fa-plus' /></button>
                            </div>
                        </div>
                        {representerGroups.length ?
                            <ol className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                                {representerGroups.map((item, index) => item.representer ?
                                    <li className='text-primary' style={{ margin: 10 }} key={index}>
                                        <div style={{ display: 'inline-flex' }}>
                                            {item.representer.lastname} {item.representer.firstname} - {item.representer.division && item.representer.division.title}
                                            {item.representer.division && item.representer.division.isOutside ? <span className='text-secondary'>&nbsp;(cơ sở ngoài)</span> : ''}
                                            <div className='buttons'>
                                                <a href='#' onClick={e => _id && this.removeRepresenter(e, item.representer)}>
                                                    <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-times text-danger' />
                                                </a>
                                            </div>
                                        </div>
                                        <ul style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                            {item.student.length ? item.student.map((student, indexStudent) => (
                                                <li key={indexStudent} style={{ margin: 10, color: 'black' }}>
                                                    <div style={{ display: 'inline-flex' }}>
                                                        <a href='#' style={{ color: 'black' }} onClick={e => this.showStudentInfo(e, student)}>
                                                            {student.lastname} {student.firstname} ({student.identityCard}) - {student.division ? student.division.title : ''}
                                                            {student.division && student.division.isOutside ? <span className='text-secondary'>&nbsp;(cơ sở ngoài)</span> : ''}
                                                        </a>
                                                        <div className='buttons'>
                                                            <a href='#' onClick={e => _id && this.removeStudent(e, item.representer, student)}>
                                                                <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-times text-danger' />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </li>
                                            )) : <label style={{ color: 'black' }}>Chưa có học viên!</label>}
                                        </ul>
                                    </li> : null)}
                            </ol> : <label style={{ color: 'black' }}>Chưa có giáo viên!</label>}
                    </div>
                </div>
                {/* <CirclePageButton type='export' onClick={() => exportRepresenterAndStudentToExcel(_id)} /> */}
                <CirclePageButton type='export' onClick={(e) => e.preventDefault()} />
                <AdminStudentModal ref={e => this.studentModal = e} permission={this.props.permissionCourse} updateStudent={this.updateStudent} />
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { updateStudentInfoInCourse, updateCourseRepresenterGroup, updateCourseRepresenterGroupStudent, updateStudent, exportRepresenterAndStudentToExcel };
export default connect(mapStateToProps, mapActionsToProps)(AdminRepresentersView);