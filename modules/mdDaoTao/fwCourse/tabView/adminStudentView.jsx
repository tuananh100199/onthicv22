import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentAll, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportScore } from '../redux';
import { getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { FormTextBox, FormCheckbox, AdminModal, FormSelect, CirclePageButton } from 'view/component/AdminPage';

class TeacherModal extends AdminModal {
    onShow = () => {
        this.teacherSelect.value(null);
    };

    onSubmit = () => {
        const _teacherId = this.teacherSelect.value();
        if (!_teacherId) {
            T.notify('Giáo viên không được trống!', 'danger');
        } else {
            const { _id, groups = [] } = this.props.course,
                index = groups.findIndex(item => item.teacher._id == _teacherId);
            const _studentIds = this.props.students.map(item => item._id).filter((item, idx, arr) => arr.indexOf(item) == idx);
            _studentIds.forEach(item => groups[index].student.push(item));
            _studentIds.forEach(item => this.props.updateStudent(item, { course: _id }));
            this.props.add(_id, { groups }, () => {
                T.notify('Thêm ứng viên vào nhóm thành công!');
                this.hide();
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Giáo viên',
            body: <FormSelect ref={e => this.teacherSelect = e} label='Giáo viên'
                data={this.props.course.groups.reduce((result, item) => item.teacher.division == this.props.division._id ?
                    [...result, { id: item.teacher._id, text: `${item.teacher.lastname} ${item.teacher.firstname}` }] : result, [])}
                readOnly={this.props.readOnly} />
        });
    };
}
class AdminStudentView extends React.Component {
    state = { outsideGroups: [], insideGroups: [], divisions: [], groups: [], studentSelecteds: [] };
    componentDidUpdate(prevProps) {
        const course = this.props.course;
        if (course !== prevProps.course) {
            this.setState({ studentSelecteds: [] });
            this.props.getPreStudentAll({ courseType: this.props.courseType && this.props.courseType._id });
            this.props.getDivisionAll(list => {
                const _idOutsideDivisions = list.reduce((result, item) => item && item.isOutside ? [...result, item._id] : result, []),
                    groups = course.item.groups || [],
                    outsideGroups = groups.filter(group => _idOutsideDivisions.includes(group.teacher.division)),
                    insideGroups = groups.filter(group => !outsideGroups.includes(group));
                this.setState({ outsideGroups, insideGroups, divisions: list, groups });
            });
        }
    }

    onDragStart = (e, item) => {
        e.dataTransfer.setData('student', JSON.stringify(item));
    }
    onDragOver = (e) => {
        e.preventDefault();
    }

    onDrop = (e, group) => {
        const student = JSON.parse(e.dataTransfer.getData('student')),
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
                        T.notify('Thêm ứng viên vào nhóm thành công!');
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
                    this.props.updateCourse(_id, { groups: groups.length ? groups : 'empty' }, () => {
                        T.alert('Xóa học viên thành công!', 'error', false, 800);
                    });
                }
            });
        }
    });

    render() {
        const permission = this.props.permission, divisions = this.state.divisions,
            list = this.props.student && this.props.student.list ? this.props.student.list : [],
            divisionStudents = list.reduce((result, item) => !result.find(item1 => JSON.stringify(item1) == JSON.stringify(item.division)) ? [...result, item.division] : result, []),
            divisionTeachers = this.props.course && this.props.course.item && this.props.course.item.groups.reduce(
                (result, item) => !result.find(item1 => item1 && item1._id == item.teacher.division) ? [...result, this.state.divisions.find(item2 => item2._id == item.teacher.division)] : result, []),
            studentOutsides = list.filter(item => item.division && item.division.isOutside),
            studentInsides = list.filter(item => !studentOutsides.includes(item)),

            renderStudents = (list, _idDiv, isHide) =>
                <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                    {list.map((item, index) => {
                        return (<li key={index} style={{ whiteSpace: 'nowrap' }}>
                            {isHide && <FormCheckbox ref={e => this[item._id] = e}
                                onChange={value => {
                                    const students = this.state.studentSelecteds;
                                    if (!value) {
                                        const index = students.indexOf(item);
                                        if (index != -1) {
                                            students.splice(index, 1);
                                            this.setState({ studentSelecteds: students });
                                        }
                                        this[_idDiv] && this[_idDiv].value(false);
                                    } else {
                                        students.push(item);
                                        this.setState({ studentSelecteds: students });
                                        if (list.length != 1) {
                                            const _idStudents = list.map(item => item._id);
                                            _idStudents.splice(index, 1);
                                            for (const _id of _idStudents) {
                                                if (this[_id].value() == false) {
                                                    this[_idDiv] && this[_idDiv].value(false);
                                                    break;
                                                } else this[_idDiv] && this[_idDiv].value(true);
                                            }
                                        } else this[_idDiv] && this[_idDiv].value(true);
                                    }
                                }}
                            />}
                            <span draggable onDragStart={e => this.onDragStart(e, item)}>{item.lastname} {item.firstname}</span></li>);
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
                            ) : 'Chưa có giáo viên'}
                            {item.student.length ? <>
                                <li><span style={{ fontWeight: 'bold' }}>Danh sách học viên: </span></li>
                                <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                    {item.student.map((student, indexStudent) => (
                                        <li key={indexStudent} style={{ whiteSpace: 'nowrap' }}
                                            onMouseEnter={() => {
                                                const groups = this.state.groups;
                                                const index = groups.findIndex(item1 => item1._id == item._id);
                                                if (groups[index].student[indexStudent]) groups[index].student[indexStudent].isHide = true;
                                                this.setState({ groups });
                                            }}
                                            onMouseLeave={() => {
                                                const groups = this.state.groups;
                                                const index = groups.findIndex(item1 => item1._id == item._id);
                                                if (groups[index].student[indexStudent]) groups[index].student[indexStudent].isHide = false;
                                                this.setState({ groups });
                                            }}
                                        >
                                            {student.lastname} {student.firstname}
                                            {list[index].student[indexStudent].isHide && permission.write ? <i onClick={e => this.remove(e, item._id, student._id, indexStudent)} style={{ float: 'right', color: 'red' }} className="fa fa-user-times"></i> : ''}
                                        </li>
                                    ))}
                                </ol> </> : 'Chưa có học viên'}
                        </ul>
                    </div>);

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm ứng viên' onChange={e => this.props.getPreStudentAll({ searchText: e.target.value, courseType: this.props.courseType._id })} />
                        <h5>Ứng viên thuộc cơ sở Hiệp Phát</h5>
                        {studentInsides.length ? divisionStudents.reduce((result, item, index) => item && !item.isOutside ? [...result, (<div key={index} style={{ marginTop: 0 }}
                            onMouseEnter={() => {
                                const index = divisions.findIndex(item1 => item1._id == item._id);
                                if (divisions[index]) divisions[index].isHide = true;
                                this.setState({ divisions });
                            }}
                            onMouseLeave={() => {
                                const index = divisions.findIndex(item1 => item1._id == item._id);
                                if (divisions[index] && divisions[index].isModalOpened)
                                    divisions[index].isHide = true;
                                else divisions[index].isHide = false;
                                this.setState({ divisions });
                            }}
                        >
                            <h6 style={{ paddingTop: 20 }}>{divisions[divisions.findIndex(item1 => item1._id == item._id)] && divisions[divisions.findIndex(item1 => item1._id == item._id)].isHide ?
                                <>
                                    <FormCheckbox
                                        ref={e => this[item._id] = e}
                                        onChange={value => {
                                            const students = this.state.studentSelecteds;
                                            const _idStudents = studentInsides.reduce((result, student) => JSON.stringify(student.division) == JSON.stringify(item) ?
                                                [...result, student] : result, []);
                                            if (value) {
                                                _idStudents.forEach(item => students.push(item));
                                                this.setState({ studentSelecteds: students });
                                            } else {
                                                _idStudents.forEach(item => {
                                                    const index = students.indexOf(item);
                                                    if (index != -1) {
                                                        students.splice(index, 1);
                                                    }
                                                    this.setState({ studentSelecteds: students });
                                                });
                                                // this.setState({ studentSelecteds: students })
                                            }
                                            _idStudents.forEach(item2 => this[item2._id] && this[item2._id].value(value));
                                        }} style={{ display: 'flex' }} />
                                    {item.title}
                                    <button className='btn btn-success' type='button' style={{
                                        float: 'right'
                                    }} onClick={() => {
                                        const index = divisions.findIndex(item1 => item1._id == item._id);
                                        if (divisions[index]) divisions[index].isModalOpened = true;
                                        this.setState({ divisions });
                                        this[`modal${item._id}`].show();
                                    }}>
                                        <i className='fa fa-arrow-right' />
                                    </button>
                                </> : item.title}
                            </h6>
                            <TeacherModal ref={e => this[`modal${item._id}`] = e} readOnly={!permission.write} add={this.props.updateCourse} updateStudent={this.props.updateStudent}
                                course={this.props.course.item} division={item}
                                students={this.state.studentSelecteds.filter(item1 => item._id == item1.division._id)}
                            />
                            {renderStudents(studentInsides.filter(item1 => JSON.stringify(item) == JSON.stringify(item1.division)), item._id,
                                divisions[divisions.findIndex(item1 => item1._id == item._id)] && divisions[divisions.findIndex(item1 => item1._id == item._id)].isHide
                            )}
                        </div>)] : result, []) : 'Không có thông tin'}
                        <h5 style={{ marginTop: 10 }}>Ứng viên thuộc cơ sở ngoài</h5>
                        {studentOutsides.length ? divisionStudents.reduce((result, item, index) => item && item.isOutside ? [...result, (<div key={index} style={{ marginTop: 0 }}
                            onMouseEnter={() => {
                                const index = divisions.findIndex(item1 => item1._id == item._id);
                                if (divisions[index]) divisions[index].isHide = true;
                                this.setState({ divisions });
                            }}
                            onMouseLeave={() => {
                                const index = divisions.findIndex(item1 => item1._id == item._id);
                                if (divisions[index] && divisions[index].isModalOpened)
                                    divisions[index].isHide = true;
                                else divisions[index].isHide = false;
                                this.setState({ divisions });
                            }}
                        >
                            <h6 style={{ paddingTop: 20 }}>{divisions[divisions.findIndex(item1 => item1._id == item._id)] && divisions[divisions.findIndex(item1 => item1._id == item._id)].isHide ?
                                <>
                                    <FormCheckbox
                                        ref={e => this[item._id] = e}
                                        onChange={value => {
                                            const students = this.state.studentSelecteds;
                                            const _idStudents = studentOutsides.reduce((result, student) => JSON.stringify(student.division) == JSON.stringify(item) ?
                                                [...result, student] : result, []);
                                            if (value) {
                                                _idStudents.forEach(item => students.push(item));
                                                this.setState({ studentSelecteds: students });
                                            } else {
                                                _idStudents.forEach(item => {
                                                    const index = students.indexOf(item);
                                                    if (index != -1) {
                                                        students.splice(index, 1);
                                                    }
                                                    this.setState({ studentSelecteds: students });
                                                });
                                            }
                                            _idStudents.forEach(item2 => this[item2._id] && this[item2._id].value(value));
                                        }} style={{ display: 'flex' }} />
                                    {item.title}
                                    <button className='btn btn-success' type='button' style={{
                                        float: 'right'
                                    }} onClick={() => {
                                        const index = divisions.findIndex(item1 => item1._id == item._id);
                                        if (divisions[index]) divisions[index].isModalOpened = true;
                                        this.setState({ divisions });
                                        this[`modal${item._id}`].show();
                                    }}>
                                        <i className='fa fa-arrow-right' />
                                    </button>
                                </> : item.title}
                            </h6>
                            <TeacherModal ref={e => this[`modal${item._id}`] = e} readOnly={!permission.write} add={this.props.updateCourse} updateStudent={this.props.updateStudent}
                                course={this.props.course.item} division={item}
                                students={this.state.studentSelecteds.filter(item1 => item._id == item1.division._id)}
                            />
                            {renderStudents(studentOutsides.filter(item1 => JSON.stringify(item) == JSON.stringify(item1.division)), item._id,
                                divisions[divisions.findIndex(item1 => item1._id == item._id)] && divisions[divisions.findIndex(item1 => item1._id == item._id)].isHide
                            )}
                        </div>)] : result, []) : 'Không có thông tin'}
                        {/* {studentOutsides.length ? divisionStudents.reduce((result, item, index) => item.isOutside ? [...result, (<div key={index} style={{ marginTop: 10 }}>
                            <h6>{item.title}</h6>
                            {renderStudents(studentOutsides.filter(item1 => JSON.stringify(item) == JSON.stringify(item1.division)))}
                        </div>)] : result, []) : 'Không có thông tin'} */}
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Nhóm học viên</h3>
                    <h5>Nhóm học viên thuộc cơ sở Hiệp Phát</h5>
                    {this.state.insideGroups.length ? divisionTeachers.reduce((result, item, index) => item && !item.isOutside ? [...result, (<div key={index} style={{ marginTop: 10 }}>
                        <h6>{item.title}</h6>
                        {renderGroups(this.state.insideGroups.filter(item1 => item._id == item1.teacher.division))}
                    </div>)] : result, []) : 'Không có thông tin'}
                    <h5>Nhóm học viên thuộc cơ sở ngoài</h5>
                    {this.state.outsideGroups.length ? divisionTeachers.reduce((result, item, index) => item && item.isOutside ? [...result, (<div key={index} style={{ marginTop: 10 }}>
                        <h6>{item.title}</h6>
                        {renderGroups(this.state.outsideGroups.filter(item1 => item._id == item1.teacher.division))}
                    </div>)] : result, []) : 'Không có thông tin'}
                </div>
                <CirclePageButton type='export' onClick={exportScore} />
                <CirclePageButton type='custom' customClassName='btn btn-success' customIcon='fa-file-excel-o' style={{ right: 70 }} />
                {/* {permission.export ? <CirclePageButton type='export' style={{}} /> : null} */}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student, course: state.course });
const mapActionsToProps = { getDivisionAll, getPreStudentAll, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
