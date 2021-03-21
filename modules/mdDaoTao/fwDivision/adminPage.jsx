import React from 'react';
import { connect } from 'react-redux';
import { getAllDivisions, createDivision, deleteDivision, updateDivision } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class DivisionModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const newData = { title: this.itemTitle.value() };
        if (newData.title == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createDivision(newData, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/division/edit/' + data.item._id);
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
        this.props.getAllDivisions();
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getAllDivisions(searchText);
    }

    create = e => e.preventDefault() || this.modal.show();

    delete = (e, item) => {
        T.confirm('Xóa cơ sở', 'Bạn có chắc bạn muốn xóa cơ sở này?', true, isConfirm => isConfirm && this.props.deleteDivision(item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('division');
        const table = renderTable({
            dataSource: this.props.division,
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
                    <TableCell type='link' content={item.title} url={'/user/division/edit/' + item._id} />
                    <TableCell type='checkbox' content={item.isOutside} readOnly={!permission.write} onChanged={isOutside => this.props.updateDivision(item._id, { isOutside }, () => T.notify('Cập nhật cơ sở thành công!', 'success'))} />
                    <TableCell type='image' style={{ width: '20%' }} content={item.image} />
                    <TableCell content={(
                        <div className='btn-group'>
                            <Link to={'/user/division/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                <i className='fa fa-lg fa-edit' />
                            </Link>
                            {permission.delete ?
                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </a> : null}
                        </div>)} />
                </tr>),
        });

        const renderData = {
            icon: 'fa fa-university',
            title: 'Cơ sở đào tạo',
            breadcrumb: ['Cơ sở đào tạo'],
            content: <>
                <div className='tile'>{table}</div>
                <DivisionModal ref={e => this.modal = e} createDivision={this.props.createDivision} history={this.props.history} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.create;
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division });
const mapActionsToProps = { getAllDivisions, createDivision, deleteDivision, updateDivision };
export default connect(mapStateToProps, mapActionsToProps)(DivisionPage);