import React from 'react';
import { connect } from 'react-redux';
import { getStaffGroup, deleteStaffImage, updateStaffGroup, createStaff, updateStaff, swapStaff, deleteStaff, changeStaff } from './redux/reduxStaffGroup';
import { ajaxSelectUserType, ajaxGetUser } from 'modules/_default/fwUser/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, AdminModal, FormTextBox, FormRichTextBox, FormCheckbox, FormImageBox, TableCell, renderTable } from 'view/component/AdminPage';

class StaffModal extends AdminModal {
    state = {};

    componentDidMount() {
        $(document).ready(() => this.onShown(() => { }));
    }

    onShow = (item) => {
        const { _id, image, active, description, user, staffGroupId } = item || { _id: null, active: true }
        this.itemDescription.value(description || '');
        this.itemUser.value(user ? { id: user._id, text: `${user.lastname} ${user.firstname} (${user.email})` } : null);
        this.itemActive.value(active);
        this.imageBox.setData(`staff:${_id || 'new'}`);

        this.setState({ _id, staffGroupId, user, image });
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            // console.log(this.state.image)
            item && this.props.change(item);
        }
    }
    deleteImage = () => T.confirm('Xoá hình', 'Bạn có chắc bạn muốn xoá hình này?', true, isConfirm =>
        isConfirm && this.props.deleteImage && this.props.deleteImage(this.state._id, () => this.setState({ image: null })));

    // onChange = (value) => {
    //     ajaxGetUser(value.id, data => {
    //         this.setState({ image: data.user.image })
    //         this.imageBox.setData(`user:${data.user._id}`)
    //     })
    // }
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            user: this.itemUser.value(),
            description: this.itemDescription.value().trim(),
            staffGroupId: this.state.staffGroupId,
            active: this.itemActive.value(),
            image: this.state.image
            // image: this.state.image.includes(`user`) ? undefined : this.state.image,
        };

        if (!changes.user) {
            T.notify('Tên nhân viên bị trống!', 'danger');
            this.itemUser.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, changes, this.hide()) : this.props.create(changes, this.hide());
        }
    }

    render = () => this.renderModal({
        title: 'Nhân viên',
        size: 'large',
        body: <div className='row'>
            <div className='col-md-8'>
                <FormSelect ref={e => this.itemUser = e} label='Tên nhân viên' data={ajaxSelectUserType(['isCourseAdmin', 'isLecturer', 'isStaff'])} readOnly={this.props.readOnly}
                // onChange={this.onChange}
                />
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả' readOnly={this.props.readOnly} />
            </div>
            <div className='col-md-4'>
                <FormImageBox ref={e => this.imageBox = e} label='Hình ảnh nền' uploadType='StaffImage' image={this.state.image} readOnly={this.props.readOnly}
                    onSuccess={this.onUploadSuccess} onDelete={this.state._id ? this.deleteImage : null} />
                <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
            </div>
        </div>,
    });
}

class StaffGroupEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/staff-group/:_id'),
                params = route.parse(window.location.pathname);

            this.props.getStaffGroup(params._id, data => {
                if (data.error) {
                    T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    this.itemTitle.value(data.item.title);
                    this.itemTitle.focus();
                    this.setState(data.item);
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    save = () => {
        const changes = {
            title: this.itemTitle.value().trim(),
        };
        if (changes.title == '') {
            T.notify('Tên nhóm nhân viên bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.updateStaffGroup(this.state._id, changes);
        }
    };

    create = (e) => e.preventDefault() || this.modal.show({ staffGroupId: this.state._id });

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapStaff(item._id, isMoveUp);

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhân viên', 'Bạn có chắc bạn muốn xóa nhân viên này?', true, isConfirm =>
        isConfirm && this.props.deleteStaff(item._id));

    render() {
        const permission = this.getUserPermission('component');
        const list = this.props.component.staffGroup && this.props.component.staffGroup.selectedItem && this.props.component.staffGroup.selectedItem.items
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '80%' }}>Nhân viên</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.user.lastname + ' ' + item.user.firstname} onClick={this.edit} />
                    <TableCell type='image' content={item.image || item.user.image} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateStaff(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swap} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-group',
            title: 'Nhóm nhân viên: ' + (this.state.title || '...'),
            breadcrumb: [<Link to='/user/component'>Thành phần giao diện</Link>, 'Nhóm nhân viên'],
            content: <>
                <div className='tile'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' className='tile-body' onChange={e => this.setState({ title: e.target.value })} readOnly={!permission.write} />
                    {permission.write &&
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>}
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Danh sách nhân viên</h3>
                    <div>Tối đa 4 người</div>
                    <div className='tile-body'>
                        {table}
                        {permission.write &&
                            <div style={{ display: list && list.length == 4 && 'none', textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.create}>
                                    <i className='fa fa-fw fa-lg fa-plus'></i> Thêm
                                </button>
                            </div>}
                    </div>
                </div>

                <StaffModal ref={e => this.modal = e} deleteImage={this.props.deleteStaffImage} create={this.props.createStaff} update={this.props.updateStaff} change={this.props.changeStaff} readOnly={!permission.write} />
            </>,
            backRoute: '/user/component',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { deleteStaffImage, getStaffGroup, updateStaffGroup, createStaff, updateStaff, swapStaff, deleteStaff, changeStaff };
export default connect(mapStateToProps, mapActionsToProps)(StaffGroupEditPage);
