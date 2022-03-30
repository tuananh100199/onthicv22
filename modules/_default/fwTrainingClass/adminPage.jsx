import React from 'react';
import { connect } from 'react-redux';
import { getTrainingClassPage, createTrainingClass, updateTrainingClass,  deleteTrainingClass } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class TrainingClassModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { _id, name } = item || { _id: null, name: '',};
        this.itemName.value(name);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            name: this.itemName.value().trim(),
        };

        if (data.name == '') {
            T.notify('Tên lớp bị trống!', 'danger');
            this.itemName.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }
    render = () => this.renderModal({
        title: 'Lớp tập huấn',
        body: <>
            <FormTextBox ref={e => this.itemName = e} label='Tên lớp' />
        </>
    });
}

class TrainingClassPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getTrainingClassPage();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Lớp tập huấn', 'Bạn có chắc bạn muốn xóa lớp tập huấn này?', true, isConfirm =>
        isConfirm && this.props.deleteTrainingClass(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const permission = this.getUserPermission('trainingClass'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.trainingClass && this.props.trainingClass.page ?
                this.props.trainingClass.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Giáo viên đề xuất</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.name} url={`/user/training-class/${item._id}`}  />
                        <TableCell type='number' content={item.teachers ?item.teachers.length:0} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={()=>this.props.history.push(`/user/training-class/${item._id}`)} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-sort-amount-desc',
            title: 'Lớp tập huấn',
            breadcrumb: ['Lớp tập huấn'],
            content: <>
                <div className='tile'>
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                <TrainingClassModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createTrainingClass} update={this.props.updateTrainingClass} />
                <Pagination name='pageDiscount' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getTrainingClassPage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, trainingClass: state.enrollment.trainingClass });
const mapActionsToProps = { getTrainingClassPage, createTrainingClass, updateTrainingClass,  deleteTrainingClass };
export default connect(mapStateToProps, mapActionsToProps)(TrainingClassPage);
