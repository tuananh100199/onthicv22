import React from 'react';
import { connect } from 'react-redux';
import { getReviewClassPage, createReviewClass, updateReviewClass, deleteReviewClass } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormCheckbox , FormDatePicker, FormSelect} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {ajaxSelectTeacherByCourseType} from 'modules/_default/fwTeacher/redux';

class ReviewClassModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
        
    }

    onShow = (item) => {
        const { _id, title, active, dateStart } = item || { _id: null, title: '', active:true };
        this.itemTitle.value(title);
        this.itemActive.value(active);
        this.itemDateStart.value(dateStart);
        // this.itemTeacher.value(teacher);
        this.setState({ _id });
    }

    onSubmit = () => {
        const teacher = this.itemTeacher.value().split(':');
        const data = {
            title: this.itemTitle.value().trim(),
            active: this.itemActive.value()?1:0,
            dateStart: this.itemDateStart.value(),
            dateEnd: this.itemDateEnd.value(),
            teacher: teacher[0],
        };
        if (data.title == '') {
            T.notify('Tên lớp bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }
    render = () => this.renderModal({
        title: 'Lớp ôn tập',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên lớp' />
            <FormDatePicker ref={e => this.itemDateStart = e} label='Thời gian bắt đầu (dd/mm/yyyy)'  type='date-mask' />
            <FormDatePicker ref={e => this.itemDateEnd = e} label='Thời gian kết thúc đăng ký (dd/mm/yyyy)'  type='date-mask' />
            <FormSelect ref={e => this.itemTeacher = e} label='Giáo viên' data={ajaxSelectTeacherByCourseType('',0)}  style={{ width: '100%' }} />
            <FormCheckbox ref={e => this.itemActive = e} isSwitch={true} label='Kích hoạt' readOnly={this.props.readOnly} />
        </>
    });
}

class ReviewClassPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getReviewClassPage();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Lớp ôn tập', 'Bạn có chắc bạn muốn lớp ôn tập này?', true, isConfirm =>
        isConfirm && this.props.deleteReviewClass(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const permission = this.getUserPermission('reviewClass'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.reviewClass && this.props.reviewClass.page ?
                this.props.reviewClass.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời gian bắt đầu</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.title} url={'/user/review-class/' + item._id}/>
                        <TableCell type='text' content={item.dateStart ? T.dateToText(item.dateStart, 'dd/mm/yyyy') : ''} permission={permission}  />
                        <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateReviewClass(item._id, {active})} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Lớp ôn tập',
            breadcrumb: ['Lớp ôn tập'],
            content: <>
                <div className='tile'>
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                <ReviewClassModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createReviewClass} update={this.props.updateReviewClass} />
                <Pagination name='pageReviewClass' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getReviewClassPage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, reviewClass: state.training.reviewClass });
const mapActionsToProps = { getReviewClassPage, createReviewClass, updateReviewClass, deleteReviewClass };
export default connect(mapStateToProps, mapActionsToProps)(ReviewClassPage);
