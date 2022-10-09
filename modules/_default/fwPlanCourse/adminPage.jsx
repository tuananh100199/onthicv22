import React from 'react';
import { connect } from 'react-redux';
import { createPlanCourse,updatePlanCourse,deletePlanCourse,getPlanCoursePage,pageName } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable,FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id=null, title='',active=true,courseType=null } = item || {};
        this.itemTitle.value(title);
        this.itemCourseType.value(courseType?{id:courseType._id,text:courseType.title}:null);
        this.itemActive.value(active);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            active: this.itemActive.value()?1:0,
            courseType:this.itemCourseType.value(),
        };
        if (data.title == '') {
            T.notify('Tên khóa học dự kiến bị trống!', 'danger');
            this.itemTitle.focus();
        }else if (!data.courseType) {
            T.notify('Loại khóa học bị trống!', 'danger');
            this.itemCourseType.focus();
        }else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Khóa học dự kiến',
            size: 'medium',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Tên' readOnly={readOnly} required/>
                <FormSelect ref={e => this.itemCourseType = e} className='col-md-12' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={readOnly} required/>
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class PlanCoursePage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getPlanCoursePage(1);
            T.onSearch = (searchText) => this.props.getPlanCoursePage(1,undefined,{searchText});
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa loại hồ sơ', 'Bạn có chắc bạn muốn xóa loại giấy tờ này?', true, isConfirm =>
        isConfirm && this.props.deletePlanCourse(item._id));

    render() {
        const permission = this.getUserPermission('planCourse');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.planCourse && this.props.planCourse.page ?
        this.props.planCourse.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%'}}>Loại hồ sơ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={item.title} style={{whiteSpace:'nowrap'}} onClick={e => this.edit(e, item)}/>
                    <TableCell content={item.courseType?item.courseType.title:''} style={{whiteSpace:'nowrap'}}/>
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updatePlanCourse(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học dự kiến',
            breadcrumb: ['Khóa học dự kiến'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name={pageName} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getPlanCoursePage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createPlanCourse} update={this.props.updatePlanCourse} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, planCourse: state.enrollment.planCourse });
const mapActionsToProps = { getPlanCoursePage,createPlanCourse,updatePlanCourse,deletePlanCourse };
export default connect(mapStateToProps, mapActionsToProps)(PlanCoursePage);