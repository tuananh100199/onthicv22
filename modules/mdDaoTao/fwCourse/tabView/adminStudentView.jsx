import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, getStudentCourse, updateStudentCourse, removeStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { FormTextBox } from 'view/component/AdminPage';

class AdminStudentView extends React.Component {
    state = { searchText: '', sortType: 'name' }; // name | division
    componentDidMount() {
        this.onSearch({});
        this.props.course && this.props.course.item && this.props.getStudentCourse(this.props.course.item._id);
    }

    onSearch = ({ pageNumber, pageSize, searchText }, sort, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        if (sort == undefined) {
            sort = { lastname: 1, firstname: 1 };
            if (this.state.sortType == 'division') sort.division = 1;
        }
        this.props.getPreStudentPage(pageNumber, pageSize, { searchText, courseType: this.props.courseType && this.props.courseType._id }, sort, (page) => {
            this.setState({ searchText, sortType: sort.division ? 'division' : 'name' });
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
        const { sortType } = this.state;

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
                        {preStudentList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {preStudentList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _courseId && this.updateStudentCourse(e, item, { course: _courseId }, pageNumber, pageSize)}>
                                        {`${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division && item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}
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