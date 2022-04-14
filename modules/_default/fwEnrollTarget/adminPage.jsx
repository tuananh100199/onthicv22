import React from 'react';
import { connect } from 'react-redux';
import { createEnrollTarget,updateEnrollTarget,deleteEnrollTarget,getEnrollTargetPage,exportReport } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable,CirclePageButton, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EnrollTargetModal extends AdminModal {

    onShow = (item) => {
        let { _id=null, year='',trinhDo='',nganhNghe='',chiTieuDangKy='',chiTieuXacDinh='',active=false } = item || {};
        this.itemYear.value(year);
        this.itemTrinhDo.value(trinhDo);
        this.itemNganhNghe.value(nganhNghe);
        this.itemChiTieuDangKy.value(chiTieuDangKy);
        this.itemChiTieuXacDinh.value(chiTieuXacDinh);
        this.itemActive.value(active);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            year: this.itemYear.value(),
            trinhDo: this.itemTrinhDo.value(),
            nganhNghe: this.itemNganhNghe.value(),
            chiTieuDangKy: this.itemChiTieuDangKy.value(),
            chiTieuXacDinh: this.itemChiTieuXacDinh.value(),
            active: this.itemActive.value()?1:0,
        };
        if (data.year == '') {
            T.notify('Năm xét tuyển bị trống!', 'danger');
            this.itemYear.focus();
        }else if (data.trinhDo == '') {
            T.notify('Trình độ bị trống!', 'danger');
            this.itemTrinhDo.focus();
        }else if (data.nganhNghe == '') {
            T.notify('Ngành nghề bị trống!', 'danger');
            this.itemNganhNghe.focus();
        }else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const years = [];
        for(let i=1900;i<=2100;i++){
            years.push({id:i,text:i});
        }
        return this.renderModal({
            title: 'Chỉ tiêu tuyển sinh',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.itemYear = e} data={years} className='col-md-6' label='Năm xét tuyển' readOnly={readOnly} required/>
                <FormTextBox ref={e => this.itemTrinhDo = e} className='col-md-6' label='Trình độ' readOnly={readOnly} required/>
                <FormTextBox ref={e => this.itemNganhNghe = e} className='col-md-6' label='Ngành nghề' readOnly={readOnly} required/>
                <FormTextBox ref={e => this.itemChiTieuDangKy = e} type='number' className='col-md-6' label='Chỉ tiêu đăng ký hoạt động' readOnly={readOnly} />
                <FormTextBox ref={e => this.itemChiTieuXacDinh = e} type='number' className='col-md-6' label='Chỉ tiêu xác định' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class ExportModal extends AdminModal {

    onShow = (item) => {
        let { year='' } = item || {};
        this.itemYear.value(year);
    }

    export = () => {
        const year = this.itemYear.value();
        if(!year||year.length==0){
            T.notify('Năm xét tuyển bị trống!', 'danger');
            this.itemYear.focus();
        }else{
            this.hide();
            this.props.export(year.join(','));
        }
        
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const years = [];
        for(let i=1900;i<=2100;i++){
            years.push({id:i,text:i});
        }
        return this.renderModal({
            title: 'Xuất file chỉ tiêu',
            size: 'medium',
            body: <div className='row'>
                <FormSelect ref={e => this.itemYear = e} data={years} multiple={true} className='col-md-12' label='Năm xét tuyển' readOnly={readOnly} required/>
            </div>,
            buttons:
            <>
                <button className='btn btn-success' style={{ textAlign: 'right' }}
                onClick={this.export}><i className="fa fa-file-excel-o" aria-hidden="true"></i> Xuất báo cáo</button>
            </>
            
            
        });
    }
}

class EnrollTargetPage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getEnrollTargetPage(1);
            T.onSearch = (searchText) => this.props.getEnrollTargetPage(1,undefined,searchText);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa chỉ tiêu tuyển sinh', 'Bạn có chắc bạn muốn xóa chỉ tiêu này?', true, isConfirm =>
        isConfirm && this.props.deleteEnrollTarget(item._id));

    exportReport = (year,done)=>{
        this.props.exportReport(year,()=>done && done());
    }

    render() {
        const permission = this.getUserPermission('enrollTarget');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.enrollTarget && this.props.enrollTarget.page ?
        this.props.enrollTarget.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Năm</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trình độ</th>
                    <th style={{ width: '100%'}}>Ngành nghề</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chỉ tiêu đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chỉ tiêu xác định</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={item.year} style={{whiteSpace:'nowrap'}} onClick={e => this.edit(e, item)}/>
                    <TableCell type='text' content={item.trinhDo} style={{whiteSpace:'nowrap'}}/>
                    <TableCell  content={item.nganhNghe} style={{whiteSpace:'nowrap'}}  />
                    <TableCell type='number' content={item.chiTieuDangKy}/>
                    <TableCell type='number' content={item.chiTieuXacDinh}/>
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateEnrollTarget(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Chỉ tiêu tuyển sinh',
            breadcrumb: ['Chỉ tiêu tuyển sinh'],
            content: <>
                <div className='tile'>{table}</div>
                <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-print' style={{ right: '75px' }} onClick={e=>e.preventDefault()||this.exportModal.show()}/>
                <Pagination name='pageEnrollTarget' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getEnrollTargetPage} />
                <EnrollTargetModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createEnrollTarget} update={this.props.updateEnrollTarget} />

                <ExportModal ref={e => this.exportModal = e} readOnly={!permission.write}
                    export={this.exportReport} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, enrollTarget: state.enrollment.enrollTarget });
const mapActionsToProps = { getEnrollTargetPage,createEnrollTarget,updateEnrollTarget,deleteEnrollTarget,exportReport };
export default connect(mapStateToProps, mapActionsToProps)(EnrollTargetPage);