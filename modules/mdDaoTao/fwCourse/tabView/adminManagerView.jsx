import React from 'react';
import { connect } from 'react-redux';
import { updateCourse } from '../redux';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import { FormSelect } from 'view/component/AdminPage';

class AdminManagerView extends React.Component {
    state = {};
    componentDidMount() { }

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
        const { permission } = this.props,
            item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        return (
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
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminManagerView);
