import React from 'react';
import { connect } from 'react-redux';
import { getCourseFeePage, createCourseFee, updateCourseFee, updateCourseFeeDefault, deleteCourseFee } from './redux';
import { ajaxSelectCourseType, getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { ajaxSelectFeeType } from 'modules/_default/fwFeeType/redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormSelect, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class CourseFeeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { _id, name, courseType, feeType, fee, description } = item || { _id: null, name: '', courseType: null, fee: 0, description: '' };
        this.itemName.value(name);
        this.itemCourseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
        this.itemFee.value(fee);
        this.itemType.value(feeType ? { id: feeType._id, text: feeType.title } : null);
        this.itemDescription.value(description);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            name: this.itemName.value().trim(),
            courseType: this.itemCourseType.value(),
            feeType: this.itemType.value(),
            fee: this.itemFee.value(),
            description: this.itemDescription.value(),
        };

        if (data.name == '') {
            T.notify('Tên gói học phí bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (!data.courseType) {
            T.notify('Loại khóa học không được trống!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }
    render = () => this.renderModal({
        title: 'Gói học phí',
        body: <>
            <FormTextBox ref={e => this.itemName = e} label='Tên gói học phí' />
            <div className='row'>
                <FormSelect ref={e => this.itemType = e} className='col-md-6' data={ajaxSelectFeeType} label='Loại gói' readOnly={this.props.readOnly} />
                <FormSelect ref={e => this.itemCourseType = e} className='col-md-6' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={this.props.readOnly} />
            </div>
            <FormTextBox ref={e => this.itemFee = e} type='number' label='Giá tiền' />
            <FormRichTextBox ref={e => this.itemDescription = e} rows={2} label='Mô tả' readOnly={this.props.readOnly} />
        </>
    });
}

class CourseFeePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready();
        this.props.getCourseFeePage();
        this.props.getCourseTypeAll(list => {
            const courseTypes = [{ id: 0, text: 'Tất cả loại khóa học' }];
            list.map(item => courseTypes.push({ id: item._id, text: item.title }));
            this.setState({ courseTypes });
            this.itemCourseType.value(0);
        });
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Gói học phí', 'Bạn có chắc bạn muốn xóa gói học phí này?', true, isConfirm =>
        isConfirm && this.props.deleteCourseFee(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    changeDefault = (item, active) => {
        if (active) {
            if (item.feeType && item.feeType.official)
                this.props.updateCourseFeeDefault(item);
            else T.notify('Chỉ có thể gán gói học phí chính thức thành gói mặc định', 'danger');
        }
    }

    getPage = (data) => {
        if (data.id == 0) {
            this.props.getCourseFeePage(undefined, undefined, {});
        } else {
            this.props.getCourseFeePage(undefined, undefined, { courseType: data.id });
        }
    }

    render() {
        const permission = this.getUserPermission('courseFee'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.courseFee && this.props.courseFee.page ?
                this.props.courseFee.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng GPLX</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa mặc định</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói học phí</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giá (VNĐ)</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.name} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType && item.courseType.title} />
                        <TableCell type='checkbox' content={item.isDefault} permission={permission} onChanged={active => this.changeDefault(item, active)} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.feeType && item.feeType.title} />
                        <TableCell type='number' content={item.fee} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-credit-card',
            title: 'Gói học phí',
            breadcrumb: ['Gói học phí'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={this.state.courseTypes} onChange={data => this.getPage(data)} readOnly={!permission.write} />
                    </div>
                    {table}
                </div>
                <CourseFeeModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createCourseFee} update={this.props.updateCourseFee} />
                <Pagination name='pageCourseFee' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCourseFeePage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseFee: state.accountant.courseFee });
const mapActionsToProps = { getCourseFeePage, createCourseFee, updateCourseFee, updateCourseFeeDefault, deleteCourseFee, getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(CourseFeePage);
