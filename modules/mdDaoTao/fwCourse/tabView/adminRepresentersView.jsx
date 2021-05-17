// import React from 'react';
// import { connect } from 'react-redux';
// import { getCourse, updateCourseTeacherGroup, updateCourseTeacherGroupStudent } from '../redux';
// import { FormTextBox, FormSelect, AdminModal } from 'view/component/AdminPage';
// import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
// import { getStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';

// class AdminRepresentersView extends React.Component {
//     state = {};
//     componentDidMount() {
//         $(document).ready(() => {
//             this.selectRepresenter.value(null);
//         });
//     }


//     updateStudentCourse = (e, student, changes) => {
//         e.preventDefault();
//         this.props.updateStudentCourse(student._id, changes, () => {
//         });
//     }

//     render() {
//         // const { pageNumber, pageSize, pageTotal, totalItem, list: preStudentList } = this.props.student && this.props.student.prePage ?
//         //     this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
//         const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList : [];
//         // const _courseId = this.props.course && this.props.course.item ? this.props.course.item._id : null;
//         // const { permission, permissionDivision } = this.props,
//         //     item = this.props.course && this.props.course.item ? this.props.course.item : { representerGroups: [] };
//         const { permission } = this.props;
//         const permissionRepresenterWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);
//         // const tableRepresenter = renderTable({
//         //     getDataSource: () => this.divisionMapper && item.representerGroups,
//         //     renderHead: () => (
//         //         <tr>
//         //             <th style={{ width: 'auto' }}>#</th>
//         //             <th style={{ width: '60%' }}>Họ và Tên</th>
//         //             <th style={{ width: '40%' }} nowrap='true'>Cơ sở đào tạo</th>
//         //             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
//         //         </tr>),
//         //     renderRow: (item, index) => {
//         //         const teacher = item.representer || { lastname: 'Không có thông tin!' };
//         //         let division = teacher.division ? this.divisionMapper[teacher.division] : null,
//         //             divisionText = division ? `${division.title} ${division.isOutside ? '(CS ngoài)' : ''}` : '';
//         //         return (
//         //             <tr key={index}>
//         //                 <TableCell type='number' content={index + 1} />
//         //                 <TableCell content={teacher.lastname + ' ' + teacher.firstname} />
//         //                 {permissionDivision.read ?
//         //                     <TableCell type='link' content={divisionText} url={division && division._id ? '/user/division/' + division._id : ''} /> :
//         //                     <TableCell content={divisionText} />}
//         //                 <td>
//         //                     <div className='btn-group'>
//         //                         <a className='btn btn-danger' href='#' onClick={e => this.removeTeacher(e, index)}><i className='fa fa-lg fa-trash' /></a>
//         //                     </div>
//         //                 </td>
//         //             </tr>);
//         //     },
//         // });
//         return (
//             <div className='row'>
//                 <div className='col-md-6'>
//                     <h3 className='tile-title'>Học viên</h3>
//                     <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
//                         <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse(this.props.course.item._id, e.target.value)} />
//                         {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
//                             {courseList.map((item, index) => (
//                                 <li key={index}>
//                                     <a href='#' style={{ color: 'black' }}>
//                                         {item.lastname} {item.firstname} - {item.division && item.division.title}{item.division.isOutside ? <span className='text-secondary'>( cơ sở ngoài )</span> : ''}
//                                     </a>
//                                 </li>
//                             ))}
//                         </ol> : 'Không có thông tin'}
//                     </div>
//                 </div>
//                 <div className='col-md-6' >
//                     <h3 className='tile-title'>Giáo viên</h3>
//                     <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
//                         <div style={{ display: permissionRepresenterWrite ? 'flex' : 'none' }}>
//                             <FormSelect ref={e => this.selectRepresenter = e} data={ajaxSelectUserType(['isRepresenter'])} style={{ width: '100%' }} />
//                             <div style={{ width: 'auto', paddingLeft: 8 }}>
//                                 <button className='btn btn-success' type='button' onClick={this.addRepresenter}>
//                                     <i className='fa fa-fw fa-lg fa-plus' /> Thêm giáo viên
//                             </button>
//                             </div>
//                         </div>
//                         {/* {teacherGroups.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 391px)' }}>
//                         {teacherGroups.map((item, index) =>
//                             item.teacher && <li style={{ margin: 10 }} key={index}>
//                                 <a href='#' className='text-primary' onClick={e => _id && this.removeTeacher(e, item.teacher)}>
//                                     {`${item.teacher.lastname} ${item.teacher.firstname}`} - {item.teacher.division && item.teacher.division.title}{item.teacher.division.isOutside ? <span className='text-secondary'> ( cơ sở ngoài )</span> : ''}
//                                 </a>
//                                 <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
//                                     {item.student.length ? item.student.map((student, indexStudent) => (
//                                         <li key={indexStudent} style={{ margin: 10 }}>
//                                             <a href='#' style={{ color: 'black' }} onClick={e => _id && this.removeStudent(e, item.teacher, student)}>
//                                                 {`${student.lastname} ${student.firstname}`} - {student.division && student.division.title}{student.division.isOutside ? <span className='text-secondary'> ( cơ sở ngoài )</span> : ''}
//                                             </a>
//                                         </li>
//                                     )) : 'Chưa có học viên'}
//                                 </ol>
//                             </li>
//                         )}
//                     </ol> : 'Không có thông tin'} */}
//                     </div>
//                     {/* {tableRepresenter} */}
//                 </div>
//             </div>
//         );
//     }
// }

// const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
// const mapActionsToProps = { getPreStudentPage, updateStudentCourse, getStudentCourse };
// export default connect(mapStateToProps, mapActionsToProps)(AdminRepresentersView);
