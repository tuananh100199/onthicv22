import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourseTeacherGroup, updateCourseTeacherGroupStudent } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { getStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import { FormSelect, FormTextBox, AdminModal } from 'view/component/AdminPage';

class TeacherModal extends AdminModal {
    state = { teachers: [] };
    onShow = (e) => {
        e.preventDefault();
        const teachers = this.props.course.teacherGroups.reduce((result, item) => item.teacher.division._id == this.props.division._id ? [...result, item.teacher] : result, []);
        teachers.forEach(i => i.isSelected = false);
        this.setState({ teachers });
    };

    onClick = (e, _id, index) => {
        e.preventDefault();
        const teachers = this.state.teachers;
        teachers.forEach(i => i.isSelected = false);
        teachers[index].isSelected = true;
        this.setState({ teachers, _id });
    }

    onSubmit = () => {
        if (this.state._id) {
            const { _id } = this.props.course;
            this.props.add(_id, this.state._id, this.props.student._id, 'add', () => {
                this.props.getStudentCourse({ course: _id });
                this.hide();
            });
        } else {
            T.notify('Chưa chọn cố vấn học tập', 'danger');
        }
    }

    render = () => {
        const teachers = this.state.teachers.map((item, index) =>
            <li className={this.state.teachers[index].isSelected && 'text-primary'} style={{ margin: 10 }} key={index}>
                <a onClick={e => this.onClick(e, item._id, index)}>
                    {`${item.lastname} ${item.firstname}`}
                </a>
            </li>);
        return this.renderModal({
            title: 'Gán cố vấn học tập',
            body: <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}> {teachers.length ? teachers : 'Không có thông tin'} </ol>
        });
    };
}
class AdminTeacherView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.course && this.props.course.item && this.props.getStudentCourse({ course: this.props.course.item._id });
    }

    addTeacher = e => {
        e.preventDefault();
        const { _id, teacherGroups = [] } = this.props.course.item,
            _teacherId = this.selectTeacher.value();
        if (_teacherId && teacherGroups.find(({ teacher }) => teacher._id == _teacherId) == null) {
            this.props.updateCourseTeacherGroup(_id, _teacherId, 'add', () => this.selectTeacher.value(null));
        } else {
            T.notify('Bạn chọn trùng cố vấn học tập', 'danger');
        }
    };

    removeTeacher = (e, teacher) => e.preventDefault() || T.confirm('Xoá Cố vấn học tập', `Bạn có chắc muốn xoá ${teacher.lastname} ${teacher.firstname} khỏi khóa học này?`, true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id } = this.props.course.item;
            this.props.updateCourseTeacherGroup(_id, teacher._id, 'remove', () => {
                this.props.getStudentCourse({ course: _id });
            });
        }
    });

    removeStudent = (e, teacher, student) => {
        e.preventDefault();
        const { _id } = this.props.course.item;
        this.props.updateCourseTeacherGroupStudent(_id, teacher._id, student._id, 'remove', () => {
            this.props.getStudentCourse({ course: _id });
        });
    }

    render() {
        const permission = this.props.permission,
            permissionTeacherWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);
        const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList.teachers : [];
        const _id = this.props.course && this.props.course.item ? this.props.course.item._id : null;
        const teacherGroups = this.props.course && this.props.course.item ? this.props.course.item.teacherGroups : [];
        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Học viên chưa gán Cố vấn học tập</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse({ course: _id }, e.target.value)} />
                        {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {courseList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _id && this[`modal${item._id}`].show(e)}>
                                        {`${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division && item.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                    </a>
                                    <TeacherModal ref={e => this[`modal${item._id}`] = e} readOnly={!permission.write} add={this.props.updateCourseTeacherGroupStudent}
                                        course={this.props.course.item} division={item.division} student={item} getStudentCourse={this.props.getStudentCourse} />
                                </li>))}
                        </ol> : <label>Chưa có học viên!</label>}
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Danh sách Cố vấn học tập</h3>
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
const mapActionsToProps = { getCourse, getStudentCourse, updateCourseTeacherGroup, updateCourseTeacherGroupStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherView);
