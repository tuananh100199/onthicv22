import React from 'react';
import { connect } from 'react-redux';
import { getTeacherDiplomaPage, createTeacherDiploma, updateTeacherDiploma, updateTeacherDiplomaDefault, deleteTeacherDiploma } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class DiscountModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, active } = item || { _id: null, title: '', active:true };
        this.itemTitle.value(title);
        this.itemActive.value(active);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value().trim(),
            active: this.itemActive.value()?1:0,
        };

        if (data.title == '') {
            T.notify('Tên chứng chỉ bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }
    render = () => this.renderModal({
        title: 'Chứng chỉ giáo viên',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên chứng chỉ' />
            <FormCheckbox ref={e => this.itemActive = e} isSwitch={true} label='Kích hoạt' readOnly={this.props.readOnly} />
        </>
    });
}

class TeacherDiplomaPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getTeacherDiplomaPage();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Chứng chỉ giáo viên', 'Bạn có chắc bạn muốn xóa loại chứng chỉ này?', true, isConfirm =>
        isConfirm && this.props.deleteTeacherDiploma(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    changeDefault = (item, active) => {
        if (active) {
            this.props.updateTeacherDiplomaDefault(item);
        }
    }

    render() {
        const permission = this.getUserPermission('teacherDiploma'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.teacherDiploma && this.props.teacherDiploma.page ?
                this.props.teacherDiploma.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chứng chỉ sư phạm</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.title} />
                        <TableCell type='checkbox' content={item.isSuPham} permission={permission} onChanged={active => this.changeDefault(item, active)} />
                        <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateTeacherDiploma(item._id, {active})} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Danh mục chứng chỉ giáo viên',
            breadcrumb: ['Danh mục chứng chỉ giáo viên'],
            content: <>
                <div className='tile'>
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                <DiscountModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createTeacherDiploma} update={this.props.updateTeacherDiploma} />
                <Pagination name='pageTeacherDiploma' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getTeacherDiplomaPage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, teacherDiploma: state.enrollment.teacherDiploma });
const mapActionsToProps = { getTeacherDiplomaPage, createTeacherDiploma, updateTeacherDiploma, updateTeacherDiplomaDefault, deleteTeacherDiploma };
export default connect(mapStateToProps, mapActionsToProps)(TeacherDiplomaPage);
