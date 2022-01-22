import React from 'react';
import { connect } from 'react-redux';
import { getCourseFeePage, createCourseFee, updateCourseFee, deleteCourseFee } from './redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class CourseFeeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, name, courseType, type } = item || { _id: null, type: {}, name: '', courseType: null };
        this.itemName.value(name);
        this.itemCourseType.value(courseType);
        this.itemType.value(type ? type._id : null);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            name: this.itemName.value().trim(),
            courseType: this.itemCourseType.value(),
            type: this.itemType.value(),
            fee: this.itemFee.value(),
        };
        if (data.name == '') {
            T.notify('Tên gói học phí bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (!data.courseType) {
            T.notify('Loại khóa học không được trống!', 'danger');
            this.itemCourseType.focus();
        } else if (!data.type) {
            T.notify('Loại gói học phí không được trống!', 'danger');
            this.itemType.focus();
        } else {
            this.props.create(data, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/course-fee/' + data.item._id);
                }
            });
        }
    }
    render = () => this.renderModal({
        title: 'Gói học phí',
        body: <>
            <FormTextBox ref={e => this.itemName = e} label='Tên gói học phí' />
            <FormSelect ref={e => this.itemType = e} data={this.props.brandTypes} label='Loại gói' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemCourseType = e} label='Loại khóa học' data={ajaxSelectCourseType} readOnly={this.props.readOnly} />
        </>
    });
}

class CourseFeePage extends AdminPage {
    componentDidMount() {
        this.props.getCourseFeePage();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Gói học phí', 'Bạn có chắc bạn muốn xóa gói học phí này?', true, isConfirm =>
        isConfirm && this.props.deleteCourseFee(item._id));

    render() {
        const permission = this.getUserPermission('courseFee'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.courseFee && this.props.courseFee.page ?
                this.props.courseFee.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '80%' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hiển thị giá</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giá (VNĐ)</th>
                        <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.title} url={`/user/course-type/${item._id}`} />
                        <TableCell type='checkbox' content={item.isPriceDisplayed} permission={permission} onChanged={isPriceDisplayed => this.props.updateCourseFee(item._id, { isPriceDisplayed })} />
                        <TableCell type='number' content={item.price} />
                        <TableCell type='image' content={item.image || '/img/avatar.png'} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.props.history.push('/user/course-type/' + item._id)} onDelete={this.delete} />
                    </tr>),
            });
        console.log(permission);

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Gói học phí',
            breadcrumb: ['Gói học phí'],
            content: <>
                <div className='tile'>{table}</div>
                <CourseFeeModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createCourseFee} history={this.props.history} />
                <Pagination name='pageCourseFee' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCourseFeePage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.trainning.courseType });
const mapActionsToProps = { getCourseFeePage, createCourseFee, updateCourseFee, deleteCourseFee };
export default connect(mapStateToProps, mapActionsToProps)(CourseFeePage);
