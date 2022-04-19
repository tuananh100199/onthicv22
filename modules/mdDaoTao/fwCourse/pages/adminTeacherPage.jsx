import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateStudentInfoInCourse, updateCourseTeacherGroup, updateCourseTeacherGroupStudent, updateAutoCourseTeacherGroupStudent, exportTeacherAndStudentToExcel } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, CirclePageButton, FormSelect, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import AdminStudentModal from '../adminStudentModal';
import {ajaxSelectTeacherByCourseType} from 'modules/_default/fwTeacher/redux';
class AssignModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemMaxStudent.focus()));
    }

    onShow = () => {
        this.itemMaxStudent.value(30);
    }

    onSubmit = () => {
        const maxStudent = this.itemMaxStudent.value();
        if (maxStudent == '') {
            T.notify('Vui lòng nhập số lượng học viên tối đa cho một cố vấn!', 'danger');
            this.itemMaxStudent.focus();
        } else {
            this.props.handleAutoAssignStudent(Number(maxStudent));
            this.hide();
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Số lượng học viên tối đa cho một cố vấn',
            body: <FormTextBox ref={e => this.itemMaxStudent = e} label='Số lượng' type='number' min='0' max='200' onChange={this.onChangeScore} />
        });
    }
}
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
            T.notify('Chưa chọn Giáo viên', 'danger');
        }
    }

    render = () => {
        const { teachers } = this.state;
        return this.renderModal({
            title: 'Gán Giáo viên',
            body: teachers && teachers.length ?
                <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                    {teachers.map((teacher, index) =>
                        <li style={{ margin: 10 }} key={index}>
                            <a href='#' onClick={e => this.onClick(e, teacher._id, index)} style={teachers[index].isSelected ? { color: '#1488db', fontWeight: 'bold', fontStyle: 'italic' } : { color: 'black' }}>
                                {teacher.lastname} {teacher.firstname} - {teacher.division ? teacher.division.title : ''}
                            </a>
                        </li>)
                    }
                </ol> : 'Không có Giáo viên',
        });
    }
}

class RemoveTeacherCourseModal extends AdminModal {
    state = { showSubmitBtn: false,checkValue:''};
    componentDidMount() {
        T.ready(() => this.onShown(() => {}));
    }

    onShow = (teacher)=>{
        this.setState({teacher});
    }

    checkOther = (item) => {
        if(item && item != ''){
            $('#khac').prop('checked',true);
            this.setState({showSubmitBtn:true});
        } else{
            $('#khac').prop('checked',false);
            this.setState({showSubmitBtn:false});
        }
    }

    checked = (checkValue) =>{
        this.setState({showSubmitBtn: true,checkValue});
    }

    getValueRemove = ()=>{
        switch (this.state.checkValue) {
            case 'nhamKhoa':
                return 'Chọn nhầm khóa';
        
            case 'khac':
                return this.itemLyDo.value();
            
            default:
                return '';
        }
    }

    render = () => this.renderModal({
        title: 'Huỷ đi khóa giáo viên',
        dataBackdrop: 'static',
        body: (
            <div>
                <div className='tile-body'>
                    <div><b>Chọn lý do huỷ đi khóa cho giáo viên:</b></div>
                    <div className='form-check'>
                        <input className='form-check-input' type='radio' name='lyDo' id='nhamKhoa' onChange={()=>this.checked('nhamKhoa')}/>
                        <label className='form-check-label' htmlFor='doiGoi'>
                            Gán nhầm khóa
                        </label>
                    </div>
                    <div className='form-check' style={{width:'100%'}}>
                        <input className='form-check-input' type='radio' name='lyDo' id='khac' onChange={()=>this.checked('khac')}/>
                        <label className='form-check-label' htmlFor='khac'>
                            Khác:
                            <FormTextBox ref={e => this.itemLyDo = e} style={{width:'100%'}} onChange={e => this.checkOther(e.target.value)} type='text' readOnly={false} />
                        </label>
                    </div>
                </div>
            </div>),
        buttons:
        this.state.showSubmitBtn ? <button className='btn btn-danger' style={{ textAlign: 'right' }}
            onClick={() => {
                this.props.course && this.props.course.item && this.props.update(this.props.course.item._id,this.state.teacher._id, 'remove',this.getValueRemove(),()=>{
                    this.hide();
                });
            }}
        >Xác nhận huỷ đi khóa</button> : null
    });
}

class AdminTeacherPage extends AdminPage {
    state = { searchStudentText: '', outsideStudentVisible: true, sortType: 'division', assignedButtonVisible: false }; // sortType = name | division
    students = {};
    itemDivisionSelectAll = {};
    itemDivisionDeSelectAll = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/teacher').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    addTeacher = e => {
        e.preventDefault();
        // const { _id, teacherGroups = [] } = this.props.course.item,
        //     _teacherId = this.selectTeacher.value();
        // if (_teacherId && teacherGroups.find(({ teacher }) => teacher && (teacher._id == _teacherId)) == null) {
        //     this.props.updateCourseTeacherGroup(_id, _teacherId, 'add', () => this.selectTeacher.value(null));
        // } else {
        //     T.notify('Bạn chọn trùng giáo viên', 'danger');
        // }

        const { _id, teacherGroups = [] } = this.props.course.item,
            _teacherUserId = this.selectTeacher.value().split(':')[1];
        if (_teacherUserId && teacherGroups.find(({ teacher }) => teacher && (teacher._id == _teacherUserId)) == null) {
            this.props.updateCourseTeacherGroup(_id, _teacherUserId, 'add', () => this.selectTeacher.value(null));
        } else {
            T.notify('Bạn chọn trùng giáo viên', 'danger');
        }
    }
    removeTeacher = (e, teacher) => e.preventDefault() || T.confirm('Xoá Giáo viên', `Bạn có chắc muốn xoá ${teacher.lastname} ${teacher.firstname} khỏi khóa học này?`, true, isConfirm =>
        isConfirm && this.cancelModal.show(teacher));
        // this.props.course && this.props.course.item && this.props.updateCourseTeacherGroup(this.props.course.item._id, teacher._id, 'remove'));

    removeStudent = (e, teacher, student) => e.preventDefault() || T.confirm('Xoá học viên', `Bạn có chắc muốn xoá học viên '${student.lastname} ${student.firstname}' khỏi giáo viên '${teacher.lastname} ${teacher.firstname}'?`, true, isConfirm =>
        isConfirm && this.props.updateCourseTeacherGroupStudent(this.props.course.item._id, teacher._id, [student._id], 'remove'));

    showStudentInfo = (e, student) => e.preventDefault() || this.studentModal.show(student);

    updateStudent = (studentId, changes) => this.props.updateStudent(studentId, changes, (data) => {
        data && this.props.updateStudentInfoInCourse(studentId, data);
    });

    selectDivisionStudents = (_divisionId, selected) => {
        this.itemDivisionSelectAll[_divisionId] && this.itemDivisionSelectAll[_divisionId].value(true);
        this.itemDivisionDeSelectAll[_divisionId] && this.itemDivisionDeSelectAll[_divisionId].value(false);

        const { students } = this.props.course && this.props.course.item ? this.props.course.item : {};
        (students || []).forEach(item =>
            item.division && this.students[item._id] && this.students[item._id].value(selected && item.division._id == _divisionId));

        this.setState({ _divisionId, assignedButtonVisible: selected });
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

    handleAutoAssignStudent = (maxStudent) => {
        let { _id, teacherGroups = [], students = [] } = this.props.course.item;
        const assignedStudents = [];
        (teacherGroups || []).forEach(item => (item.student || []).forEach(student => assignedStudents.push(student._id)));
        const isValidStudent = (student) => !assignedStudents.includes(student._id) && student.division && (!student.division.isOutside || this.state.outsideStudentVisible);
        let autoAssignStudents = students.filter(student => isValidStudent(student)).sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));

        const teacherGroupsUpdate = teacherGroups.map(teacherGroup => {
            const _teacherId = teacherGroup && teacherGroup.teacher ? teacherGroup.teacher._id : null;
            let listStudentOfTeacher = [];
            autoAssignStudents.forEach(student => {
                if (student && _teacherId && student.planLecturer == _teacherId) {
                    listStudentOfTeacher.push(student._id);
                }
            });
            const numberAddStudentIds = maxStudent - Number(teacherGroup.student.length);
            const _studentIds = listStudentOfTeacher.splice(0, numberAddStudentIds);
            if (numberAddStudentIds > 0 && _studentIds.length > 0) {
                return { _teacherId, _studentIds };
            }
        });

        this.props.updateAutoCourseTeacherGroupStudent(_id, teacherGroupsUpdate.filter(item => item), 'add', () => T.notify('Gán tự động học viên thành công', 'success'));
    }

    render() {
        const permission = this.getUserPermission('course'),
            item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] },
            currentUser = this.props.system ? this.props.system.user : null,
            permissionTeacherWrite = permission.write || (currentUser && currentUser.isCourseAdmin);
        const isOutsideCourseAdmin = currentUser && currentUser.isCourseAdmin && currentUser.division && currentUser.division.isOutside ? true : false;
        let { _id: _courseId, students, teacherGroups,courseType } = this.props.course && this.props.course.item ? this.props.course.item : {};
        let { searchStudentText, outsideStudentVisible, sortType, assignedButtonVisible } = this.state,
            studentList = [], assignedStudents = [];
        outsideStudentVisible = outsideStudentVisible || isOutsideCourseAdmin;
        (teacherGroups || []).forEach(item => (item.student || []).forEach(student => assignedStudents.push(student._id)));

        const isValidStudent = (student) => (searchStudentText == '' || (student.lastname + ' ' + student.firstname).toLowerCase().includes(searchStudentText)) && !assignedStudents.includes(student._id) && student.division && (!student.division.isOutside || outsideStudentVisible);
        if (!students) students = [];
        if (sortType == 'name') {
            students.forEach((student, index) => {
                if (isValidStudent(student)) {
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
        } else {
            const divisionContainer = {};
            students.forEach(student => {
                if (isValidStudent(student)) {
                    if (!divisionContainer[student.division._id]) divisionContainer[student.division._id] = Object.assign({}, student.division);
                    const division = divisionContainer[student.division._id];
                    if (division.students == null) division.students = [];
                    division.students.push(student);
                }
            });

            Object.values(divisionContainer).sort((a, b) => a.title - b.title).forEach((division, index) => {
                studentList.push(
                    <li style={{ margin: 0, display: 'block' }} key={index}>
                        <div style={{ display: 'inline-flex' }}>
                            <h5>{studentList.length + 1}. {division.title} {division.isOutside ? ' (cơ sở ngoài)' : ''}</h5>
                            <div className='buttons'>
                                <FormCheckbox ref={e => this.itemDivisionSelectAll[division._id] = e} label='Chọn tất cả' onChange={() => this.selectDivisionStudents(division._id, true)} style={{ display: 'inline-block' }} defaultValue={true} />
                                <FormCheckbox ref={e => this.itemDivisionDeSelectAll[division._id] = e} label='Không chọn tất cả' onChange={() => this.selectDivisionStudents(division._id, false)} style={{ display: 'inline-block', marginLeft: 12 }} defaultValue={false} />
                            </div>
                        </div>
                        <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                            {division.students.map((student, index) => (
                                <li style={{ margin: 0, display: 'block' }} key={index}>
                                    <div style={{ display: 'inline-flex' }}>
                                        <FormCheckbox ref={e => this.students[student._id] = e} style={{ display: 'inline-block' }} onChange={value => this.selectOneStudent(student, value)}
                                            label={`${studentList.length + 1}. ${student.lastname} ${student.firstname} (${student.identityCard})`} />
                                        <div className='buttons'>
                                            <a href='#' onClick={e => this.showAssignedModal(e, this.props.course.item, student)}>
                                                <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                                            </a>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </li>);
            });
        }

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-user-circle',
            title: 'Gán Giáo viên: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Gán Giáo viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
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
                                <div style={{ display: studentList.length ? 'block' : 'none' }}>
                                    <a href='#' onClick={e => this.showAssignedModal(e, this.props.course.item)} style={{ float: 'right', color: 'black', display: assignedButtonVisible ? 'block' : 'none' }}>
                                        Gán <i style={{ marginLeft: 5, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                                    </a>
                                </div>
                                {studentList.length ? <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>{studentList}</ul> : <label>Danh sách trống!</label>}
                            </div>
                            <TeacherModal ref={e => this.modal = e} readOnly={!permission.write} add={this.props.updateCourseTeacherGroupStudent} onSuccess={this.onAssignSuccess} />
                        </div>

                        <div className='col-md-6'>
                            <h3 className='tile-title'>Giáo viên</h3>
                            <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                                <label>Tìm kiếm giáo viên</label>
                                <div style={{ display: permissionTeacherWrite ? 'flex' : 'none' }}>
                                    {/* <FormSelect ref={e => this.selectTeacher = e} data={ajaxSelectUserType(['isLecturer'])} style={{ width: '100%' }} /> */}
                                    <FormSelect ref={e => this.selectTeacher = e} data={ajaxSelectTeacherByCourseType(courseType?courseType._id:'',0)} style={{ width: '100%' }} />
                                    <div style={{ width: 'auto', paddingLeft: 8 }}>
                                        <button className='btn btn-success' type='button' onClick={this.addTeacher}><i className='fa fa-fw fa-lg fa-plus' /></button>
                                    </div>
                                </div>
                                {teacherGroups && teacherGroups.length ?
                                    <ol className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                                        {teacherGroups.map((item, index) => item.teacher ?
                                            <li className='text-primary' style={{ margin: 10 }} key={index}>
                                                <div style={{ display: 'inline-flex' }}>
                                                    <h5>
                                                        {item.teacher.lastname} {item.teacher.firstname} - {item.teacher.division && item.teacher.division.title}&nbsp;
                                                        {item.teacher.division.isOutside ? <span className='text-secondary'>(cơ sở ngoài)</span> : ''}
                                                    </h5>
                                                    <div className='buttons'>
                                                        <a href='#' onClick={e => _courseId && this.removeTeacher(e, item.teacher)}>
                                                            <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-times text-danger' />
                                                        </a>
                                                    </div>
                                                </div>
                                                <ul style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                                    {item.student.length ? item.student.map((student, indexStudent) => (
                                                        <li key={indexStudent} style={{ margin: 10, color: 'black' }}>
                                                            <div style={{ display: 'inline-flex' }}>
                                                                <a href='#' style={{ color: 'black' }} onClick={e => this.showStudentInfo(e, student)}>
                                                                    {student.lastname} {student.firstname} ({student.identityCard}) - {student.division && student.division.title}&nbsp;
                                                                    {student.division && student.division.isOutside ? <span className='text-secondary'>(cơ sở ngoài)</span> : ''}
                                                                </a>
                                                                <div className='buttons'>
                                                                    <a href='#' onClick={e => _courseId && this.removeStudent(e, item.teacher, student)}>
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
                        {!isOutsideCourseAdmin ? <CirclePageButton type='custom' customClassName='btn-primary' style={{ marginRight: '55px' }} customIcon='fa fa-arrow-right' onClick={e => e.preventDefault() || this.autoAssignmodal.show()} /> : null}
                        {!isOutsideCourseAdmin ? <CirclePageButton type='export' onClick={() => exportTeacherAndStudentToExcel(_courseId)} /> : null}
                        <AssignModal ref={e => this.autoAssignmodal = e} handleAutoAssignStudent={this.handleAutoAssignStudent} />
                        <AdminStudentModal ref={e => this.studentModal = e} updateStudent={this.updateStudent} />
                        <RemoveTeacherCourseModal  readOnly={true} update={this.props.updateCourseTeacherGroup } ref={e => this.cancelModal = e} course={this.props.course} />
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateStudentInfoInCourse, updateCourseTeacherGroup, updateCourseTeacherGroupStudent, updateAutoCourseTeacherGroupStudent, updateStudent, exportTeacherAndStudentToExcel };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherPage);