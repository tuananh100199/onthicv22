
import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentAll, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { FormTextBox } from 'view/component/AdminPage';
class AdminStudentView extends React.Component {
    state = { outsideGroups: [], insideGroups: [] };
    componentDidUpdate(prevProps) {
        const course = this.props.course;
        if (course !== prevProps.course) {
            this.props.getPreStudentAll({ courseType: this.props.courseType._id });
            this.props.getDivisionAll(list => {
                const _idOutsideDivisions = list.reduce((result, item) => item.isOutside ? [...result, item._id] : result, []),
                    groups = course.item.groups || [],
                    outsideGroups = groups.filter(group => _idOutsideDivisions.includes(group.teacher.division)),
                    insideGroups = groups.filter(group => !outsideGroups.includes(group));
                this.setState({ outsideGroups, insideGroups })
            });
        }
    }

    onDragStart = (e, item) => {
        e.dataTransfer.setData("student", JSON.stringify(item));
    }
    onDragOver = (e) => {
        e.preventDefault();
    }

    onDrop = (e, group) => {
        const student = JSON.parse(e.dataTransfer.getData("student")),
            isOutside = student.division.isOutside;
        if ((isOutside && !this.state.outsideGroups.includes(group)) || (!isOutside && !this.state.insideGroups.includes(group))) {
            T.notify('Ứng viên thuộc cơ sở ngoài chỉ được thêm vào nhóm học viên thuộc cơ sở ngoài!', 'danger');
        } else if (student.division._id != group.teacher.division) {
            T.notify('Giáo viên và ứng viên phải trùng cơ sở đào tạo!', 'danger');
        } else {
            const { _id, groups = [] } = this.props.course.item,
                index = groups.findIndex(item => item._id == group._id);
            groups[index].student.push(student._id);
            this.props.updateStudent(student._id, { course: _id }, (error) => {
                if (!error) {
                    this.props.updateCourse(_id, { groups }, () => {
                        // this.props.updateForm(this.props.donDeNghiHoc.item._id, { status: 'approved' });
                    });
                }
            });
        }
    }
    remove = (e, groupId, _studentId, indexStudent) => e.preventDefault() || T.confirm('Xoá học viên', 'Bạn có chắc muốn xoá học viên khỏi nhóm này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item && this.props.course.item.groups) {
            const { _id, groups = [] } = this.props.course.item,
                index = groups.findIndex(item => item._id == groupId);
            groups[index].student.splice(indexStudent, 1);
            this.props.updateStudent(_studentId, { $unset: { course: 1 } }, (error) => {
                if (!error) {
                    this.props.updateCourse(_id, { groups: groups.length ? groups : 'empty' });
                }
            });
        }
    });

    render() {
        const permission = this.props.permission,
            list = this.props.student && this.props.student.list ? this.props.student.list : [],
            studentOutsides = list.filter(item => item.division && item.division.isOutside),
            studentInsides = list.filter(item => !studentOutsides.includes(item)),
            renderStudents = list =>
                <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                    {list.map((item, index) => {
                        return (<li key={index} onDragStart={e => this.onDragStart(e, item)} draggable>
                            {item.lastname} {item.firstname}</li>)
                    })}
                </ol>,
            renderGroups = (list) =>
                list.map((item, index) =>
                    <div key={index} style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12, marginBottom: 10 }}
                        onDrop={e => this.onDrop(e, item)}
                        onDragOver={e => this.onDragOver(e)} >
                        <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'none' }}>
                            {item.teacher ? (
                                <li><span style={{ fontWeight: 'bold' }}>Giáo viên: </span> {item.teacher.lastname} {item.teacher.firstname}</li>
                            ) : 'Không có thông tin giáo viên'}
                            <li><span style={{ fontWeight: 'bold' }}>Danh sách học viên: </span></li>
                            <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                {item.student ? item.student.map((student, indexStudent) => (
                                    <li key={indexStudent} style={{ whiteSpace: 'nowrap' }} >{student.lastname} {student.firstname}
                                        { permission.write ? <span style={{ float: 'right', color: 'red' }} onClick={e => this.remove(e, item._id, student._id, indexStudent)}>
                                            <i className='fa fa-trash' /></span> : null}
                                    </li>
                                )) : 'Không có thông tin học viên'}
                            </ol>
                        </ul>
                    </div>)

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getPreStudentAll({ searchText: e.target.value, courseType: this.props.courseType._id })} />
                        {renderStudents(studentInsides)}
                        <h5>Ứng viên thuộc cơ sở ngoài</h5>
                        {renderStudents(studentOutsides)}
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Nhóm học viên</h3>
                    {renderGroups(this.state.insideGroups)}
                    <h5>Nhóm học viên thuộc cơ sở ngoài</h5>
                    {renderGroups(this.state.outsideGroups)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student, course: state.course });
const mapActionsToProps = { getDivisionAll, getPreStudentAll, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
