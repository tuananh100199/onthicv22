import React from 'react';
import { connect } from 'react-redux';
import { getTrainingClassPage, createTrainingClass, updateTrainingClass,  deleteTrainingClass } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable,FormSelect, CirclePageButton } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';

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
            hangTapHuan:this.itemHangTapHuan.value(),
        };

        if (data.name == '') {
            T.notify('Tên lớp bị trống!', 'danger');
            this.itemName.focus();
        }else if (!data.hangTapHuan) {
            T.notify('Hạng tập huấn bị trống!', 'danger');
            this.itemHangTapHuan.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data,(item)=>this.props.history.push(`/user/training-class/${item._id}`)) 
            : this.props.create(data, (item)=>this.props.history.push(`/user/training-class/${item._id}`));
        }
    }
    render = () => this.renderModal({
        title: 'Lớp tập huấn',
        body: <>
            <FormTextBox ref={e => this.itemName = e} label='Tên lớp' readOnly={this.props.readOnly} required/>
            <FormSelect ref={e => this.itemHangTapHuan = e} label='Hạng đăng ký tập huấn' data={this.props.gplx} readOnly={this.props.readOnly} required/>

        </>
    });
}

class TrainingClassPage extends AdminPage {
    state={}
    componentDidMount() {
        T.ready();
        this.props.getTrainingClassPage();
        this.props.getCategoryAll('gplx', null, (items) =>{
            this.setState({ gplx: (items || []).map(item => ({ id: item._id, text: item.title })) });
        });
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
                        <th style={{ width: '100%' }} nowrap='true'>Tên</th>
                        <th style={{ width: '100%' }} nowrap='true'>Hạng tập huấn</th>
                        <th style={{ width: '100%' }} nowrap='true'>Thời gian bắt đầu</th>
                        <th style={{ width: '100%' }} nowrap='true'>Thời gian kết thúc</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Danh sách giáo viên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.name} url={`/user/training-class/${item._id}`}  />
                        <TableCell type='text' content={item.hangTapHuan?item.hangTapHuan.title:''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.startDate ? T.dateToText(item.startDate, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.endDate ? T.dateToText(item.endDate, 'dd/mm/yyyy') : ''} />
                        <TableCell type='number' content={item.numOfTeacher||0} />
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
                <TrainingClassModal ref={e => this.modal = e} gplx={this.state.gplx||[]} history={this.props.history} readOnly={!permission.write} create={this.props.createTrainingClass} update={this.props.updateTrainingClass} />
                <Pagination name='pageDiscount' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getTrainingClassPage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, trainingClass: state.enrollment.trainingClass });
const mapActionsToProps = { getTrainingClassPage, createTrainingClass, updateTrainingClass,  deleteTrainingClass,getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(TrainingClassPage);
