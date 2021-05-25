import React from 'react';
import { connect } from 'react-redux';
import { updateCourseTeacherGroup, updateCourseTeacherGroupStudent } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { FormSelect, FormTextBox, FormCheckbox, AdminModal } from 'view/component/AdminPage';

class TeacherModal extends AdminModal {
    state = { teachers: [] };
    onShow = ({ course, _studentIds }) => {
        let teachers = course.teacherGroups.map(group => {
            group.teacher.isSelected = false;
            return group.teacher;
        });
        this.setState({ _courseId: course._id, _studentIds, teachers });
    };

    onClick = (e, _id, index) => {
        e.preventDefault();
        const teachers = this.state.teachers;
        teachers.forEach(i => i.isSelected = false);
        teachers[index].isSelected = true;
        this.setState({ teachers, _id });
    }

    onSubmit = () => {
        const { _courseId, _representerId, _studentIds } = this.state;
        if (this.state._id) {
            const { _id } = this.props.course;
            this.props.add(_id, this.state._id, this.props.student._id, 'add', this.hide);
        } else {
            T.notify('Chưa chọn Cố vấn học tập', 'danger');
        }
    }

    render = () => {
        const { teachers } = this.state;
        return this.renderModal({
            title: 'Gán Cố vấn học tập',
            body: teachers && teachers.length ?
                <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                    {teachers.map((teacher, index) =>
                        <li style={{ margin: 10 }} key={index}>
                            <a href='#' onClick={e => this.onClick(e, teacher._id, index)} style={teachers[index].isSelected ? { color: '#1488db', fontWeight: 'bold', fontStyle: 'italic' } : { color: 'black' }}>
                                {teacher.lastname} {teacher.firstname} - {teacher.division ? teacher.division.title : ''}
                            </a>
                        </li>)
                    }
                </ol> : 'Không có Cố vấn học tập',
        });
    }
}

class AdminTeacherView extends React.Component {
    state = { searchStudentText: '', assignedButtonVisible: false };
    students = {};

    addTeacher = e => {
        e.preventDefault();
        const { _id, teacherGroups = [] } = this.props.course.item,
            _teacherId = this.selectTeacher.value();
        if (_teacherId && teacherGroups.find(({ teacher }) => teacher._id == _teacherId) == null) {
            this.props.updateCourseTeacherGroup(_id, _teacherId, 'add', () => this.selectTeacher.value(null));
        } else {
            T.notify('Bạn chọn trùng cố vấn học tập', 'danger');
        }
    }
    removeTeacher = (e, teacher) => e.preventDefault() || T.confirm('Xoá Cố vấn học tập', `Bạn có chắc muốn xoá ${teacher.lastname} ${teacher.firstname} khỏi khóa học này?`, true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id } = this.props.course.item;
            this.props.updateCourseTeacherGroup(_id, teacher._id, 'remove');
        }
    });

    removeStudent = (e, teacher, student) => {
        e.preventDefault();
        const { _id } = this.props.course.item;
        this.props.updateCourseTeacherGroupStudent(_id, teacher._id, student._id, 'remove');
    }

    selectOneStudent = () => this.setState({ assignedButtonVisible: Object.keys(this.students).filter(_studentId => this.students[_studentId].value()).length > 0 });
    selectManyStudents = selected => {
        this.itemSelectAll.value(true);
        this.itemDeSelectAll.value(false);
        Object.keys(this.students).forEach(_id => this.students[_id].value(selected));
        this.setState({ assignedButtonVisible: selected });
    }

    showAssignedModal = (e, course, student) => {
        e.preventDefault();
        student && this.students[student._id].value(true);
        const _studentIds = Object.keys(this.students).filter(_studentId => this.students[_studentId].value());
        student && !_studentIds.includes(student._id) && _studentIds.push(student._id);
        _studentIds.length && this.modal.show({ course, _studentIds });
    }

    render() {
        const permission = this.props.permission,
            permissionTeacherWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);
        const { _id, students, teacherGroups } = this.props.course && this.props.course.item ? this.props.course.item : {};
        const { searchStudentText, assignedButtonVisible } = this.state,
            studentList = [], assignedStudents = [];
        (teacherGroups || []).forEach(item => (item.student || []).forEach(student => assignedStudents.push(student._id)));
        (students || []).forEach((student, index) => {
            if ((searchStudentText == '' || (student.lastname + ' ' + student.firstname).toLowerCase().includes(searchStudentText)) && !assignedStudents.includes(student._id)) {
                studentList.push(
                    <li style={{ margin: 0, display: 'block' }} key={index}>
                        <div style={{ display: 'inline-flex' }}>
                            <FormCheckbox ref={e => this.students[student._id] = e} style={{ display: 'inline-block' }} onChange={this.selectOneStudent}
                                label={`${studentList.length + 1}. ${student.lastname} ${student.firstname} (${student.identityCard}) - ${student.division && student.division.title} ${student.division && student.division.isOutside ? ' (cơ sở ngoài)' : ''}`} />
                            <div className='buttons'>
                                <a href='#' onClick={e => this.showAssignedModal(e, this.props.course.item, student)}>
                                    <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                                </a>
                            </div>
                        </div>
                    </li>)
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
                                Gán Cố vấn học tập <i style={{ marginLeft: 5, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                            </a>
                        </div>
                        {studentList.length ? <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>{studentList}</ul> : <label>Danh sách trống!</label>}
                    </div>
                    <TeacherModal ref={e => this.modal = e} readOnly={!permission.write} add={this.props.updateCourseTeacherGroupStudent} />
                </div>

                <div className='col-md-6'>
                    <h3 className='tile-title'>Cố vấn học tập</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <label>Tìm kiếm cố vấn học tập</label>
                        <div style={{ display: permissionTeacherWrite ? 'flex' : 'none' }}>
                            <FormSelect ref={e => this.selectTeacher = e} data={ajaxSelectUserType(['isLecturer'])} style={{ width: '100%' }} />
                            <div style={{ width: 'auto', paddingLeft: 8 }}>
                                <button className='btn btn-success' type='button' onClick={this.addTeacher}><i className='fa fa-fw fa-lg fa-plus' /></button>
                            </div>
                        </div>
                        {teacherGroups.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {teacherGroups.map((item, index) => item.teacher ?
                                <li className='text-primary' style={{ margin: 10 }} key={index}>
                                    <a href='#' className='text-primary' onClick={e => _id && this.removeTeacher(e, item.teacher)}>
                                        {`${item.teacher.lastname} ${item.teacher.firstname}`} - {item.teacher.division && item.teacher.division.title}{item.teacher.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                    </a>
                                    <ul style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                        {item.student.length ? item.student.map((student, indexStudent) => (
                                            <li key={indexStudent} style={{ margin: 10, color: 'black' }}>
                                                <a href='#' style={{ color: 'black' }} onClick={e => _id && this.removeStudent(e, item.teacher, student)}>
                                                    {`${student.lastname} ${student.firstname}`} - {student.division && student.division.title}{student.division && student.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                                </a>
                                            </li>
                                        )) : <label style={{ color: 'black' }}>Chưa có học viên!</label>}
                                    </ul>
                                </li> : null)}
                        </ol> : <label style={{ color: 'black' }}>Chưa có cố vấn học tập!</label>}
                    </div>
                </div>
                {/* <CirclePageButton type='export' onClick={TODO} /> */}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { updateCourseTeacherGroup, updateCourseTeacherGroupStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherView);