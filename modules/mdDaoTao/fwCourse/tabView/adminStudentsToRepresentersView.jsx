import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, getStudentCourse, updateStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import { FormTextBox } from 'view/component/AdminPage';

class AdminStudentsToRepresentersView extends React.Component {
    state = {};
    componentDidMount() {
        // this.props.getPreStudentPage(1, 50, { courseType: this.props.courseType && this.props.courseType._id });
        // this.props.getStudentCourse(this.props.course && this.props.course.item && this.props.course.item._id);
    }

    updateStudentCourse = (e, student, changes) => {
        e.preventDefault();
        this.props.updateStudentCourse(student._id, changes, () => {
        });
    }

    render() {
        // const { pageNumber, pageSize, pageTotal, totalItem, list: preStudentList } = this.props.student && this.props.student.prePage ?
        //     this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList : [];
        // const _courseId = this.props.course && this.props.course.item ? this.props.course.item._id : null;

        return (
            <div className='row'>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse(this.props.course.item._id, e.target.value)} />
                        {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                            {courseList.map((item, index) => (
                                <li key={index}>
                                    <a href='#' style={{ color: 'black' }}>
                                        {item.lastname} {item.firstname} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}
                                    </a>
                                </li>
                            ))}
                        </ol> : 'Không có thông tin'}
                    </div>
                </div>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Giáo viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBoxPre = e} label='Tìm kiếm giáo viên' onChange={e => this.props.getPreStudentPage(1, 50, { searchText: e.target.value, courseType: this.props.courseType._id })} />
                        {/* {preStudentList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                            {preStudentList.map((item, index) => (
                                <li key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _courseId && this.updateStudentCourse(e, item, { course: _courseId })}>
                                        {item.lastname} {item.firstname} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}
                                    </a>
                                </li>
                            ))}
                        </ol> : 'Không có thông tin'} */}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getPreStudentPage, updateStudentCourse, getStudentCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsToRepresentersView);
