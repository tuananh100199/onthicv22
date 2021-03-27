import React from 'react';
import { connect } from 'react-redux';
import { getAllLogos, createLogo, deleteLogo } from './redux/reduxLogo';
import { CirclePageButton, AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class LogoModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');
    onSubmit = () => {
        const newData = { title: this.itemTitle.value() };
        if (newData.title == '') {
            T.notify('Tên nhóm logo bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createLogo(newData, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/edit/' + data.item._id);
                }
            });
        }
    }
    render = () => this.renderModal({
        title: 'Thông tin nhóm logo',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên nhóm logo' />
    });
}

class LogoPage extends AdminPage {
    componentDidMount() {
        this.props.getAllLogos();
    }

    create = e => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhóm logo', 'Bạn có chắc bạn muốn xóa nhóm logo này?', true, isConfirm => isConfirm &&
        this.props.deleteLogo(item._id));

    render() {
        const permission = this.getUserPermission('component');
        const table = renderTable({
            getDataSource: () => this.props.logo && this.props.logo.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên nhóm</th>
                    <th style={{ width: 'auto', textAlign: 'right' }} nowrap='true'>Số lượng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/edit/' + item._id} />
                    <TableCell type='number' content={item.items.length} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/edit/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return (<>
            {table}
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            <LogoModal ref={e => this.modal = e} createLogo={this.props.createStatistic} history={this.props.history} readOnly={!permission.write} />
        </>)
    }
}

const mapStateToProps = state => ({ system: state.system, logo: state.logo });
const mapActionsToProps = { getAllLogos, createLogo, deleteLogo };
export default connect(mapStateToProps, mapActionsToProps)(LogoPage);