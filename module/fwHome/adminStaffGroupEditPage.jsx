import React from 'react';
import { connect } from 'react-redux';
import { getStaffGroupItem, updateStaffGroup, addStaffIntoGroup, updateStaffInGroup, removeStaffFromGroup, swapStaffInGroup } from './redux/reduxStaffGroup.jsx';
import { getAllStaffs } from '../fwUser/redux.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import Select from 'react-select';

class StaffModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { staffs: [], selectedStaff: null };

        this.modal = React.createRef();
        this.editor = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).on('shown.bs.modal', () => $('#sgaName').focus()), 250);
        });
    }

    show = (staffs, selectedStaff, index) => {
        const value = selectedStaff ? { value: selectedStaff.user._id, label: selectedStaff.user.firstname + ' ' + selectedStaff.user.lastname } : null;
        this.setState({ selectedStaff: value, staffs });
        this.editor.current.html(selectedStaff ? selectedStaff.content : '');
        $(this.btnSave.current).data('isNewMember', selectedStaff == null).data('index', index);

        $(this.modal.current).modal('show');
    };

    hide = () => $(this.modal.current).modal('hide');

    onSelectStaff = (selectedStaff) => this.setState({ selectedStaff });

    save = (event) => {
        if (this.state.selectedStaff) {
            const btnSave = $(this.btnSave.current),
                isNewMember = btnSave.data('isNewMember'),
                index = btnSave.data('index'),
                userId = this.state.selectedStaff.value;
            if (isNewMember) {
                this.props.addStaff(userId, this.editor.current.html());
            } else {
                this.props.updateStaff(index, userId, this.editor.current.html());
            }
        } else {
            T.notify('Tên nhân viên bị trống!', 'danger');
        }
        event.preventDefault();
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thêm nhân viên vào nhóm</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='sgaName'>Tên nhân viên</label><br />
                                <Select options={this.state.staffs} isClearable={true} onChange={this.onSelectStaff} value={this.state.selectedStaff} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='sgaContent'>Nội dung</label>
                                <Editor ref={this.editor} placeholder='Nội dung' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class StaffGroupEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.staffGroupId = null;
    }

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/staff-group/edit/:staffGroupId'),
                params = route.parse(window.location.pathname);

            this.props.getStaffGroupItem(params.staffGroupId, data => {
                if (data.error) {
                    T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    this.staffGroupId = params.staffGroupId;
                    const title = T.language.parse(data.item.title, true);
                    $('#stfViTitle').val(title.vi).focus();
                    $('#stfEnTitle').val(title.en);
                } else {
                    this.props.history.push('/user/component');
                }
            });

            this.props.getAllStaffs();
        });
    }

    showAddStaffModal = () => {
        let staffs = this.props.user.staffs.map(item => ({ value: item._id, label: item.firstname + ' ' + item.lastname }));
        this.modal.current.show(staffs);
    };

    showEditStaffModal = (e, selectedStaff, index) => {
        let staffs = this.props.user.staffs.map(item => ({ value: item._id, label: item.firstname + ' ' + item.lastname }));
        this.modal.current.show(staffs, selectedStaff, index);
        e.preventDefault();
    };

    add = (userId, content) => {
        this.props.addStaffIntoGroup(userId, content, () => this.modal.current.hide());
    };

    update = (index, userId, content) => {
        this.props.updateStaffInGroup(index, userId, content, () => this.modal.current.hide());
    };

    remove = (e, user) => {
        this.props.removeStaffFromGroup(user._id);
        e.preventDefault();
    };

    swap = (e, user, isMoveUp) => {
        this.props.swapStaffInGroup(user._id, isMoveUp);
        e.preventDefault();
    };

    save = () => {
        const changes = {
            title: JSON.stringify({ vi: $('#stfViTitle').val(), en: $('#stfEnTitle').val() }),
            staff: this.props.staffGroup.item.staff,
        };
        if (changes.staff && changes.staff.length == 0) changes.staff = 'empty';
        this.props.updateStaffGroup(this.props.staffGroup.item._id, changes);
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null,
            currentStaffGroup = this.props.staffGroup && this.props.staffGroup.item ? this.props.staffGroup.item : null;
        if (currentStaffGroup && currentStaffGroup.staff.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Nhân viên</th>
                            {currentPermissions.includes('component:write') ? <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {currentStaffGroup.staff.map((item, index) => (
                            <tr key={index}>
                                <td style={{ width: 'auto', textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    {readOnly ?
                                        <a>
                                            {item.user.firstname + ' ' + item.user.lastname}
                                        </a>
                                        :
                                        <a href='#' onClick={e => this.showEditStaffModal(e, item, index)}>
                                            {item.user.firstname + ' ' + item.user.lastname}
                                        </a>}
                                </td>
                                {!readOnly ? <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showEditStaffModal(e, item, index)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có nhân viên!</p>;
        }

        const title = T.language.parse(currentStaffGroup && currentStaffGroup.title && currentStaffGroup.title != '' ? currentStaffGroup.title : '<empty>', true);
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-group' /> Nhóm nhân viên: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <div className='form-group'>
                                <label className='control-label'>Tiêu đề</label>
                                <input className='form-control' type='text' placeholder='Tiêu đề' id='stfViTitle' defaultValue={title.vi} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label className='control-label'>Title</label>
                                <input className='form-control' type='text' placeholder='Title' id='stfEnTitle' defaultValue={title.en} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>{table}</div>
                        </div>
                        {!readOnly ? <div className='tile-footer'>
                            <div className='row'>
                                <div className='col-md-12' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-info' type='button' onClick={this.showAddStaffModal}>
                                        <i className='fa fa-fw fa-lg fa-plus' />Thêm nhân viên
                                    </button>&nbsp;
                                    <button className='btn btn-primary' type='button' onClick={this.save}>
                                        <i className='fa fa-fw fa-lg fa-save' />Lưu
                                    </button>
                                </div>
                            </div>
                        </div> : null}
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <StaffModal ref={this.modal} addStaff={this.add} updateStaff={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, staffGroup: state.staffGroup, user: state.user });
const mapActionsToProps = { getStaffGroupItem, updateStaffGroup, addStaffIntoGroup, updateStaffInGroup, removeStaffFromGroup, swapStaffInGroup, getAllStaffs };
export default connect(mapStateToProps, mapActionsToProps)(StaffGroupEditPage);
