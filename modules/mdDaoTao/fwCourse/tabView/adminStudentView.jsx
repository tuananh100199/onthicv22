import React from 'react';
import { connect } from 'react-redux';
import { updateCourseStudents, updateStudentInfoInCourse, exportStudentInfoToExcel } from '../redux';
import { getPreStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { CirclePageButton, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import AdminStudentModal from '../adminStudentModal';

class AdminStudentView extends React.Component {
    state = { searchPreStudentText: '', searchPreStudentCourse: '', searchStudentText: '', sortType: 'name', assignedButtonVisible: false }; // sortType = name | division
    preStudents = {};
    componentDidMount() {
        this.onSearch({}, { division: 0 });
    }

    onSearch = ({ pageNumber, pageSize, searchText, searchPlanCourse }, sort, done) => {
        if (searchText == undefined) searchText = this.state.searchPreStudentText;
        if (searchPlanCourse == undefined) searchPlanCourse = this.state.searchPreStudentCourse;
        if (sort == undefined) sort = { lastname: 1, firstname: 1 };
        if (sort.division == undefined) sort.division = this.state.sortType == 'division' ? 1 : 0;
        this.props.getPreStudentPage(pageNumber, pageSize, { searchText, searchPlanCourse, courseType: this.props.courseType && this.props.courseType._id }, sort, () => {
            this.setState({
                searchPreStudentText: searchText,
                searchPreStudentPlanCourse: searchPlanCourse,
                sortType: sort.division ? 'division' : 'name',
                assignedButtonVisible: false,
            });
            done && done();
        });
    }

    selectOnePreStudent = () => this.setState({ assignedButtonVisible: Object.keys(this.preStudents).filter(_preStudentId => this.preStudents[_preStudentId] && this.preStudents[_preStudentId].value()).length > 0 });
    selectManyPreStudents = selected => {
        this.itemSelectAll.value(true);
        this.itemDeSelectAll.value(false);
        Object.keys(this.preStudents).forEach(_id => this.preStudents[_id] && this.preStudents[_id].value(selected));
        this.setState({ assignedButtonVisible: selected });
    }

    addCourseStudents = (e, _courseId, preStudent) => {
        e.preventDefault();
        preStudent && this.preStudents[preStudent._id].value(true);
        const _studentIds = [];
        Object.keys(this.preStudents).forEach(_studentId => {
            if (!this.preStudents[_studentId]) {
                delete this.preStudents[_studentId];
            } else if (this.preStudents[_studentId].value()) {
                _studentIds.push(_studentId);
                this.preStudents[_studentId].value(false);
            }
        });

        preStudent && !_studentIds.includes(preStudent._id) && _studentIds.push(preStudent._id);
        _studentIds.length && this.props.updateCourseStudents(_courseId, _studentIds, 'add', () => this.onSearch({}));
    }

    removeCourseStudent = (e, student) => e.preventDefault() || T.confirm('Xoá Học viên', `Bạn có chắc muốn xoá ${student.lastname} ${student.firstname} khỏi khóa học này?`, true, isConfirm => {
        isConfirm && this.props.updateCourseStudents(student.course._id, [student._id], 'remove', () => this.onSearch({}));
    });

    showStudentInfo = (e, student) => e.preventDefault() || this.modal.show(student);

    updateStudent = (studentId, changes) => {
        this.props.updateStudent(studentId, changes, (data) => {
            data && this.props.updateStudentInfoInCourse(studentId, data);
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list: preStudentList } = this.props.student && this.props.student.prePage ?
            this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const { sortType, searchStudentText, assignedButtonVisible } = this.state;
        const { _id: _courseId, students } = this.props.course && this.props.course.item ? this.props.course.item : {};
        const studentList = [];
        // const currentUser = this.props.system ? this.props.system.user : null,
        //     isOutsideCourseAdmin = currentUser && currentUser.isCourseAdmin && currentUser.division && currentUser.division.isOutside ? true : false;

        (students || []).forEach((student, index) => {
            if (searchStudentText == '' || (student.lastname + ' ' + student.firstname).toLowerCase().includes(searchStudentText)) {
                studentList.push(
                    <li style={{ margin: 10, display: 'block' }} key={index}>
                        <div style={{ display: 'inline-flex' }}>
                            <a href='#' style={{ color: 'black' }} onClick={e => this.showStudentInfo(e, student)}>
                                {studentList.length + 1}. {student.lastname} {student.firstname}&nbsp;
                                ({student.identityCard}) - {student.division && student.division.title} {student.division && student.division.isOutside ? ' (cơ sở ngoài)' : ''}
                            </a>
                            <div className='buttons'>
                                <a href='#' onClick={e => this.removeCourseStudent(e, student)}>
                                    <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-times text-danger' />
                                </a>
                            </div>
                        </div>
                    </li>);
            }
        });

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <div style={{ float: 'right', marginTop: 8, marginRight: 8 }}>Sắp xếp theo:&nbsp;
                        <a className={sortType == 'name' ? ' text-warning' : 'text-secondary'} href='#' onClick={e => e.preventDefault() || this.onSearch({ pageNumber, pageSize }, { division: 0, lastname: 1, firstname: 1 })}>
                            Tên
                        </a> |&nbsp;
                        <a className={sortType == 'division' ? ' text-warning' : 'text-secondary'} href='#' onClick={e => e.preventDefault() || this.onSearch({ pageNumber, pageSize }, { division: 1, lastname: 1, firstname: 1 })}>
                            Cơ sở
                        </a>
                    </div>

                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox label='Tìm kiếm ứng viên theo họ tên' onChange={e => this.onSearch({ searchText: e.target.value })} />
                        <FormTextBox label='Tìm kiếm ứng viên theo khoá dự kiến' onChange={e => this.onSearch({ searchPlanCourse: e.target.value })} />
                        <div style={{ display: preStudentList.length ? 'block' : 'none' }}>
                            <FormCheckbox ref={e => this.itemSelectAll = e} label='Chọn tất cả' onChange={() => this.selectManyPreStudents(true)} style={{ display: 'inline-block' }} defaultValue={true} />
                            <FormCheckbox ref={e => this.itemDeSelectAll = e} label='Không chọn tất cả' onChange={() => this.selectManyPreStudents(false)} style={{ display: 'inline-block', marginLeft: 12 }} defaultValue={false} />
                            <a href='#' onClick={e => this.addCourseStudents(e, _courseId)} style={{ float: 'right', color: 'black', display: assignedButtonVisible ? 'block' : 'none' }}>
                                Gán <i style={{ marginLeft: 5, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                            </a>
                        </div>

                        {preStudentList.length ?
                            <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 450px)' }}>
                                {preStudentList.map((preStudent, index) =>
                                    <li style={{ margin: 0, display: 'block' }} key={index}>
                                        <div style={{ display: 'inline-flex' }}>
                                            <FormCheckbox ref={e => this.preStudents[preStudent._id] = e} style={{ display: 'inline-block' }} onChange={this.selectOnePreStudent}
                                                label={<>{index + 1}. {preStudent.lastname} {preStudent.firstname} ({preStudent.identityCard}) - {preStudent.division && preStudent.division.title} {preStudent.division && preStudent.division.isOutside ? ' (cơ sở ngoài)' : ''} =&gt; Khoá dự kiến <span className='text-danger'>{preStudent.planCourse}</span></>} />
                                            <div className='buttons'>
                                                <a href='#' onClick={e => this.addCourseStudents(e, _courseId, preStudent)}>
                                                    <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                )}
                            </ul> : 'Không có ứng viên!'}
                        <Pagination name='adminPreStudent' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                            pageCondition={pageCondition} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
                    </div>
                </div>

                <div className='col-md-6'>
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.setState({ searchStudentText: e.target.value })} />
                        {studentList.length ? <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>{studentList}</ul> : <label>Danh sách trống!</label>}
                    </div>
                </div>
                {/* {!isOutsideCourseAdmin ? <CirclePageButton type='export' onClick={() => exportStudentInfoToExcel(_courseId)} /> : null} */}
                <CirclePageButton type='export' onClick={(e) => e.preventDefault()} />
                <AdminStudentModal ref={e => this.modal = e} permission={this.props.permissionCourse} updateStudent={this.updateStudent} />
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { updateCourseStudents, getPreStudentPage, updateStudent, updateStudentInfoInCourse, exportStudentInfoToExcel };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
