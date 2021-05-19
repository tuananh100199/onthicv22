import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { FormSelect } from 'view/component/AdminPage';

class AdminManagerView extends React.Component {
    state = { admins: [] };
    componentDidMount() {
        const admins = this.props.course && this.props.course.item && this.props.course.item.admins || [];
        admins.forEach(i => i.isSelected = false);
        this.setState({ admins });
    }

    onHover = (e, index, type) => {
        e.preventDefault();
        const admins = this.state.admins || [];
        admins.forEach(i => i.isSelected = false);
        if (type == 'onHover') {
            admins[index].isSelected = true;
        }
        this.setState({ admins });
    }

    addAdmin = e => {
        e.preventDefault();
        const { _id, admins = [] } = this.props.course.item,
            _adminUserId = this.selectAdmin.value();
        if (_adminUserId && admins.find(item => item._id == _adminUserId) == null) {
            admins.push(_adminUserId);
            this.props.updateCourse(_id, { admins }, () => {
                this.selectAdmin.value(null);
                this.props.getCourse(_id, data => this.setState({ admins: data.item.admins }));
            });
        } else {
            T.notify('Bạn chọn trùng quản trị viên', 'danger');
        }
    };
    removeAdmin = (e, index) => e.preventDefault() || T.confirm('Xoá quản trị viên', 'Bạn có chắc muốn xoá quản trị viên khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, admins = [] } = this.props.course.item;
            admins.splice(index, 1);
            this.props.updateCourse(_id, { admins: admins.length ? admins : 'empty' }, () => this.props.getCourse(_id, data => this.setState({ admins: data.item.admins })));
        }
    });

    render() {
        // const { permission, permissionUser, permissionDivision } = this.props,
        const { permission } = this.props,
            item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        // const permissionTeacherWrite = permission.write || (this.props.currentUser && this.props.currentUser.isCourseAdmin);

        // const tableAdmin = renderTable({
        //     getDataSource: () => item.admins,
        //     renderHead: () => (
        //         <tr>
        //             <th style={{ width: 'auto' }}>#</th>
        //             <th style={{ width: '60%' }}>Họ và Tên</th>
        //             <th style={{ width: '40%' }} nowrap='true'>Cơ sở đào tạo</th>
        //             {permission.write && <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
        //         </tr>),
        //     renderRow: (item, index) => {
        //         let division = this.divisionMapper && item.division ? this.divisionMapper[item.division] : null,
        //             divisionText = division ? `${division.title} ${division.isOutside ? '(CS ngoài)' : ''}` : '';
        //         return (
        //             <tr key={index}>
        //                 <TableCell type='number' content={index + 1} />
        //                 {permissionUser.read ?
        //                     <TableCell type='link' content={item.lastname + ' ' + item.firstname} url={item._id ? '/user/member?user=' + item._id : ''} /> :
        //                     <TableCell content={item.lastname + ' ' + item.firstname} />}
        //                 {permissionDivision.read ?
        //                     <TableCell type='link' content={divisionText} url={division && division._id ? '/user/division/' + division._id : ''} /> :
        //                     <TableCell content={divisionText} />}
        //                 {permission.write ?
        //                     <td>
        //                         <div className='btn-group'>
        //                             <a className='btn btn-danger' href='#' onClick={e => this.removeAdmin(e, index)}><i className='fa fa-lg fa-trash' /></a>
        //                         </div>
        //                     </td> : null}
        //             </tr>);
        //     },
        // });

        return (
            <div className='tile-body row'>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Quản trị viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <label>Tìm kiếm quản trị viên</label>
                        <div style={{ display: permission.write ? 'flex' : 'none' }}>
                            <FormSelect ref={e => this.selectAdmin = e} data={ajaxSelectUserType(['isCourseAdmin'])} style={{ width: '100%' }} />
                            <div style={{ width: 'auto', paddingLeft: 8 }}>
                                <button className='btn btn-success' type='button' onClick={this.addAdmin}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Quản trị viên
                            </button>
                            </div>
                        </div>
                        {item.admins.length ? <ol style={{ width: '100%', paddingLeft: 20, margin: 0, overflow: 'hidden', overflowY: 'scroll', height: 'calc(100vh - 420px)' }}>
                            {item.admins.map((item, index) => (
                                <li style={{ margin: 10 }} key={index} onMouseEnter={(e) => this.onHover(e, index, 'onHover')}
                                    onMouseLeave={(e) => this.onHover(e, index, undefined)}>
                                    <a href='#' style={{ color: 'black' }}>
                                        {`${item.lastname} ${item.firstname}`} - {item.division && item.division.title}{item.division && item.division.isOutside ? <span className='text-secondary'> (cơ sở ngoài)</span> : ''}
                                    </a>
                                    {this.state.admins && this.state.admins[index] && this.state.admins[index].isSelected && permission.write ? <i onClick={e => this.removeAdmin(e, index)} style={{ marginLeft: 10, color: 'red' }} className='fa fa-times' /> : ''}
                                </li>))}
                        </ol> : <label>Chưa có quản trị viên!</label>}
                    </div>
                </div>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminManagerView);
