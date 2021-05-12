import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, getStudentCourse, updateStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { FormTextBox } from 'view/component/AdminPage';

class AdminStudentView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getPreStudentPage(1, 50, { courseType: this.props.courseType && this.props.courseType._id });
        this.props.getStudentCourse(this.props.course && this.props.course.item && this.props.course.item._id);
    }

    updateStudentCourse = (e, student, changes) => {
        e.preventDefault();
        this.props.updateStudentCourse(student._id, changes, () => {
        });
    }

    removeStudentCourse = (e, student, changes) => {
        e.preventDefault();
        this.props.updateStudentCourse(student._id, changes, this.props.course.item._id, () => { });
        let { _id, groups = [] } = this.props.course.item;
        // remove student from groups in course
        groups = groups.reduce((result, group) => {
            group.student.forEach((item, indexStudent) => {
                if (item._id == student._id) {
                    group.student.splice(indexStudent, 1);
                }
            });
            return [...result, group];
        }, []);
        this.props.updateCourse(_id, { groups: groups.length ? groups : 'empty' }, () => { });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list: preStudentList } = this.props.student && this.props.student.prePage ?
            this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList : [];
        const _courseId = this.props.course && this.props.course.item ? this.props.course.item._id : null;

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBoxPre = e} label='Tìm kiếm ứng viên' onChange={e => this.props.getPreStudentPage(1, 50, { searchText: e.target.value, courseType: this.props.courseType._id })} />
                        {preStudentList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                            {preStudentList.map((item, index) => (
                                <li key={index}>
                                    <a href='#' style={{ color: 'black' }}
                                        onClick={e => _courseId && this.updateStudentCourse(e, item, { course: _courseId })}>{item.lastname} {item.firstname} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}</a>
                                </li>
                            ))}
                        </ol> : 'Không có thông tin'}
                        <Pagination name='adminPreStudent' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                            getPage={this.props.getPreStudentPage} />
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse(this.props.course.item._id, e.target.value)} />
                        {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                            {courseList.map((item, index) => (
                                <li key={index}>
                                    <a href='#' style={{ color: 'black' }}
                                        onClick={e => _courseId && this.removeStudentCourse(e, item, { $unset: { course: 1 } })}>{item.lastname} {item.firstname} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}</a>
                                </li>
                            ))}
                        </ol> : 'Không có thông tin'}
                    </div>
                </div>
            </div>
        );
    }
}

// class AdminStudentView1 extends React.Component {
//     state = {};
//     componentDidMount() {
//         this.props.getPreStudentPage(1, 50, { courseType: this.props.courseType && this.props.courseType._id });
//         const params = T.routeMatcher('/user/course/:_id').parse(window.location.pathname);
//         if (params._id) {
//             this.props.getStudentPage(1, 50, { course: params._id });
//         } else {
//             this.props.history.push(previousRoute);
//         }
//     }
//
//     onClick = (_studentId, typeOnClick) => {
//         if (typeOnClick == 'add') {
//             this.props.updateStudent(_studentId, { course: this.props.course && this.props.course.item && this.props.course.item._id });
//         } else if (typeOnClick == 'remove') {
//             this.props.updateStudent(_studentId, { $unset: { course: 1 } });
//         }
//     }
//
//     render() {
//         const outsides = (list, isOutside) => list && list.filter(item => item.division && item.division.isOutside == isOutside),
//             divisions = (list) =>
//                 list.reduce((result, student) => !result.find(division => JSON.stringify(division) == JSON.stringify(student.division)) ? [...result, student.division] : result, []),
//             pageInfo = (page) => (this.props.student && page ?
//                 page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] }),
//             page = pageInfo(this.props.student.page),
//             prePage = pageInfo(this.props.student.prePage),
//             renderPagination = (name, page, action, pos) => <Pagination style={{ left: pos }} name={name} pageCondition={page.pageCondition} pageNumber={page.pageNumber} pageSize={page.pageSize} pageTotal={page.pageTotal} totalItem={page.totalItem}
//                 getPage={action} />;
//         const renderDivisions = (list, isOutside, typeOnClick) => list && list.length ?
//             divisions(list) && divisions(list).reduce((result, division, index) => division && division.isOutside == isOutside ? [...result, (
//                 <div key={index} style={{ marginTop: 0 }}>
//                     <h6 style={{ paddingTop: 20 }}>{division.title}</h6>
//                     <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
//                         {list.sort((a, b) => a.firstName && a.firstName.localeCompare(b.firstName) ||
//                             a.lastName && a.lastName.localeCompare(b.lastName)).reduce((result, student, index) => JSON.stringify(division) == JSON.stringify(student.division) ?
//                                 [...result, <li key={index} onClick={this.onClick(student._id, typeOnClick)}>{student.lastname} {student.firstname}</li>] : result, [])}
//                     </ol>
//                 </div>)] : result, []) : 'Không có thông tin';
//
//         return (
//             <div className='row'>
//                 <div className='col-md-6' >
//                     <h3 className='tile-title'>Ứng viên</h3>
//                     <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
//                         <FormTextBox ref={e => this.searchBoxPre = e} label='Tìm kiếm ứng viên' onChange={e => this.props.getPreStudentPage(1, 50, { searchText: e.target.value, courseType: this.props.courseType._id })} />
//                         <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
//                             {(prePage && prePage.list ? prePage.list : []).map((item, index) => (
//                                 <li key={index}>
//                                     <a href='#' style={{ color: 'black' }}>{item.lastname} {item.firstname}</a>
//                                 </li>
//                             ))}
//                         </ol>
//                         <Pagination name='adminPreStudent' pageCondition={prePage.pageCondition} pageNumber={prePage.pageNumber} pageSize={prePage.pageSize} pageTotal={prePage.pageTotal} totalItem={prePage.totalItem}
//                             getPage={this.props.getPreStudentPage} style={{ left: 320 }} />
//                     </div>
//                 </div>
//                 <div className='col-md-6'>
//                     <h3 className='tile-title'>Học viên</h3>
//                     <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
//                         <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentPage(1, 50, { searchText: e.target.value, course: this.props.course.item._id })} />
//                         <div>
//                             {/* <h5>Học viên thuộc cơ sở Hiệp Phát</h5>
//                             {renderDivisions(outsides(page.list, false), false, 'remove')}
//                             <h5>Học viên thuộc cơ sở ngoài</h5>
//                             {renderDivisions(outsides(page.list, true), true, 'remove')}
//                             {renderPagination('adminStudent', page, this.props.getStudentPage, 850)} */}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getPreStudentPage, updateStudentCourse, getStudentCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
