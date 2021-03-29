import React from 'react';
import { connect } from 'react-redux';
import { getDivisionAll, createDivision, deleteDivision, updateDivision } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class DivisionModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const data = { title: this.itemTitle.value() };
        if (data.title == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/division/' + data.item._id);
                }
            });
        }
    }

    render = () => this.renderModal({
        title: 'Cơ sở mới',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên cơ sở' />
    });
}

class DivisionPage extends AdminPage {
    componentDidMount() {
        this.props.getDivisionAll();
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getDivisionAll(searchText);
    }

    create = e => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa cơ sở', 'Bạn có chắc bạn muốn xóa cơ sở này?', true, isConfirm => isConfirm &&
        this.props.deleteDivision(item._id));

    render() {
        const permission = this.getUserPermission('division');
        const table = renderTable({
            getDataSource: () => this.props.division && this.props.division.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên cơ sở</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Cơ sở ngoài</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/division/' + item._id} />
                    <TableCell type='checkbox' content={item.isOutside} permission={permission} onChanged={isOutside => this.props.updateDivision(item._id, { isOutside }, () => T.notify('Cập nhật cơ sở thành công!', 'success'))} />
                    <TableCell type='image' style={{ width: '20%' }} content={item.image} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/division/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Cơ sở đào tạo',
            breadcrumb: ['Cơ sở đào tạo'],
            content: <>
                <div className='tile'>{table}</div>
                <DivisionModal ref={e => this.modal = e} create={this.props.createDivision} history={this.props.history} readOnly={!permission.write} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division });
const mapActionsToProps = { getDivisionAll, createDivision, deleteDivision, updateDivision };
export default connect(mapStateToProps, mapActionsToProps)(DivisionPage);