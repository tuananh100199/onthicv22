import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { getPreStudentPage, getStudentCourse, updateStudentCourse, removeStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class AdminStudentView extends React.Component {
    state = { searchText: '', sortType: 'name', students: {} }; // name | division

    componentDidMount() {
        this.onSearch({});
        this.props.course && this.props.course.item && this.props.getStudentCourse({ course: this.props.course.item._id });
    }

    onSearch = ({ pageNumber, pageSize, searchText }, sort, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        if (sort == undefined) {
            sort = { lastname: 1, firstname: 1 };
            if (this.state.sortType == 'division') sort.division = 1;
        }
        this.props.getPreStudentPage(pageNumber, pageSize, { searchText, courseType: this.props.courseType && this.props.courseType._id }, sort, (page) => {
            this.itemSelectAll && this.itemSelectAll.value(false);
            Object.keys(this.state.students).forEach(item => this[item] && this[item].value(false));
            const students = {};
            page.list.forEach(item => {
                students[item._id] = {
                    isChecked: this.state.students[item._id] && this.state.students[item._id].isChecked || false,
                    isHover: this.state.students[item._id] && this.state.students[item._id].isHover || false,
                    ...item
                };
            });
            this.setState({ searchText, sortType: sort.division ? 'division' : 'name', students });
            done && done();
        });
    }

    handleSelectAll = (value) => {
        const students = this.state.students;
        if (value) {
            Object.keys(students).forEach(item => Object.assign(students[item], { isChecked: true }));
            this.setState({ students });
        } else {
            Object.keys(students).forEach(item => Object.assign(students[item], { isChecked: false }));
            this.setState({ students });
        }
        Object.keys(students).forEach(item => this[item] && this[item].value(value));
    }

    handleSelectOne = (value, item) => {
        const students = this.state.students;
        if (!value) {
            this.itemSelectAll && this.itemSelectAll.value(false);
            students[item._id].isChecked = false;
            this.setState({ students });
        } else {
            for (const property in students) {
                if (property != item._id && this[property].value() == false) {
                    this.itemSelectAll && this.itemSelectAll.value(false);
                    break;
                } else this.itemSelectAll && this.itemSelectAll.value(true);
            }
            students[item._id].isChecked = true;
            this.setState({ students });
        }
    }

    onHover = (e, item, type) => {
        e.preventDefault();
        const students = this.state.students;
        if (type == 'onHover') {
            students[item._id].isHover = true;
        } else {
            if (students[item._id].isChecked) {
                students[item._id].isHover = true;
            } else students[item._id].isHover = false;
        }
        this.setState({ students });
    }

    updateStudentCourse = (e, students, changes, pageNumber, pageSize) => {
        e.preventDefault();
        this.props.updateStudentCourse(this.checkedStudents(students), changes, () => {
            this.onSearch({ pageNumber, pageSize, searchText: this.state.searchText }, undefined, () => this.props.getStudentCourse(changes));
        });
    }

    checkedStudents = (students) => Object.entries(students).reduce((res, [key, { isChecked }]) => isChecked == true ? [...res, key] : res, []);

    removeStudentCourse = (e, student, pageSize) => e.preventDefault() || T.confirm('Xoá Học viên', `Bạn có chắc muốn xoá ${student.lastname} ${student.firstname} khỏi khóa học này?`, true, isConfirm => {
        if (isConfirm) {
            const { _id } = this.props.course.item;
            this.props.removeStudentCourse(student._id, _id, () => {
                this.searchBoxPre.value('');
                this.props.getCourse(_id, () => this.setState({ searchText: '' }, () => this.onSearch({ pageSize })));
            });
        }
    });

    render() {
        const { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list: preStudentList } = this.props.student && this.props.student.prePage ?
            this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList.all : [];
        const _courseId = this.props.course && this.props.course.item ? this.props.course.item._id : null;
        const { sortType, students } = this.state;

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
                            <FormCheckbox ref={e => this.itemSelectAll = e} label='Chọn tất cả' onChange={value => this.handleSelectAll(value)} style={{ display: 'inline-block' }} />
                            {/* <FormCheckbox ref={e => this.itemSelectAll = e} label='Chọn tất cả' onChange={value => this.handleSelectAll(value, 'DeSelect')} style={{ display: 'inline-block' }} /> */}
                            {/* <FormCheckbox ref={e => this.itemDeSelectAll = e} label='Không chọn tất cả' onChange={value => this.handleSelectAll(value, 'Select')} style={{ display: 'inline-block', marginLeft: 12 }} /> */}
                            {this.checkedStudents(students).length > 0 && <i className='fa fa-arrow-right' style={{ color: '#17a2b8', float: 'right' }}
                                onClick={e => _courseId && this.updateStudentCourse(e, this.state.students, { course: _courseId }, pageNumber, pageSize)} />}
                        </div>
                        {preStudentList.length ?
                            <ul style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 450px)' }}>
                                {preStudentList.map((item, index) =>
                                    <li style={{ margin: 0, display: 'block' }} key={index} onMouseEnter={(e) => this.onHover(e, item, 'onHover')}
                                        onMouseLeave={(e) => this.onHover(e, item, undefined)} >
                                        <FormCheckbox ref={e => this[item._id] = e} onChange={value => this.handleSelectOne(value, item)} style={{ display: 'inline-block' }} />
                                        <a href='#' onClick={e => _courseId && this.updateStudentCourse(e, JSON.parse(`{"${item._id}":{"isChecked":true}}`), { course: _courseId }, pageNumber, pageSize)} style={{ color: 'black' }}>
                                            {`${index + 1}. ${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division && item.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                        </a>
                                        {students[item._id] && students[item._id].isHover == true && this.checkedStudents(students).length < 2 &&
                                            <i onClick={e => _courseId && this.updateStudentCourse(e, JSON.parse(`{"${item._id}":{"isChecked":true}}`), { course: _courseId }, pageNumber, pageSize)} className='fa fa-arrow-right' style={{ color: '#17a2b8', marginLeft: 12 }} />}
                                    </li>
                                )}
                            </ul> : 'Không có thông tin'}
                        <Pagination name='adminPreStudent' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                            pageCondition={pageCondition} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse({ course: _courseId }, e.target.value)} />
                        {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {courseList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _courseId && this.removeStudentCourse(e, item, pageSize)}>
                                        {`${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division && item.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                    </a>
                                </li>))}
                        </ol> : 'Không có thông tin'}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getCourse, getPreStudentPage, updateStudentCourse, getStudentCourse, removeStudentCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);