import React from 'react';
import { connect } from 'react-redux';
import { createProfileType,updateProfileType,deleteProfileType,getProfileTypePage } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable,FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import {ajaxSelectProfileStudentType} from 'modules/mdDaoTao/fwProfileStudentType/redux';
class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id=null, title='',active=true,courseType=null,papers=[] } = item || {};
        this.itemTitle.value(title);
        this.itemCourseType.value(courseType?{id:courseType._id,text:courseType.title}:null);
        this.itemPapers.value(papers.length?papers.map(paper=>({id:paper._id,text:paper.title})):'');
        this.itemActive.value(active);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            active: this.itemActive.value()?1:0,
            courseType:this.itemCourseType.value(),
            papers:this.itemPapers.value(),
        };
        if (data.title == '') {
            T.notify('Tên loại hồ sơ bị trống!', 'danger');
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
            title: 'Loại hồ sơ',
            size: 'medium',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Tên' readOnly={readOnly} required/>
                <FormSelect ref={e => this.itemCourseType = e} className='col-md-12' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={readOnly} required/>
                <FormSelect ref={e => this.itemPapers = e} className='col-md-12' label='Các loại giấy tờ' multiple={true} data={ajaxSelectProfileStudentType} readOnly={readOnly} required/>
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class ProfileTypePage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getProfileTypePage(1);
            T.onSearch = (searchText) => this.props.getProfileTypePage(1,undefined,searchText);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa loại hồ sơ', 'Bạn có chắc bạn muốn xóa loại giấy tờ này?', true, isConfirm =>
        isConfirm && this.props.deleteProfileType(item._id));

    renderListPapers = papers=>(<>
            {papers.map((paper,index)=><p style={{marginBottom:0}} key={index}> - {paper.title}</p>)}
        </>)

    render() {
        const permission = this.getUserPermission('profileType');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.profileType && this.props.profileType.page ?
        this.props.profileType.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%'}}>Loại hồ sơ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giấy tờ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={item.title} style={{whiteSpace:'nowrap'}} onClick={e => this.edit(e, item)}/>
                    <TableCell content={item.courseType?item.courseType.title:''} style={{whiteSpace:'nowrap'}}/>
                    <TableCell content={item.papers && item.papers.length ? this.renderListPapers(item.papers):''} style={{whiteSpace:'nowrap'}}/>
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateProfileType(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Loại hồ sơ',
            breadcrumb: ['Loại hồ sơ'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageProfileType' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getProfileTypePage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createProfileType} update={this.props.updateProfileType} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, profileType: state.enrollment.profileType });
const mapActionsToProps = { getProfileTypePage,createProfileType,updateProfileType,deleteProfileType };
export default connect(mapStateToProps, mapActionsToProps)(ProfileTypePage);