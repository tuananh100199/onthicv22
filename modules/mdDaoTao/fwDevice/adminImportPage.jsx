import React from 'react';
import { connect } from 'react-redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { importDevice } from './redux';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
// import { importPreStudent } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormFileBox, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class DeviceModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        console.log(item);
        const { id, name, quantity  } = item || { id: null, type: {}, name:'' };
        this.itemName.value(name);
        this.itemQuantity.value(quantity);
        this.setState({ id });
    }

    onSubmit = () => {
        const data = {
            id: this.state.id,
            name: this.itemName.value(),
            status: 'dangSuDung',
            quantity: this.itemQuantity.value(),
        };
        if (data.name == '') {
            T.notify('Tên không được trống!', 'danger');
            this.itemName.focus();
        } else {
            this.props.edit(data);
            T.notify('Cập nhật thông tin thiết bị thành công!', 'success');
            this.hide();
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý thiết bị',
            size: 'large',
            body:
            <div className='row'>
                <FormTextBox className='col-md-6' ref={e => this.itemName = e} label='Tên thiết bị' readOnly={readOnly} />
                <FormTextBox className='col-md-3' ref={e => this.itemQuantity = e} label='Số lượng' readOnly={readOnly} />
        </div >
        });
    }
}

class ImportPage extends AdminPage {
    fileBox = React.createRef();
    state = { isFileBoxHide: false };
    componentDidMount() {
        T.ready('/user/device');
        this.props.getCategoryAll('device', null, (items) =>
            this.setState({ type: (items || []).map(item => ({ id: item._id, text: item.title })) }));
    }

    onUploadSuccess = (data) => {
        const deviceData = data.data;
        this.setState({ data: deviceData, isFileBoxHide: true });
        this.itemDivision.value(null);
        this.itemType.value(null);
    }

    showEditModal = (e, item) => e.preventDefault() || this.modal.show(item);

    edit = (changes) => {
        console.log(changes);
        this.setState(prevState => ({
            data: prevState.data.map(data => data.id === changes.id ? changes : data)
        }));
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa thông tin thiết bị', `Bạn có chắc bạn muốn xóa thông tin thiết bị <strong>${item.firstname + ' ' + item.lastname}</strong>?`, true, isConfirm =>
        isConfirm && this.setState(prevState => ({
            data: prevState.data.filter(data => data.id !== item.id)
        }))
    );

    save = () => {
        if (!this.itemDivision.value()) {
            T.notify('Chưa chọn cơ sở đào tạo!', 'danger');
            this.itemDivision.focus();
        } else if (!this.itemType.value()) {
            T.notify('Chưa chọn loại thiết bị!', 'danger');
            this.itemType.focus();
        } else {
            this.props.importDevice(this.state.data, this.itemDivision.value(), this.itemType.value(), data => {
                if (data.error) {
                    T.notify('Import thiết bị bị lỗi!', 'danger');
                } else {
                    this.props.history.push('/user/device');
                }
            });
        }
    }

    onReUpload = () => {
        this.setState({ data: [], isFileBoxHide: false });
    }

    render() {
        const permission = this.getUserPermission('device', ['read', 'write', 'delete', 'import']),
            readOnly = !permission.write;
        const table = renderTable({
            getDataSource: () => this.state.data && this.state.data.length > 0 ? this.state.data : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên thiết bị</th>
                    <th style={{ width: '100%' }} nowrap='true'>Số lượng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.name} onClick={e => this.edit(e, item)} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign:'center' }} content={item.quantity} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showEditModal} onDelete={this.delete} />
                </tr >),
        });

        const filebox = !this.state.isFileBoxHide && (
            <div className='tile'>
                <h3 className='tile-title'>Import danh sách thiết bị</h3>
                <FormFileBox ref={e => this.fileBox = e} uploadType='DeviceFile'
                    onSuccess={this.onUploadSuccess} readOnly={readOnly} />
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-primary' type='button'>
                        <a href='/download/device.xlsx' style={{ textDecoration: 'none', color: 'white' }}><i className='fa-fw fa-lg fa fa-download' /> Tải xuống file mẫu</a>
                    </button>
                </div>
            </div >
        );
        const list = (
            <div>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect ref={e => this.itemDivision = e} className='col-md-4' label={'Chọn cơ sở'} data={ajaxSelectDivision} readOnly={readOnly} />
                        <FormSelect ref={e => this.itemType = e} className='col-md-4' label={'Chọn loại thiết bị'} data={this.state.type} readOnly={readOnly} />
                    </div>
                    <h3 className='tile-title'>Danh sách thiết bị</h3>
                    <div className='tile-body' style={{ overflowX: 'auto' }}>
                        {table}
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-danger' type='button' style={{ marginRight: 10 }} onClick={this.onReUpload}>
                            <i className='fa fa-fw fa-lg fa-cloud-upload' /> Upload lại
                        </button>
                        <button className='btn btn-primary' type='button' onClick={this.save}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div>
                <DeviceModal readOnly={!permission.write} ref={e => this.modal = e} edit={this.edit} />
            </div>
        );
        return this.renderPage({
            icon: 'fa fa-car',
            title: 'Nhập danh sách thiết bị bằng Excel',
            breadcrumb: [<Link key={0} to='/user/device'>Quản lý thiết bị</Link>, 'Nhập danh sách xe bằng Excel'],
            content: <>
                {filebox}
                {this.state.data && this.state.data.length ? list : null}
            </>,
            backRoute: '/user/device/manager',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getCategoryAll, importDevice };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
