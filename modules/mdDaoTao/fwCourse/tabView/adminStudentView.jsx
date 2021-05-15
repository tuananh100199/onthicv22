import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, getStudentCourse, updateStudentCourse, removeStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { FormTextBox } from 'view/component/AdminPage';

class AdminStudentView extends React.Component {
    state = { sortType: 'name' }; // name | division
    componentDidMount() {
        this.props.getPreStudentPage(1, 50, { courseType: this.props.courseType && this.props.courseType._id });
        this.props.getStudentCourse(this.props.course && this.props.course.item && this.props.course.item._id);
    }

    updateStudentCourse = (e, student, changes) => {
        e.preventDefault();
        this.props.updateStudentCourse(student._id, changes, (item) => {
            this.props.getPreStudentPage(1, 50, { courseType: item.courseType });
        });
    }

    removeStudentCourse = (e, student) => {
        e.preventDefault();
        this.props.removeStudentCourse(student._id, this.props.course.item._id, (item) => {
            this.props.getPreStudentPage(1, 50, { courseType: item.courseType });
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list: preStudentList } = this.props.student && this.props.student.prePage ?
            this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList : [];
        const _courseId = this.props.course && this.props.course.item ? this.props.course.item._id : null;
        const { sortType } = this.state;

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <label style={{ float: 'right', marginTop: 12, marginRight: 12 }}>Sắp xếp theo:&nbsp;
                            <a href='#' className={sortType == 'name' ? 'text-primary' : 'text-secondary'} onClick={e => e.preventDefault() || (sortType != 'name' && this.setState({ sortType: 'name' }))}>Họ & tên</a> |&nbsp;
                            <a href='#' className={sortType == 'name' ? 'text-secondary' : 'text-primary'} onClick={e => e.preventDefault() || (sortType != 'division' && this.setState({ sortType: 'division' }))}>Cơ sở đào tạo</a>
                    </label>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBoxPre = e} label='Tìm kiếm ứng viên' onChange={e => this.props.getPreStudentPage(1, 50, { searchText: e.target.value, courseType: this.props.courseType._id })} />
                        {preStudentList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {preStudentList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _courseId && this.updateStudentCourse(e, item, { course: _courseId })}>
                                        {item.lastname} {item.firstname} - {item.division && item.division.title}{item.division && item.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                    </a>
                                </li>))}
                        </ol> : 'Không có thông tin'}
                        <Pagination name='adminPreStudent' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                            getPage={this.props.getPreStudentPage} />
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse(this.props.course.item._id, e.target.value)} />
                        {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {courseList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _courseId && this.removeStudentCourse(e, item)}>
                                        {item.lastname} {item.firstname} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}
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
const mapActionsToProps = { getPreStudentPage, updateStudentCourse, getStudentCourse, removeStudentCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);