import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourseRepresenterGroup, updateCourseRepresenterGroupStudent } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { FormSelect, FormTextBox, AdminModal } from 'view/component/AdminPage';

class RepresenterModal extends AdminModal {
    state = { representers: [] };
    onShow = (e) => {
        e.preventDefault();
        const representers = this.props.course.representerGroups.reduce((result, item) => item.representer.division._id == this.props.division._id ? [...result, item.representer] : result, []);
        representers.forEach(i => i.isSelected = false);
        this.setState({ representers });
    };

    onClick = (e, _id, index) => {
        e.preventDefault();
        const representers = this.state.representers;
        representers.forEach(i => i.isSelected = false);
        representers[index].isSelected = true;
        this.setState({ representers, _id });
    }

    onSubmit = () => {
        if (this.state._id) {
            const { _id } = this.props.course;
            this.props.add(_id, this.state._id, this.props.student._id, 'add', () => {
                this.props.getCourse({ course: _id });
                this.hide();
            });
        } else {
            T.notify('Chưa chọn giáo viên', 'danger');
        }
    }

    render = () => {
        const representers = this.state.representers.map((item, index) =>
            <li className={this.state.representers[index].isSelected && 'text-primary'} style={{ margin: 10 }} key={index}>
                <a onClick={e => this.onClick(e, item._id, index)}>
                    {`${item.lastname} ${item.firstname}`}
                </a>
            </li>);
        return this.renderModal({
            title: 'Gán giáo viên',
            body: <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}> {representers.length ? representers : 'Không có giáo viên'} </ol>
        });
    };
}

class AdminRepresentersView extends React.Component {
    state = { searchStudentText: '' };
    componentDidMount() { }

    addRepresenter = e => {
        e.preventDefault();
        const { _id, representerGroups = [] } = this.props.course.item,
            _representerId = this.selectRepresenter.value();
        if (_representerId && representerGroups.find(({ representer }) => representer._id == _representerId) == null) {
            this.props.updateCourseRepresenterGroup(_id, _representerId, 'add', () => this.selectRepresenter.value(null));
        }
    }

    removeRepresenter = (e, representer) => e.preventDefault() || T.confirm('Xoá giáo viên', `Bạn có chắc muốn xoá giáo viên ${representer.lastname} ${representer.firstname} khỏi khóa học này?`, true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id } = this.props.course.item;
            this.props.updateCourseRepresenterGroup(_id, representer._id, 'remove', () => this.props.getCourse(_id));
        }
    });

    removeStudent = (e, representer, student) => e.preventDefault() ||
        this.props.updateCourseRepresenterGroupStudent(this.props.course.item._id, representer._id, student._id, 'remove', () => this.props.getCourse(this.props.course.item._id));

    render() {
        const permission = this.props.permission,
            permissionRepresenterWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);
        const { _id, students, representerGroups } = this.props.course && this.props.course.item ? this.props.course.item : {};
        const { searchStudentText } = this.state,
            studentList = [];
        (students || []).forEach((student, index) => {
            if ((searchStudentText == '' || (student.lastname + ' ' + student.firstname).toLowerCase().includes(searchStudentText)) && student.division && !student.division.isOutside) {
                studentList.push(
                    <li style={{ margin: 10 }} key={index}>
                        <a href='#' style={{ color: 'black' }} onClick={e => _id && this[`modal${student._id}`].show(e)}>
                            {`${student.lastname} ${student.firstname}`} - {student.division && student.division.title}{student.division && student.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                        </a>
                        <RepresenterModal ref={e => this[`modal${student._id}`] = e} readOnly={!permission.write} add={this.props.updateCourseRepresenterGroupStudent}
                            course={this.props.course.item} division={student.division} student={student} getCourse={this.props.getCourse} />
                    </li>)
            }
        });

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Học viên chưa gán Giáo viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.setState({ searchStudentText: e.target.value })} />
                        {studentList.length ? studentList : <label>Chưa có học viên!</label>}
                    </div>
                </div>

                <div className='col-md-6'>
                    <h3 className='tile-title'>Danh sách Giáo viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <label>Tìm kiếm giáo viên</label>
                        <div style={{ display: permissionRepresenterWrite ? 'flex' : 'none' }}>
                            <FormSelect ref={e => this.selectRepresenter = e} data={ajaxSelectUserType(['isRepresenter'])} style={{ width: '100%' }} />
                            <div style={{ width: 'auto', paddingLeft: 8 }}>
                                <button className='btn btn-success' type='button' onClick={this.addRepresenter}><i className='fa fa-plus' /></button>
                            </div>
                        </div>
                        {representerGroups.length ?
                            <ol className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                                {representerGroups.map((item, index) => item.representer ?
                                    <li className='text-primary' style={{ margin: 10 }} key={index}>
                                        <div style={{ display: 'inline-flex' }}>
                                            {`${item.representer.lastname} ${item.representer.firstname}`} - {item.representer.division && item.representer.division.title}
                                            {item.representer.division && item.representer.division.isOutside ? <span className='text-secondary'>&nbsp;(cơ sở ngoài)</span> : ''}
                                            <div className='buttons'>
                                                <a href='#' onClick={e => _id && this.removeRepresenter(e, item.representer)}>
                                                    <i style={{ marginLeft: 10 }} className='fa fa-times text-danger' />
                                                </a>
                                            </div>
                                        </div>
                                        <ul style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                            {item.student.length ? item.student.map((student, indexStudent) => (
                                                <li key={indexStudent} style={{ margin: 10, color: 'black' }}>
                                                    <a href='#' style={{ color: 'black' }} onClick={e => _id && this.removeStudent(e, item.representer, student)}>
                                                        {`${student.lastname} ${student.firstname}`} - {student.division && student.division.title}
                                                        {student.division && student.division.isOutside ? <span className='text-secondary'>&nbsp;(cơ sở ngoài)</span> : ''}
                                                    </a>
                                                </li>
                                            )) : <label style={{ color: 'black' }}>Chưa có học viên!</label>}
                                        </ul>
                                    </li> : null)}
                            </ol> : <label style={{ color: 'black' }}>Chưa có giáo viên!</label>}
                    </div>
                </div>
                {/* <CirclePageButton type='export' onClick={TODO} /> */}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourseRepresenterGroup, updateCourseRepresenterGroupStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminRepresentersView);
