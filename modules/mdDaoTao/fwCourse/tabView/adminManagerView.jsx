import React from 'react';
import { connect } from 'react-redux';
import { getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { getCourse, updateCourse } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class AdminManagerView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getDivisionAll(list => {
            const divisionMapper = {};
            (list || []).map(item => divisionMapper[item._id] = item);
            this.divisionMapper = divisionMapper;
        });

        $(document).ready(() => {
            this.selectAdmin.value(null);
            this.selectTeacher.value(null);
        });
    }

    addAdmin = e => {
        e.preventDefault();
        const { _id, admins = [] } = this.props.course.item,
            _adminUserId = this.selectAdmin.value();
        if (_adminUserId && admins.find(item => item._id == _adminUserId) == null) {
            admins.push(_adminUserId);
            this.props.updateCourse(_id, { admins }, () => {
                this.selectAdmin.value(null);
                this.props.getCourse(_id);
            });
        }
    };
    removeAdmin = (e, index) => e.preventDefault() || T.confirm('Xoá quản trị viên', 'Bạn có chắc muốn xoá quản trị viên khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, admins = [] } = this.props.course.item;
            admins.splice(index, 1);
            this.props.updateCourse(_id, { admins: admins.length ? admins : 'empty' }, () => this.props.getCourse(_id));
        }
    });

    addTeacher = e => {
        e.preventDefault();
        const { _id, teacherGroups = [] } = this.props.course.item,
            _teacherUserId = this.selectTeacher.value();
        if (_teacherUserId && teacherGroups.find(({ teacher }) => teacher._id == _teacherUserId) == null) {
            teacherGroups.push({ teacher: _teacherUserId });
            this.props.updateCourse(_id, { teacherGroups }, () => {
                this.selectTeacher.value(null);
                this.props.getCourse(_id);
            });
        }
    };
    removeTeacher = (e, index) => e.preventDefault() || T.confirm('Xoá cố vấn học tập', 'Bạn có chắc muốn xoá cố vấn học tập khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, teacherGroups = [] } = this.props.course.item;
            teacherGroups.splice(index, 1);
            this.props.updateCourse(_id, { teacherGroups: teacherGroups.length ? teacherGroups : 'empty' }, () => this.props.getCourse(_id));
        }
    });

    render() {
        const { permission, permissionUser, permissionDivision } = this.props,
            item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [], teacherGroups: [] };
        const permissionTeacherWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);

        const tableAdmin = renderTable({
            getDataSource: () => item.admins,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '60%' }}>Họ và Tên</th>
                    <th style={{ width: '40%' }} nowrap='true'>Cơ sở đào tạo</th>
                    {permission.write && <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                </tr>),
            renderRow: (item, index) => {
                let division = this.divisionMapper && item.division ? this.divisionMapper[item.division] : null,
                    divisionText = division ? `${division.title} ${division.isOutside ? '(CS ngoài)' : ''}` : '';
                return (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        {permissionUser.read ?
                            <TableCell type='link' content={item.lastname + ' ' + item.firstname} url={item._id ? '/user/member?user=' + item._id : ''} /> :
                            <TableCell content={item.lastname + ' ' + item.firstname} />}
                        {permissionDivision.read ?
                            <TableCell type='link' content={divisionText} url={division && division._id ? '/user/division/' + division._id : ''} /> :
                            <TableCell content={divisionText} />}
                        {permission.write ?
                            <td>
                                <div className='btn-group'>
                                    <a className='btn btn-danger' href='#' onClick={e => this.removeAdmin(e, index)}><i className='fa fa-lg fa-trash' /></a>
                                </div>
                            </td> : null}
                    </tr>);
            },
        });

        const tableTeacher = renderTable({
            getDataSource: () => this.divisionMapper && item.teacherGroups,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '60%' }}>Họ và Tên</th>
                    <th style={{ width: '40%' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const teacher = item.teacher || { lastname: 'Không có thông tin!' };
                let division = teacher.division ? this.divisionMapper[teacher.division] : null,
                    divisionText = division ? `${division.title} ${division.isOutside ? '(CS ngoài)' : ''}` : '';
                return (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell content={teacher.lastname + ' ' + teacher.firstname} />
                        {permissionDivision.read ?
                            <TableCell type='link' content={divisionText} url={division && division._id ? '/user/division/' + division._id : ''} /> :
                            <TableCell content={divisionText} />}
                        <td>
                            <div className='btn-group'>
                                <a className='btn btn-danger' href='#' onClick={e => this.removeTeacher(e, index)}><i className='fa fa-lg fa-trash' /></a>
                            </div>
                        </td>
                    </tr>);
            },
        });

        return (
            <div className='tile-body row'>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Quản trị viên</h3>
                    <div style={{ display: permission.write ? 'flex' : 'none' }}>
                        <FormSelect ref={e => this.selectAdmin = e} data={ajaxSelectUserType(['isCourseAdmin'])} style={{ width: '100%' }} />
                        <div style={{ width: 'auto', paddingLeft: 8 }}>
                            <button className='btn btn-success' type='button' onClick={this.addAdmin}>
                                <i className='fa fa-fw fa-lg fa-plus' /> Quản trị viên
                            </button>
                        </div>
                    </div>
                    {tableAdmin}
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
                    {tableTeacher}
                </div>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division, course: state.trainning.course });
const mapActionsToProps = { getDivisionAll, getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminManagerView);
