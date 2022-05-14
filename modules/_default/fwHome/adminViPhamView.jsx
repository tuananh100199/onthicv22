import React from 'react';
import { connect } from 'react-redux';
import { createViPham, updateViPham, deleteViPham, getViPhamAll, changeViPham } from './redux/reduxViPham';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable, AdminPage } from 'view/component/AdminPage';

class ViPhamModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (video) => {
        const { _id, title, fee } = video || { _id: null, title: '', fee: '' };
        this.itemTitle.value(title);
        this.itemFee.value(fee);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value().trim(),
            fee: this.itemFee.value().trim(),
        };
        if (data.title == '') {
            T.notify('Tiêu đề vi phạm bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.fee == '') {
            T.notify('Số tiền phạt bị trống!', 'danger');
            this.itemFee.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data) : this.props.create({ ...data });
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Các lỗi thường gặp',
        body: <>
            <div >
                <FormTextBox ref={e => this.itemTitle = e} label='Tên lỗi' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemFee = e} label='Số tiền phạt' readOnly={this.props.readOnly} />
            </div>
        </>,
    });
}

class VideoPage extends AdminPage {
    componentDidMount() {
        this.props.getViPhamAll();
    }
    showViPhamModal = (e, video) => e.preventDefault() || this.modal.show(video);

    deleteViPham = (e, video) => e.preventDefault() || T.confirm('Xóa video', `Bạn có chắc bạn muốn xóa video <strong>${video.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteViPham(video._id));

    render() {
        const permission = this.props.permission;
        console.log(this.props.component);
        const table = renderTable({
            getDataSource: () => this.props.component.viPham && this.props.component.viPham.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Lỗi vi phạm</th>
                    <th style={{ width: 'auto' }}>Tiền phạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.showViPhamModal(e, item)} />
                    <TableCell type='link' style={{whiteSpace: 'nowrap'}} content={item.fee} onClick={e => this.showViPhamModal(e, item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={e => this.showViPhamModal(e, item)} onDelete={e => this.deleteViPham(e, item)} />
                </tr>),
        });
        return <>
            {table}
            <ViPhamModal ref={e => this.modal = e} update={this.props.updateViPham} create={this.props.createViPham} change={this.props.changeViPham} readOnly={!permission.write} />
            {permission.write ? <CirclePageButton type='create' onClick={e => e.preventDefault() || this.modal.show()} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { createViPham, updateViPham, deleteViPham, getViPhamAll, changeViPham };
export default connect(mapStateToProps, mapActionsToProps)(VideoPage);