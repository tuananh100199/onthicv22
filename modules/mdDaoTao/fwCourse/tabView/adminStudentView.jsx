
import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentAll, updateStudent, updatePreStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { FormTextBox } from 'view/component/AdminPage';
class AdminStudentView extends React.Component {
    state = { outsideGroups: [], groups: [] };
    componentDidUpdate(prevProps) {
        if (this.props.course && this.props.course !== prevProps.course) {
            this.props.getPreStudentAll({ courseType: this.props.courseType._id });
            this.props.getDivisionAll(divisions => {
                const isOusideDivisions = [];
                (divisions.filter(item => item.isOutside == true) || []).forEach(division => division.isOutside && isOusideDivisions.push(division._id.toString()));
                const outsideGroups = (this.props.course && this.props.course.item && this.props.course.item.groups || []).filter(group => group.teacher && group.teacher.division && isOusideDivisions.includes(group.teacher.division));
                const groups = (this.props.course && this.props.course.item && this.props.course.item.groups || []).filter(group => group.teacher && group.teacher.division && !isOusideDivisions.includes(group.teacher.division));
                this.setState({ outsideGroups, groups })
            });
        }
    }

    onDragStart1 = (ev, id) => {
        ev.dataTransfer.setData("id1", id);
    }

    onDragStart2 = (ev, id) => {
        ev.dataTransfer.setData("id2", id);
    }

    onDragOver = (ev) => {
        ev.preventDefault();
    }

    onDrop = (ev, groupId) => {
        if (ev.dataTransfer.getData("id2")) {
            T.notify('Fail')
        } else {
            let _studentId = ev.dataTransfer.getData("id1");
            let groups = this.props.course.item.groups ? this.props.course.item.groups : [];
            let students = [];
            groups.map((item, index) => {
                students = groups && groups[index] && groups[index].student ? groups[index].student : [];
                if (item._id == groupId) {
                    students.push(_studentId);
                    groups[index].student = students;
                }
            })
            this.props.updateStudent(_studentId, { course: this.props.course.item._id }, (error) => {
                if (!error) {
                    this.props.updateCourse(this.props.course.item._id, { groups }, () => {
                        // this.props.updateForm(this.props.donDeNghiHoc.item._id, { status: 'approved' });
                    });
                    this.props.getPreStudentAll({ courseType: this.props.courseType._id });
                }
            });
        }
    }
    remove = (e, groupId, _studentId, index, indexStudent) => e.preventDefault() || T.confirm('Xoá cố vấn học tập', 'Bạn có chắc muốn xoá cố vấn học tập khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item && this.props.course.item.groups) {
            const { _id, groups = [] } = this.props.course.item;
            // console.log(groups[index], 'stur')
            const index = groups.findIndex(item => item._id == groupId)
            groups[index].student.splice(indexStudent, 1);
            // const group = groups.find(item => item._id == groupId);
            // group.student.splice(indexStudent, 1);
            // groups.splice(index, 1);
            this.props.updateStudent(_studentId, { $unset: { course: 1 } }, (error) => {
                if (!error) {
                    console.log(groups, 'groufwp')
                    this.props.updateCourse(_id, { groups: groups.length ? groups : 'empty' });
                }
            });
        }
    });

    render() {
        const list = this.props.student && this.props.student.list ? this.props.student.list : [],
            groups = this.props.course && this.props.course.item && this.props.course.item.groups ? this.props.course.item.groups : [];
        let students = list.filter(item => item.division && item.division.isOutside == false).map((item, index) => {
            return (
                <div key={index}
                    onDragStart={(e) => this.onDragStart1(e, item._id)}
                    draggable
                >
                    {index + 1}. {item.lastname} {item.firstname}
                </div>
            )
        }
        );
        let studentOutsides = list.filter(item => item.division && item.division.isOutside == true).map((item, index) => {
            return (
                <li
                    // <div
                    key={index}
                    onDragStart={(e) => this.onDragStart2(e, item._id)}
                    draggable
                >
                    {/* {index + 1}. {item.lastname} {item.firstname} */}
                    {item.lastname} {item.firstname}
                    {/* </div> */}
                </li>
            )
        });
        // let isOutsideTeacher = (_id) => {
        //     let isOutside ;
        //     ajaxGetDivision(_id, data => {
        //         if (data.error) {
        //             T.notify('Lấy cơ sở bị lỗi', 'danger');
        //         } else if (data.item) {
        //             console.log(data.item.isOutside, 'outside');
        //             if (data.item.isOutside == true) {
        //                 isOutside = true;
        //             }
        //         }
        //     });
        //     console.log(isOutside, 'isoutside')
        //     return isOutside;
        // }

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getPreStudentAll({ searchText: e.target.value, courseType: this.props.courseType._id })} />
                        <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'decimal' }}>
                            <div>
                                {students}
                            </div>
                        </ul>
                        <h5>Ứng viên thuộc cơ sở ngoài</h5>
                        {/* <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'decimal' }}>
                            <div>
                                {studentOutsides}
                            </div>
                        </ul> */}
                        <ol style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'decimal' }}>
                            {/* <div>
                                {studentOutsides}
                            </div> */}

                            {studentOutsides}

                        </ol>
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Nhóm học viên</h3>
                    {this.state.groups.map((item, index) =>
                        <div key={index} style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12, marginBottom: 10 }}
                            onDrop={(e) => { this.onDrop(e, item._id) }}
                            onDragOver={(e) => this.onDragOver(e)} >
                            <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'none' }}>
                                {item.teacher ? (
                                    <li><span style={{ fontWeight: 'bold' }}>Giáo viên: </span> {item.teacher.lastname} {item.teacher.firstname}</li>
                                )
                                    : 'Không có thông tin giáo viên'
                                }
                                <li><span style={{ fontWeight: 'bold' }}>Danh sách học viên: </span></li>
                                {item.student ? item.student.map((student, indexStudent) => (
                                    <li key={indexStudent}>{indexStudent + 1}. {student.lastname} {student.firstname}
                                        {
                                            // <div className='btn-group' style={{ float: 'right' }}>
                                            <a style={{ textAlign: 'right' }} className='btn' href='#' onClick={e => this.remove(e, item._id, student._id, index, indexStudent)}><i className='fa fa-trash' /></a>
                                            // {/* </div> */}
                                        }</li>
                                )) : 'Không có thông tin học viên'}
                            </ul>
                        </div>)}
                    <h5>Nhóm học viên thuộc cơ sở ngoài</h5>
                    {/* {groups.forEach(item => item.teacher && item.teacher.division && console.log(item.teacher.division, 'division'))} */}
                    {/* {groups.filter(item => item.teacher && item.teacher.division && isOutsideTeacher(item.teacher.division) == true).map((item, index) => */}
                    {this.state.outsideGroups.map((item, index) =>
                        <div key={index} style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12, marginBottom: 10 }}
                            onDrop={(e) => { this.onDrop(e, item._id) }}
                            onDragOver={(e) => this.onDragOver(e)} >
                            <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'none' }}>
                                {item.teacher ? (
                                    <li><span style={{ fontWeight: 'bold' }}>Giáo viên: </span> {item.teacher.lastname} {item.teacher.firstname}</li>
                                )
                                    : 'Không có thông tin giáo viên'
                                }
                                <li><span style={{ fontWeight: 'bold' }}>Danh sách học viên: </span></li>
                                {item.student ? item.student.map((student, index) => (
                                    <li key={index}>{index + 1}. {student.lastname} {student.firstname}</li>
                                )) : 'Không có thông tin học viên'}
                            </ul>
                        </div>)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student, course: state.course });
const mapActionsToProps = { updatePreStudent, getDivisionAll, getPreStudentAll, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
