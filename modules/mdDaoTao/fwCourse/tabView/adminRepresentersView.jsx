import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourseRepresenterGroup, updateCourseRepresenterGroupStudent } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { getStudentCourse } from 'modules/mdDaoTao/fwStudent/redux';
import { FormSelect, FormTextBox, AdminModal } from 'view/component/AdminPage';

class RepresenterModal extends AdminModal {
    onShow = (e) => {
        e.preventDefault();
    };

    addStudent = (e, _representerId) => {
        e.preventDefault();
        const { _id } = this.props.course;
        this.props.add(_id, _representerId, this.props.student._id, 'add', () => {
            this.props.getStudentCourse({ course: _id });
            this.hide();
        });
    }

    render = () => {
        const representers = this.props.course.representerGroups.reduce((result, item, index) => item.representer && item.representer.division && item.representer.division._id == this.props.division._id ?
            [...result,
            <li style={{ margin: 10 }} key={index}>
                <a href='#' style={{ color: 'black' }} onClick={e => this.addStudent(e, item.representer._id)}>
                    {`${item.representer.lastname} ${item.representer.firstname}`}
                </a>
            </li>
            ] : result, []);
        return this.renderModal({
            title: 'Gán giáo viên',
            body: <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}> {representers.length ? representers : 'Không có giáo viên'} </ol>
        });
    };
}
class AdminRepresentersView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.course && this.props.course.item && this.props.getStudentCourse({ course: this.props.course.item._id });
    }
    addRepresenter = e => {
        e.preventDefault();
        const { _id, representerGroups = [] } = this.props.course.item,
            _representerId = this.selectRepresenter.value();
        if (_representerId && representerGroups.find(({ representer }) => representer._id == _representerId) == null) {
            this.props.updateCourseRepresenterGroup(_id, _representerId, 'add', () => this.selectRepresenter.value(null));
        }
    };

    removeRepresenter = (e, representer) => e.preventDefault() || T.confirm('Xoá giáo viên', `Bạn có chắc muốn xoá giáo viên ${representer.lastname} ${representer.firstname} khỏi khóa học này?`, true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id } = this.props.course.item;
            this.props.updateCourseRepresenterGroup(_id, representer._id, 'remove', () => {
                this.props.getStudentCourse({ course: _id });
            });
        }
    });

    removeStudent = (e, representer, student) => {
        e.preventDefault();
        const { _id } = this.props.course.item;
        this.props.updateCourseRepresenterGroupStudent(_id, representer._id, student._id, 'remove', () => {
            this.props.getStudentCourse({ course: _id });
        });
    }

    render() {
        const permission = this.props.permission,
            permissionRepresenterWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);
        const courseList = this.props.student && this.props.student.courseList ? this.props.student.courseList.representers : [];
        const _id = this.props.course && this.props.course.item ? this.props.course.item._id : null;
        const representerGroups = this.props.course && this.props.course.item ? this.props.course.item.representerGroups : [];
        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Học viên chưa gán Giáo viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentCourse(this.props.course.item._id, e.target.value,
                            list => this.setState({ courseList: list }))} />
                        {courseList.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {courseList.map((item, index) => (
                                <li style={{ margin: 10 }} key={index}>
                                    <a href='#' style={{ color: 'black' }} onClick={e => _id && this[`modal${item._id}`].show(e)}>
                                        {`${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division && item.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                    </a>
                                    <RepresenterModal ref={e => this[`modal${item._id}`] = e} readOnly={!permission.write} add={this.props.updateCourseRepresenterGroupStudent}
                                        course={this.props.course.item} division={item.division} student={item} getStudentCourse={this.props.getStudentCourse} />
                                </li>))}
                        </ol> : <label>Chưa có học viên!</label>}
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Danh sách Giáo viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <label>Tìm kiếm giáo viên</label>
                        <div style={{ display: permissionRepresenterWrite ? 'flex' : 'none' }}>
                            <FormSelect ref={e => this.selectRepresenter = e} data={ajaxSelectUserType(['isRepresenter'])} style={{ width: '100%' }} />
                            <div style={{ width: 'auto', paddingLeft: 8 }}>
                                <button className='btn btn-success' type='button' onClick={this.addRepresenter}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Giáo viên
                                </button>
                            </div>
                        </div>
                        {representerGroups.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {representerGroups.map((item, index) => item.representer ?
                                <li className='text-primary' style={{ margin: 10 }} key={index}>
                                    <a href='#' className='text-primary' onClick={e => _id && this.removeRepresenter(e, item.representer)}>
                                        {`${item.representer.lastname} ${item.representer.firstname}`} - {item.representer.division && item.representer.division.title}{item.representer.division && item.representer.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                    </a>
                                    <ul style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                        {item.student.length ? item.student.map((student, indexStudent) => (
                                            <li key={indexStudent} style={{ margin: 10, color: 'black' }}>
                                                <a href='#' style={{ color: 'black' }} onClick={e => _id && this.removeStudent(e, item.representer, student)}>
                                                    {`${student.lastname} ${student.firstname}`} - {student.division && student.division.title}{student.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                                </a>
                                            </li>
                                        )) : <label style={{ color: 'black' }}>Chưa có học viên!</label>}
                                    </ul>
                                </li> : null)}
                        </ol> : <label style={{ color: 'black' }}>Chưa có giáo viên!</label>}
                    </div>
                </div>
                {/* <CirclePageButton type='export' onClick={exportScore(this.props.course && this.props.course.item && this.props.course.item._id)} /> */}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { getCourse, getStudentCourse, updateCourseRepresenterGroup, updateCourseRepresenterGroupStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminRepresentersView);
