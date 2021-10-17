import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect } from 'view/component/AdminPage';

class AdminManagerPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/manager').parse(window.location.pathname);
            const course = this.props.course ? this.props.course.item : null;
            if (!course) {
                if (params._id) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                } else {
                    this.props.history.push('/user/course/');
                }
            }
        });
    }

    addAdmin = e => {
        e.preventDefault();
        const { _id, admins = [] } = this.props.course.item,
            _adminUserId = this.selectAdmin.value();
        if (_adminUserId && admins.find(item => item._id == _adminUserId) == null) {
            admins.push(_adminUserId);
            this.props.updateCourse(_id, { admins }, () => this.selectAdmin.value(null));
        } else {
            T.notify('Bạn chọn trùng quản trị viên', 'danger');
        }
    }

    removeAdmin = (e, index, item) => e.preventDefault() || T.confirm('Xoá quản trị viên', `Bạn có chắc muốn xoá quản trị viên ${item.lastname + ' ' + item.firstname} khỏi khóa học này?`, true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, admins = [] } = this.props.course.item;
            admins.splice(index, 1);
            this.props.updateCourse(_id, { admins: admins.length ? admins : 'empty' });
        }
    });

    render() {
        const permission = this.getUserPermission('course'),
            item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-user-secret',
            title: 'Gán Quản trị viên khóa học: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Môn học'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-6'>
                            <h3 className='tile-title'>Quản trị viên</h3>
                            <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                                <label>Tìm kiếm quản trị viên</label>
                                <div style={{ display: permission.write ? 'flex' : 'none' }}>
                                    <FormSelect ref={e => this.selectAdmin = e} data={ajaxSelectUserType(['isCourseAdmin'])} style={{ width: '100%' }} />
                                    <div style={{ width: 'auto', paddingLeft: 8 }}>
                                        <button className='btn btn-success' type='button' onClick={this.addAdmin}><i className='fa fa-fw fa-lg fa-plus' /></button>
                                    </div>
                                </div>
                                {item.admins.length ?
                                    <ol className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                        {item.admins.map((item, index) => (
                                            <li key={index}>
                                                <div style={{ display: 'inline-flex' }}>
                                                    {item.lastname} {item.firstname} ({item.identityCard}) - {item.division && item.division.title}&nbsp;
                                                    {item.division && item.division.isOutside ? <span className='text-secondary'>(cơ sở ngoài)</span> : ''}
                                                    <div className='buttons'>
                                                        <a href='#' onClick={e => this.removeAdmin(e, index, item)}>
                                                            <i style={{ marginLeft: 10, color: 'red' }} className='fa fa-times' />
                                                        </a>
                                                    </div>
                                                </div>
                                            </li>))}
                                    </ol> : <label>Chưa có Quản trị viên!</label>}
                            </div>
                        </div>
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminManagerPage);
