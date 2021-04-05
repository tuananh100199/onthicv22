import React from 'react';
import { connect } from 'react-redux';
import { getStaffGroup, updateStaffGroup, createStaff, updateStaff, swapStaff, deleteStaff, changeStaff } from './redux/reduxStaffGroup';
import { getAllStaffs } from '../fwUser/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, FormCheckbox, FormImageBox, TableCell, renderTable } from 'view/component/AdminPage';
import Select from 'react-select';

class StaffModal extends AdminModal {
    state = { staffs: [], selectedStaff: null };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => $(this.itemUser).select2('open')));
    }

    onShow = (item) => {
        let { _id, image, active, description, user } = Object.assign({ active: true, description: '' }, item);
        this.itemUser.value({ id: user._id, text: `${user.lastname} ${user.firstname} (${user.email})` });
        this.itemDescription.value(description);
        this.itemActive.value(active);
        this.imageBox.setData(`staff:${_id || 'new'}`);

        this.setState({ _id, carouselId, image });
    }

    show = (staffs, selectedStaff, index) => {
        const value = selectedStaff ? { value: selectedStaff.user._id, label: selectedStaff.user.firstname + ' ' + selectedStaff.user.lastname } : null;
        this.setState({ selectedStaff: value, staffs });
        this.editor.current.html(selectedStaff ? selectedStaff.content : '');
        // $(this.btnSave.current).data('isNewMember', selectedStaff == null).data('index', index);

        // $(this.modal.current).modal('show');
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
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class StaffGroupEditPage extends React.Component {
    staffGroupId = null;

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/staff-group/:staffGroupId'),
                params = route.parse(window.location.pathname);

            this.props.getStaffGroup(params.staffGroupId, data => {
                if (data.error) {
                    T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    this.staffGroupId = params.staffGroupId;
                    $('#stfTitle').val(data.item.title).focus();
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
        // this.props.addStaffIntoGroup(userId, content, () => this.modal.current.hide());
    };

    update = (index, userId, content) => {
        // this.props.updateStaffInGroup(index, userId, content, () => this.modal.current.hide());
    };

    remove = (e, user) => {
        // this.props.removeStaffFromGroup(user._id);
        e.preventDefault();
    };

    swap = (e, user, isMoveUp) => {
        // this.props.swapStaffInGroup(user._id, isMoveUp);
        e.preventDefault();
    };

    save = () => {
        const changes = {
            title: $('#stfTitle').val(),
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
                                        <a>{item.user.firstname + ' ' + item.user.lastname}</a> :
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

        const title = currentStaffGroup ? currentStaffGroup.title : '';
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <h1><i className='fa fa-group' /> Nhóm nhân viên: DOING TASK</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='form-group'>
                            <label className='control-label'>Tiêu đề</label>
                            <input className='form-control' type='text' placeholder='Tiêu đề' id='stfTitle' defaultValue={title.vi} readOnly={readOnly} />
                        </div>
                        <div className='form-group'>{table}</div>
                    </div>
                    {readOnly ? null :
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={this.showAddStaffModal}>
                                <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                            </button>&nbsp;
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>}
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <StaffModal ref={this.modal} addStaff={this.add} updateStaff={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component, user: state.user });
const mapActionsToProps = { getStaffGroup, updateStaffGroup, getAllStaffs };
export default connect(mapStateToProps, mapActionsToProps)(StaffGroupEditPage);
