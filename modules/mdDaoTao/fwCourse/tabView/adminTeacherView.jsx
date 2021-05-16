import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourseTeacherGroup, updateCourseTeacherGroupStudent } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { getStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import { FormSelect, FormTextBox, AdminModal } from 'view/component/AdminPage';

class TeacherModal extends AdminModal {
    onShow = (e) => {
        e.preventDefault();
    };

    addStudent = (e, _teacherId) => {
        e.preventDefault();
        this.props.add(this.props.course._id, _teacherId, this.props.student._id, 'add', () => {
            this.hide();
        });
    }

    // onSubmit = () => {
    //     const _teacherId = this.teacherSelect.value();
    //     if (!_teacherId) {
    //         T.notify('Giáo viên không được trống!', 'danger');
    //     } else {
    //         const { _id, groups = [] } = this.props.course,
    //             index = groups.findIndex(item => item.teacher._id == _teacherId);
    //         const _studentIds = this.props.students.map(item => item._id).filter((item, idx, arr) => arr.indexOf(item) == idx);
    //         _studentIds.forEach(item => groups[index].student.push(item));
    //         _studentIds.forEach(item => this.props.updateStudent(item, { course: _id }));
    //         this.props.add(_id, { groups }, () => {
    //             T.notify('Thêm ứng viên vào nhóm thành công!');
    //             this.hide();
    //         });
    //     }
    // }

    render = () => {
        const teachers = this.props.course.teacherGroups.reduce((result, item, index) => item.teacher.division._id == this.props.division._id ?
            [...result,
            <li style={{ margin: 10 }} key={index}>
                <a href='#' style={{ color: 'black' }} onClick={e => this.addStudent(e, item.teacher._id)}>
                    {`${item.teacher.lastname} ${item.teacher.firstname}`}
                </a>
            </li>
            ] : result, []);
        return this.renderModal({
            title: 'Gán cố vấn học tập',
            body: <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}> {teachers.length ? teachers : 'Không có thông tin'} </ol>
        });
    };
}
class AdminTeacherView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.course && this.props.course.item && this.props.getStudentCourse(this.props.course.item._id);
    }

    addTeacher = e => {
        e.preventDefault();
        const { _id, teacherGroups = [] } = this.props.course.item,
            _teacherId = this.selectTeacher.value();
        if (_teacherId && teacherGroups.find(({ teacher }) => teacher._id == _teacherId) == null) {
            this.props.updateCourseTeacherGroup(_id, _teacherId, 'add');
        }
    };

    removeTeacher = (e, teacher) => e.preventDefault() || T.confirm('Xoá Cố vấn học tập', 'Bạn có chắc muốn xoá Cố vấn học tập khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id } = this.props.course.item;
            this.props.updateCourseTeacherGroup(_id, teacher._id, 'remove');
        }
    });

    removeStudent = (e, teacher, student) => {
        e.preventDefault();
        this.props.updateCourseTeacherGroupStudent(this.props.course.item._id, teacher._id, student._id, 'remove');
    }

    render() {
        const permission = this.props.permission,
            permissionTeacherWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);
        const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList : [];
        const { _id, teacherGroups } = this.props.course ? this.props.course.item : null;
        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Học viên</h3>
                    {/* <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <h5>Học viên thuộc cơ sở Hiệp Phát</h5>
                    </div> */}
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse(this.props.course.item._id, e.target.value)} />
                        {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {courseList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _id && this[`modal${item._id}`].show(e)}>
                                        {`${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'> ( cơ sở ngoài )</span> : ''}
                                    </a>
                                    <TeacherModal ref={e => this[`modal${item._id}`] = e} readOnly={!permission.write} add={this.props.updateCourseTeacherGroupStudent}
                                        course={this.props.course.item} division={item.division}
                                        student={item}
                                    // students={this.state.studentSelecteds.filter(item1 => item._id == item1.division._id)}
                                    />
                                </li>))}
                        </ol> : 'Không có thông tin'}
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Cố vấn học tập</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <div style={{ display: permissionTeacherWrite ? 'flex' : 'none' }}>
                            <FormSelect ref={e => this.selectTeacher = e} data={ajaxSelectUserType(['isLecturer'])} style={{ width: '100%' }} />
                            <div style={{ width: 'auto', paddingLeft: 8 }}>
                                <button className='btn btn-success' type='button' onClick={this.addTeacher}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Cố vấn học tập
                            </button>
                            </div>
                        </div>
                        {teacherGroups.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 391px)' }}>
                            {teacherGroups.map((item, index) =>
                                item.teacher && <li style={{ margin: 10 }} key={index}>
                                    <a href='#' className='text-primary' onClick={e => _id && this.removeTeacher(e, item.teacher)}>
                                        {`${item.teacher.lastname} ${item.teacher.firstname}`} - {item.teacher.division && item.teacher.division.title}{item.teacher.division.isOutside ? <span className='text-secondary'> ( cơ sở ngoài )</span> : ''}
                                    </a>
                                    <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                        {item.student.length ? item.student.map((student, indexStudent) => (
                                            <li key={indexStudent} style={{ margin: 10 }}>
                                                <a href='#' style={{ color: 'black' }} onClick={e => _id && this.removeStudent(e, item.teacher, student)}>
                                                    {`${student.lastname} ${student.firstname}`} - {student.division && student.division.title}{student.division.isOutside ? <span className='text-secondary'> ( cơ sở ngoài )</span> : ''}
                                                </a>
                                            </li>
                                        )) : 'Chưa có học viên'}
                                    </ol>
                                </li>
                            )}
                        </ol> : 'Không có thông tin'}
                    </div>
                    {/* <h5>Nhóm học viên thuộc cơ sở Hiệp Phát</h5> */}
                </div>
                {/* <CirclePageButton type='export' onClick={exportScore(this.props.course && this.props.course.item && this.props.course.item._id)} /> */}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { getCourse, getStudentCourse, updateCourseTeacherGroup, updateCourseTeacherGroupStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherView);
