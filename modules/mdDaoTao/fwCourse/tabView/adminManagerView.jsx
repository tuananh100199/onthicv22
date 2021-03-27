import React from 'react';
import { connect } from 'react-redux';
import { getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { getCourse, updateCourse } from '../redux';
import { ajaxSelectAdmin } from 'modules/_default/fwUser/redux';
import { FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class AdminManagerView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getDivisionAll(list => {
            this.divisionMapper = {};
            (list || []).map(item => this.divisionMapper[item._id] = item);
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
        const { _id, groups = [] } = this.props.course.item,
            _teacherUserId = this.selectTeacher.value();
        if (_teacherUserId && groups.find(({ teacher, students }) => teacher._id == _teacherUserId) == null) {
            groups.push({ teacher: _teacherUserId });
            this.props.updateCourse(_id, { groups }, () => {
                this.selectTeacher.value(null);
                this.props.getCourse(_id);
            });
        }
    };
    removeTeacher = (e, index) => e.preventDefault() || T.confirm('Xoá cố vấn học tập', 'Bạn có chắc muốn xoá cố vấn học tập khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, groups = [] } = this.props.course.item;
            groups.splice(index, 1);
            this.props.updateCourse(_id, { groups: groups.length ? groups : 'empty' }, () => this.props.getCourse(_id));
        }
    });

    render() {
        const { permission, permissionUser, permissionDivision } = this.props,
            item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [], groups: [] };
        const tableAdmin = renderTable({
            getDataSource: () => item.admins,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cơ sở ngoài</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let division = item.division ? this.divisionMapper[item.division] : null;
                if (division == null) division = { title: '', isOutsite: false };
                return (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        {permissionUser.read ?
                            <TableCell type='link' content={item.lastname + ' ' + item.firstname} url={item._id ? '/user/member?user=' + item._id : ''} /> :
                            <TableCell content={item.lastname + ' ' + item.firstname} />}
                        {permissionDivision.read ?
                            <TableCell type='link' content={division.title} url={division._id ? '/user/division/' + division._id : ''} /> :
                            <TableCell content={division.title} />}
                        <TableCell content={division.isOutside ? 'X' : ''} style={{ textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onDelete={e => this.removeAdmin(e, index)} />
                    </tr>);
            },
        });

        const tableTeacher = renderTable({
            getDataSource: () => item.groups,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cơ sở ngoài</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const teacher = item.teacher || { lastname: 'Không có thông tin!' };
                let division = teacher.division ? this.divisionMapper[teacher.division] : null;
                if (division == null) division = { title: '', isOutsite: false };
                return (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell content={teacher.lastname + ' ' + teacher.firstname} />
                        {permissionDivision.read ?
                            <TableCell type='link' content={division.title} url={division._id ? '/user/division/' + division._id : ''} /> :
                            <TableCell content={division.title} />}
                        <TableCell content={division.isOutside ? 'X' : ''} style={{ textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onDelete={e => this.removeTeacher(e, index)} />
                    </tr>);
            },
        });

        return (
            <div className='tile-body row'>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Quản trị viên</h3>
                    {permission.write ?
                        <div style={{ display: 'flex' }}>
                            <FormSelect ref={e => this.selectAdmin = e} data={ajaxSelectAdmin} style={{ width: '100%' }} />
                            <div style={{ width: 'auto', paddingLeft: 8 }}>
                                <button className='btn btn-success' type='button' onClick={this.addAdmin}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Quản trị viên
                                </button>
                            </div>
                        </div> : null}
                    {tableAdmin}
                </div>

                <div className='col-md-6'>
                    <h3 className='tile-title'>Cố vấn học tập</h3>
                    {permission.write ?
                        <div style={{ display: 'flex' }}>
                            <FormSelect ref={e => this.selectTeacher = e} data={ajaxSelectAdmin} style={{ width: '100%' }} />
                            <div style={{ width: 'auto', paddingLeft: 8 }}>
                                <button className='btn btn-success' type='button' onClick={this.addTeacher}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Cố vấn học tập
                                </button>
                            </div>
                        </div> : null}
                    {tableTeacher}
                </div>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division, course: state.course });
const mapActionsToProps = { getDivisionAll, getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminManagerView);
