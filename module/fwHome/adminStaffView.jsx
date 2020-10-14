import React from 'react';
import { connect } from 'react-redux';
import { getAllStaffGroups, createStaffGroup, deleteStaffGroup } from './redux/reduxStaffGroup.jsx';
import { Link } from 'react-router-dom';

class StaffGroupModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#staffGroupViName').focus())
        }, 250));
    }

    show = () => {
        $('#staffGroupViName').val('');
        $('#staffGroupEnName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const item = { vi: $('#staffGroupViName').val().trim(), en: $('#staffGroupEnName').val().trim() };
        if (item.vi == '') {
            T.notify('Tên nhóm nhân viên bị trống!', 'danger');
            $('#staffViGroupName').focus();
        } else if (item.en == '') {
            T.notify('The name of staff group is empty now!', 'danger');
            $('#staffViGroupName').focus();
        } else {
            this.props.createStaffGroup(JSON.stringify(item), data => {
                if (data.error == undefined || data.error == null) {
                    $(this.modal.current).modal('hide');
                    if (data.staffGroup) {
                        this.props.showStaffGroup(data.staffGroup);
                    }
                }
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin nhóm nhân viên</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='staffGroupViName'>Tên nhóm nhân viên</label>
                                <input className='form-control' id='staffGroupViName' type='text' placeholder='Tên nhóm nhân viên' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='staffGroupEnName'>The name of staff group</label>
                                <input className='form-control' id='staffGroupEnName' type='text' placeholder='The name of staff group' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' ref={this.btnSave}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class StaffGroupPage extends React.Component {
    constructor(props) {
        super(props);
        this.staffGroupModal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllStaffGroups();
    }

    create = (e) => {
        this.staffGroupModal.current.show();
        e.preventDefault();
    }

    show = (staffGroup) => {
        this.props.history.push('/user/staff-group/edit/' + staffGroup._id);
    }

    delete = (e, item) => {
        T.confirm('Xóa nhóm nhân viên', 'Bạn có chắc bạn muốn xóa nhóm nhân viên này?', true, isConfirm => isConfirm && this.props.deleteStaffGroup(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null;
        if (this.props.staffGroup && this.props.staffGroup.list && this.props.staffGroup.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên nhóm</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lượng</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.staffGroup.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/staff-group/edit/' + item._id} data-id={item._id}>{T.language.parse(item.title, true).vi}</Link>
                                </td>
                                <td style={{ textAlign: 'right' }}>{item.staff.length}</td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/staff-group/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.includes('component:write') ? <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p key={0}>Không có nhóm nhân viên!</p>;
        }

        return [
            table,
            <StaffGroupModal key={1} createStaffGroup={this.props.createStaffGroup} showStaffGroup={this.show} ref={this.staffGroupModal} />,
            currentPermissions.includes('component:write') ? <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                onClick={this.create}>
                <i className='fa fa-lg fa-plus' />
            </button> : null,
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, staffGroup: state.staffGroup });
const mapActionsToProps = { getAllStaffGroups, createStaffGroup, deleteStaffGroup };
export default connect(mapStateToProps, mapActionsToProps)(StaffGroupPage);