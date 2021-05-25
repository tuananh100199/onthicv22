import React from 'react';
import { connect } from 'react-redux';
import { updateCourseStudents } from '../redux';
import { getPreStudentPage } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class AdminStudentView extends React.Component {
    state = { searchPreStudentText: '', searchStudentText: '', sortType: 'name', assignedButtonVisible: false }; // sortType = name | division
    preStudents = {};
    componentDidMount() {
        this.onSearch({});
    }

    onSearch = ({ pageNumber, pageSize, searchText }, sort, done) => {
        if (searchText == undefined) searchText = this.state.searchPreStudentText;
        if (sort == undefined) sort = { lastname: 1, firstname: 1 };
        if (this.state.sortType == 'division') sort.division = 1;
        this.props.getPreStudentPage(pageNumber, pageSize, { searchText, courseType: this.props.courseType && this.props.courseType._id }, sort, (page) => {
            this.preStudents = {}; // Xoá hết các chọn trước khi search
            console.log('this.preStudents', this.preStudents)
            this.setState({ searchPreStudentText: searchText, sortType: sort.division ? 'division' : 'name' });
            done && done();
        });
    }

    selectOnePreStudent = () => this.setState({ assignedButtonVisible: Object.keys(this.preStudents).filter(_preStudentId => this.preStudents[_preStudentId].value()).length > 0 });
    selectManyPreStudents = selected => {
        this.itemSelectAll.value(true);
        this.itemDeSelectAll.value(false);
        Object.keys(this.preStudents).forEach(_id => this.preStudents[_id].value(selected));
        this.setState({ assignedButtonVisible: selected });
    }

    addCourseStudents = (e, _courseId, preStudent) => {
        e.preventDefault();
        preStudent && this.preStudents[preStudent._id].value(true);
        const _studentIds = Object.keys(this.preStudents).filter(_studentId => this.preStudents[_studentId] && this.preStudents[_studentId].value());
        preStudent && !_studentIds.includes(preStudent._id) && _studentIds.push(preStudent._id);
        _studentIds.length && this.props.updateCourseStudents(_courseId, _studentIds, 'add', () => this.onSearch({}));
    }

    removeCourseStudent = (e, student) => e.preventDefault() || T.confirm('Xoá Học viên', `Bạn có chắc muốn xoá ${student.lastname} ${student.firstname} khỏi khóa học này?`, true, isConfirm => {
        isConfirm && this.props.updateCourseStudents(student.course._id, [student._id], 'remove', () => this.onSearch({}));
    });

    render() {
        const { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list: preStudentList } = this.props.student && this.props.student.prePage ?
            this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const { sortType, searchStudentText, assignedButtonVisible } = this.state;
        const { _id: _courseId, students } = this.props.course && this.props.course.item ? this.props.course.item : {};
        const studentList = [];

        (students || []).forEach((student, index) => {
            if ((searchStudentText == '' || (student.lastname + ' ' + student.firstname).toLowerCase().includes(searchStudentText))) {
                studentList.push(
                    <li style={{ margin: 0, display: 'block' }} key={index}>
                        <div style={{ display: 'inline-flex' }}>
                            {studentList.length + 1}. {student.lastname} {student.firstname} ({student.identityCard}) - {student.division && student.division.title} {student.division && student.division.isOutside ? ' (cơ sở ngoài)' : ''}
                            <div className='buttons'>
                                <a href='#' onClick={e => this.removeCourseStudent(e, student)}>
                                    <i style={{ marginLeft: 10, fontSize: 20 }} className='fa fa-times text-danger' />
                                </a>
                            </div>
                        </div>
                    </li>)
            }
        });

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <div style={{ float: 'right', marginTop: 8, marginRight: 8 }}>Sắp xếp theo:&nbsp;
                        <a className={sortType == 'name' ? ' text-primary' : 'text-secondary'} href='#' onClick={e => e.preventDefault() || this.onSearch({ pageNumber, pageSize }, { lastname: 1, firstname: 1 })}>
                            Tên
                        </a> |&nbsp;
                        <a className={sortType == 'division' ? ' text-primary' : 'text-secondary'} href='#' onClick={e => e.preventDefault() || this.onSearch({ pageNumber, pageSize }, { division: 1, lastname: 1, firstname: 1 })}>
                            Cơ sở
                        </a>
                    </div>

                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBoxPre = e} label='Tìm kiếm ứng viên' onChange={e => this.onSearch({ searchText: e.target.value })} />
                        <div style={{ display: preStudentList.length ? 'block' : 'none' }}>
                            <FormCheckbox ref={e => this.itemSelectAll = e} label='Chọn tất cả' onChange={() => this.selectManyPreStudents(true)} style={{ display: 'inline-block' }} defaultValue={true} />
                            <FormCheckbox ref={e => this.itemDeSelectAll = e} label='Không chọn tất cả' onChange={() => this.selectManyPreStudents(false)} style={{ display: 'inline-block', marginLeft: 12 }} defaultValue={false} />
                            <a href='#' onClick={e => this.addCourseStudents(e, _courseId)} style={{ float: 'right', color: 'black', display: assignedButtonVisible ? 'block' : 'none' }}>
                                Trở thành Học viên <i style={{ marginLeft: 5, fontSize: 20 }} className='fa fa-arrow-right text-success' />
                            </a>
                        </div>

                        {preStudentList.length ?
                            <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 450px)' }}>
                                {preStudentList.map((preStudent, index) =>
                                    <li style={{ margin: 0, display: 'block' }} key={index}>
                                        <div style={{ display: 'inline-flex' }}>
                                            <FormCheckbox ref={e => this.preStudents[preStudent._id] = e} style={{ display: 'inline-block' }} onChange={this.selectOnePreStudent}
                                                label={`${index + 1}. ${preStudent.lastname} ${preStudent.firstname} (${preStudent.identityCard}) - ${preStudent.division && preStudent.division.title} ${preStudent.division && preStudent.division.isOutside ? ' (cơ sở ngoài)' : ''}`} />
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
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { updateCourseStudents, getPreStudentPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);