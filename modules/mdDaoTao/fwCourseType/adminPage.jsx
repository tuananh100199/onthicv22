import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypePage, createCourseType, updateCourseType, deleteCourseType } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class CourseTypeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const title = this.itemTitle.value().trim();
        if (title == '') {
            T.notify('Tên loại khoá học bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create({ title }, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/course-type/' + data.item._id);
                }
            })
        }
    }
    render = () => this.renderModal({
        title: 'Bài viết',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên loại khoá học' />
    });
}

class CourseTypePage extends AdminPage {
    componentDidMount() {
        this.props.getCourseTypePage();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Loại khóa học', 'Bạn có chắc bạn muốn xóa loại khóa học này?', true, isConfirm =>
        isConfirm && this.props.deleteCourseType(item._id));

    render() {
        const permission = this.getUserPermission('course-type'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.courseType && this.props.courseType.page ?
                this.props.courseType.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '80%' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hiển thị giá</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giá (VND)</th>
                        <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.title} url={`/user/course-type/${item._id}`} />
                        <TableCell type='checkbox' content={item.isPriceDisplayed} permission={permission} onChanged={isPriceDisplayed => this.props.updateCourseType(item._id, { isPriceDisplayed })} />
                        <TableCell type='number' content={item.price} />
                        <TableCell type='image' content={item.image || '/img/avatar.png'} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.props.history.push('/user/course-type/' + item._id)} onDelete={this.delete} />
                    </tr>),
            });
        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Loại khóa học',
            breadcrumb: ['Loại khóa học'],
            content: <>
                <div className='tile'>{table}</div>
                <CourseTypeModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createCourseType} history={this.props.history} />
                <Pagination name='pageCourseType' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCourseTypePage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getCourseTypePage, createCourseType, updateCourseType, deleteCourseType };
export default connect(mapStateToProps, mapActionsToProps)(CourseTypePage);
