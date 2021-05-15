import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { FormSelect } from 'view/component/AdminPage';

class AdminTeacherView extends React.Component {
    state = {};
    componentDidMount() {
    }

    addTeacher = e => {
        e.preventDefault();
        const { _id, teacherGroups = [] } = this.props.course.item,
            _teacherUserId = this.selectTeacher.value();
        if (_teacherUserId && teacherGroups.find(({ teacher }) => teacher._id == _teacherUserId) == null) {
            teacherGroups.push({ teacher: _teacherUserId });
            this.props.updateCourse(_id, { teacherGroups }, () => this.props.getCourse(_id));
        }
    };
    removeTeacher = (e, index) => e.preventDefault() || T.confirm('Xoá Cố vấn học tập', 'Bạn có chắc muốn xoá Cố vấn học tập khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, teacherGroups = [] } = this.props.course.item;
            teacherGroups.splice(index, 1);
            this.props.updateCourse(_id, { teacherGroups: teacherGroups.length ? teacherGroups : 'empty' }, () => this.props.getCourse(_id));
        }
    });

    render() {
        const permission = this.props.permission,
            // divisions = this.state.divisions;
            permissionTeacherWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);
        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <h5>Học viên thuộc cơ sở Hiệp Phát</h5>
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Cố vấn học tập</h3>
                    <div style={{ display: permissionTeacherWrite ? 'flex' : 'none' }}>
                        <FormSelect ref={e => this.selectTeacher = e} data={ajaxSelectUserType(['isLecturer'])} style={{ width: '100%' }} />
                        <div style={{ width: 'auto', paddingLeft: 8 }}>
                            <button className='btn btn-success' type='button' onClick={this.addTeacher}>
                                <i className='fa fa-fw fa-lg fa-plus' /> Cố vấn học tập
                            </button>
                        </div>
                    </div>
                    <h5>Nhóm học viên thuộc cơ sở Hiệp Phát</h5>
                </div>
                {/* <CirclePageButton type='export' onClick={exportScore(this.props.course && this.props.course.item && this.props.course.item._id)} /> */}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { getCourse, getDivisionAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherView);
