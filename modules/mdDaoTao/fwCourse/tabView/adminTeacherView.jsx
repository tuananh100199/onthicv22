import React from 'react';
import { connect } from 'react-redux';
import { updateCourseTeacherGroup, updateCourseTeacherGroupStudent } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { CirclePageButton, FormSelect, FormTextBox, FormCheckbox, AdminModal } from 'view/component/AdminPage';

class TeacherModal extends AdminModal {
    state = { teachers: [] };
    onShow = ({ course, _divisionId, _studentIds }) => {
        let _teacherId = null,
            teachers = [];
        course.teacherGroups.forEach(group => {
            if (group.teacher && group.teacher.division && group.teacher.division._id == _divisionId) {
                group.teacher.isSelected = _teacherId == null;
                _teacherId = _teacherId || group.teacher._id;
                teachers.push(group.teacher);
            }
        });
        this.setState({ _courseId: course._id, _studentIds, _teacherId, teachers });
    };

    onClick = (e, _teacherId, index) => {
        e.preventDefault();
        const teachers = this.state.teachers;
        teachers.forEach(item => item.isSelected = false);
        teachers[index].isSelected = true;
        this.setState({ teachers, _teacherId });
    }

    onSubmit = () => {
        const { _courseId, _teacherId, _studentIds } = this.state;
        if (_teacherId) {
            this.props.add(_courseId, _teacherId, _studentIds, 'add', () => this.hide() || !this.props.onSuccess || this.props.onSuccess());
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
    state = { searchStudentText: '', outsideStudentVisible: true, sortType: 'name', assignedButtonVisible: false }; // sortType = name | division
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
    removeTeacher = (e, teacher) => e.preventDefault() || T.confirm('Xoá Cố vấn học tập', `Bạn có chắc muốn xoá ${teacher.lastname} ${teacher.firstname} khỏi khóa học này?`, true, isConfirm =>
        isConfirm && this.props.course && this.props.course.item && this.props.updateCourseTeacherGroup(this.props.course.item._id, teacher._id, 'remove'));

    removeStudent = (e, teacher, student) => e.preventDefault() || T.confirm('Xoá học viên', `Bạn có chắc muốn xoá học viên '${student.lastname} ${student.firstname}' khỏi cố vấn học tập '${teacher.lastname} ${teacher.firstname}'?`, true, isConfirm =>
        isConfirm && this.props.updateCourseTeacherGroupStudent(this.props.course.item._id, teacher._id, [student._id], 'remove'));

    showStudentInfo = (e, student) => {
        e.preventDefault();
        alert('TODO: ' + JSON.stringify(student));
    }

    selectOneStudent = (student, value, done) => {
        if (student && student.division) {
            const { students } = this.props.course && this.props.course.item ? this.props.course.item : {};
            value && (students || []).forEach(item => {
                const currentStudent = this.students[item._id];
                if (currentStudent && currentStudent.value() && item._id != student._id && item.division && item.division._id != student.division._id) {
                    currentStudent.value(false);
                }
            });

            this.setState({
                _divisionId: student.division._id,
                assignedButtonVisible: value || Object.keys(this.students).filter(_studentId => this.students[_studentId].value()).length > 0,
            }, () => done && done());
        }
    }

    showAssignedModal = (e, course, student) => {
        e.preventDefault();
        new Promise(resolve => {
            if (student) {
                this.students[student._id].value(true);
                this.selectOneStudent(student, true, resolve);
            } else {
                resolve();
            }
        }).then(() => {
            const _divisionId = student && student.division ? student.division._id : this.state._divisionId;
            if (_divisionId) {
                const _studentIds = [];
                Object.keys(this.students).forEach(_studentId => {
                    if (!this.students[_studentId]) {
                        delete this.students[_studentId];
                    } else if (this.students[_studentId].value()) {
                        _studentIds.push(_studentId);
                    }
                });
                student && !_studentIds.includes(student._id) && _studentIds.push(student._id);
                _studentIds.length && this.modal.show({ course, _divisionId, _studentIds });
            }
        });
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
            permissionTeacherWrite = permission.write || (currentUser && currentUser.isCourseAdmin);
        const isOutsideCourseAdmin = currentUser && currentUser.isCourseAdmin && currentUser.division && currentUser.division.isOutside ? true : false;

        const { _id, students, teacherGroups } = this.props.course && this.props.course.item ? this.props.course.item : {};
        let { searchStudentText, outsideStudentVisible, sortType, assignedButtonVisible } = this.state,
            studentList = [], assignedStudents = [];
        outsideStudentVisible = outsideStudentVisible || isOutsideCourseAdmin;
        (teacherGroups || []).forEach(item => (item.student || []).forEach(student => assignedStudents.push(student._id)));
        (students || []).forEach((student, index) => {
            if ((searchStudentText == '' || (student.lastname + ' ' + student.firstname).toLowerCase().includes(searchStudentText)) && !assignedStudents.includes(student._id) && student.division && (!student.division.isOutside || outsideStudentVisible)) {
                studentList.push(
                    <li style={{ margin: 0, display: 'block' }} key={index}>
                        <div style={{ display: 'inline-flex' }}>
                            <FormCheckbox ref={e => this.students[student._id] = e} style={{ display: 'inline-block' }} onChange={value => this.selectOneStudent(student, value)}
                                label={`${studentList.length + 1}. ${student.lastname} ${student.firstname} (${student.identityCard}) - ${student.division.title} ${student.division.isOutside ? ' (cơ sở ngoài)' : ''}`} />
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
                    <div style={{ float: 'right', marginTop: 8, marginRight: 8 }}>
                        <FormCheckbox label='Hiện cơ sở ngoài' onChange={value => this.setState({ outsideStudentVisible: value })} style={{ display: isOutsideCourseAdmin ? 'none' : 'inline-block', marginRight: 16 }} defaultValue={true} />
                        Sắp xếp theo:&nbsp;
                        <a className={sortType == 'name' ? ' text-warning' : 'text-secondary'} href='#' onClick={e => e.preventDefault() || this.setState({ sortType: 'name' })}>
                            Tên
                        </a> |&nbsp;
                        <a className={sortType == 'division' ? ' text-warning' : 'text-secondary'} href='#' onClick={e => e.preventDefault() || this.setState({ sortType: 'division' })}>
                            Cơ sở
                        </a>
                    </div>

                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.setState({ searchStudentText: e.target.value })} />
                        <div style={{ width: '100%', display: studentList.length ? 'block' : 'none' }}>
                            <a href='#' onClick={e => this.showAssignedModal(e, this.props.course.item)} style={{ float: 'right', color: 'black', display: assignedButtonVisible ? 'block' : 'none' }}>
                                Gán <i style={{ marginLeft: 5, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                            </a>
                        </div>
                        {studentList.length ? <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>{studentList}</ul> : <label>Danh sách trống!</label>}
                    </div>
                    <TeacherModal ref={e => this.modal = e} readOnly={!permission.write} add={this.props.updateCourseTeacherGroupStudent} onSuccess={this.onAssignSuccess} />
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
                        {teacherGroups.length ?
                            <ol className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                                {teacherGroups.map((item, index) => item.teacher ?
                                    <li className='text-primary' style={{ margin: 10 }} key={index}>
                                        <div style={{ display: 'inline-flex' }}>
                                            {item.teacher.lastname} {item.teacher.firstname} - {item.teacher.division && item.teacher.division.title}&nbsp;
                                            {item.teacher.division.isOutside ? <span className='text-secondary'>(cơ sở ngoài)</span> : ''}
                                            <div className='buttons'>
                                                <a href='#' onClick={e => _id && this.removeTeacher(e, item.teacher)}>
                                                    <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-times text-danger' />
                                                </a>
                                            </div>
                                        </div>
                                        <ul style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                            {item.student.length ? item.student.map((student, indexStudent) => (
                                                <li key={indexStudent} style={{ margin: 10, color: 'black' }}>
                                                    <div style={{ display: 'inline-flex' }}>
                                                        <a href='#' style={{ color: 'black' }} onClick={e => this.showStudentInfo(e, student)}>
                                                            {student.lastname} {student.firstname} - {student.division && student.division.title}&nbsp;
                                                            {student.division && student.division.isOutside ? <span className='text-secondary'>(cơ sở ngoài)</span> : ''}
                                                        </a>
                                                        <div className='buttons'>
                                                            <a href='#' onClick={e => _id && this.removeStudent(e, item.teacher, student)}>
                                                                <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-times text-danger' />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </li>
                                            )) : <label style={{ color: 'black' }}>Chưa có học viên!</label>}
                                        </ul>
                                    </li> : null)}
                            </ol> : <label style={{ color: 'black' }}>Chưa có cố vấn học tập!</label>}
                    </div>
                </div>
                <CirclePageButton type='export' onClick={() => alert('TODO: export thông tin Cố vấn học tập + Học viên. Lưu ý: AdminCourse mà division.isOutside (biến isOutsideCourseAdmin) không hiện nút này => kiểm tra cả controller!')} />
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { updateCourseTeacherGroup, updateCourseTeacherGroupStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherView);