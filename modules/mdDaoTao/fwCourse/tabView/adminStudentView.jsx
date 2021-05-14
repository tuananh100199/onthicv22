import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, getStudentCourse, updateStudentCourse, removeStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { FormTextBox } from 'view/component/AdminPage';

class AdminStudentView extends React.Component {
    state = { searchText: '' };
    componentDidMount() {
        this.onSearch({});
        this.props.course && this.props.course.item && this.props.getStudentCourse(this.props.course.item._id);
    }

    onSearch = ({ pageNumber, pageSize, searchText }, sort, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.props.getPreStudentPage(pageNumber, pageSize, { searchText, courseType: this.props.courseType && this.props.courseType._id }, sort, (page) => {
            this.setState({ searchText });
            done && done(page);
        });
    }

    updateStudentCourse = (e, student, changes, pageNumber, pageSize) => {
        e.preventDefault();
        this.props.updateStudentCourse(student._id, changes, () => {
            this.onSearch({ pageNumber, pageSize, searchText: this.state.searchText });
        });
    }

    removeStudentCourse = (e, student, pageSize) => {
        e.preventDefault();
        this.props.removeStudentCourse(student._id, this.props.course.item._id, () => {
            this.searchBoxPre.value('');
            this.setState({ searchText: '' }, () => this.onSearch({ pageSize }));
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list: preStudentList } = this.props.student && this.props.student.prePage ?
            this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList : [];
        const _courseId = this.props.course && this.props.course.item ? this.props.course.item._id : null;

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <div className='row'>
                        <h3 className='tile-title col-6'>Ứng viên</h3>
                        <div style={{}}>Sắp xếp theo:
                            <button className='btn' type='button' style={{ marginBottom: 5, marginLeft: 5 }} onClick={() => this.onSearch({ pageNumber, pageSize }, { lastname: 1, firstname: 1 })}>
                                Tên
                            </button>
                            <button className='btn' type='button' style={{ marginBottom: 5, marginLeft: 10 }} onClick={() => { }}>
                                Cơ sở
                            </button>
                            {/* <i style={{ marginRight: 10 }} className='fa fa-sort-alpha-asc'></i>
                        <i className='fa fa-university'></i> */}
                        </div>
                    </div>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBoxPre = e} label='Tìm kiếm ứng viên' onChange={e => this.onSearch({ searchText: e.target.value })} />
                        {preStudentList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {preStudentList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _courseId && this.updateStudentCourse(e, item, { course: _courseId }, pageNumber, pageSize)}>
                                        {`${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}
                                    </a>
                                </li>))}
                        </ol> : 'Không có thông tin'}
                        <Pagination name='adminPreStudent' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                            pageCondition={pageCondition} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse(this.props.course.item._id, e.target.value)} />
                        {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {courseList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _courseId && this.removeStudentCourse(e, item, pageSize)}>
                                        {`${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}
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