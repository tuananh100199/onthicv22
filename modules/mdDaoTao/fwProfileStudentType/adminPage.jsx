import React from 'react';
import { connect } from 'react-redux';
import { createProfileStudentType,updateProfileStudentType,deleteProfileStudentType,getProfileStudentTypePage } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id=null, title='',active=true,required=true } = item || {};
        this.itemTitle.value(title);
        this.itemActive.value(active);
        this.itemRequired.value(required);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            active: this.itemActive.value()?1:0,
            required: this.itemRequired.value()?1:0,
        };
        if (data.title == '') {
            T.notify('Loại giấy tờ bị trống!', 'danger');
            this.itemTitle.focus();
        }else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Loại giấy tờ học viên',
            size: 'medium',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Loại giấy tờ' readOnly={readOnly} required/>
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemRequired = e} className='col-md-6' label='Bắt buộc' readOnly={readOnly} />
            </div>
        });
    }
}

class ProfileStudentTypePage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getProfileStudentTypePage(1);
            T.onSearch = (searchText) => this.props.getProfileStudentTypePage(1,undefined,searchText);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa loại giấy tờ', 'Bạn có chắc bạn muốn xóa loại giấy tờ này?', true, isConfirm =>
        isConfirm && this.props.deleteProfileStudentType(item._id));


    render() {
        const permission = this.getUserPermission('profileStudentType');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.profileStudentType && this.props.profileStudentType.page ?
        this.props.profileStudentType.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%'}}>Loại hồ sơ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Bắt buộc</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={item.title} style={{whiteSpace:'nowrap'}} onClick={e => this.edit(e, item)}/>
                    <TableCell type='checkbox' content={item.required} permission={permission} onChanged={required => this.props.updateProfileStudentType(item._id, { required })} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateProfileStudentType(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Loại giấy tờ học viên',
            breadcrumb: ['Loại giấy tờ học viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageProfileStudentType' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getProfileStudentTypePage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createProfileStudentType} update={this.props.updateProfileStudentType} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, profileStudentType: state.enrollment.profileStudentType });
const mapActionsToProps = { getProfileStudentTypePage,createProfileStudentType,updateProfileStudentType,deleteProfileStudentType };
export default connect(mapStateToProps, mapActionsToProps)(ProfileStudentTypePage);