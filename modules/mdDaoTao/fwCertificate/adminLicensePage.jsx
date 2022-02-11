import React from 'react';
import { connect } from 'react-redux';
import { getLicensePage, updateCertificate,exportFinalLicense } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormCheckbox,CirclePageButton } from 'view/component/AdminPage';
import FileSaver from 'file-saver';

class CertificateModal extends AdminModal {
    state = {showCapPhat:false};
    onShow = (item) => {
        let { _id, lastname, firstname, identityCard, courseType,course,isCertification, isLicense,hasLicense,kySatHach  } = item || { _id: null, student: null,isCertification:false,isLicense:false,hasLicense:false,kySatHach:'' };
        this.itemStudent.value(lastname + ' ' + firstname);
        this.itemCourseType.value(courseType ? courseType.title : '');
        this.itemIdentityCard.value(identityCard);
        this.itemCourse.value(course?course.name:'');
        this.itemIsCertification.value(isCertification);
        this.itemIsLicense.value(isLicense);
        this.itemKySatHach.value(kySatHach);
        this.itemHasLicense.value(hasLicense);
        
        this.setState({ _id,showCapPhat:isCertification && isLicense });
    };

    onSubmit = () => {
        const data = { 
            isLicense:this.itemIsLicense.value(),
            hasLicense:this.itemHasLicense.value(),
            kySatHach:this.itemKySatHach.value(),
        };
        this.props.update(this.state._id, data,this.hide);
    }

    handleChange = ()=>{
        this.setState({showCapPhat:this.itemIsCertification.value() && this.itemIsLicense.value()});
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Giấy phép lái xe',
            size: 'large',
            body:
                <>
                <div className='row'>
                    <FormTextBox className='col-md-4' ref={e => this.itemStudent = e} label='Học viên' readOnly={true} />
                    <FormTextBox className='col-md-4' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={true} />
                    <FormTextBox className='col-md-4' ref={e => this.itemCourseType = e} label='Loại khóa học' readOnly={true} />
                    <FormTextBox className='col-md-4' ref={e => this.itemCourse = e} label='Khóa học' readOnly={true} />
                    <FormTextBox  ref={e => this.itemKySatHach = e} className='col-md-4' label='Kỳ sát hạch' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsCertification = e} isSwitch={true} className='col-md-4' label='Đã có CCSC' readOnly={readOnly} onChange={this.handleChange} />
                    <FormCheckbox ref={e => this.itemIsLicense = e} isSwitch={true} className='col-md-4' label='Đã có GPLX' readOnly={readOnly} onChange={this.handleChange} />
                    <FormCheckbox className='col-md-4' style={{display:this.state.showCapPhat?'flex':'none'}} ref={e => this.itemHasLicense = e} isSwitch={true} label='Cấp phát' readOnly={readOnly} />
                </div>
                </>
        });
    }
}

class LicensePage extends AdminPage {
    state = {listStudent:[]};
    componentDidMount() {
        T.ready('/user/license', () => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });
            this.props.getLicensePage(1, 50, {});
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getLicensePage(pageNumber, pageSize, searchText, (page) => {
            this.setState({ searchText, isSearching: false });
            done && done(page);
        }));
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    }

    exportMulti = (e,item)=>{
        e.preventDefault();
        this.exportModal.show(item);
    }

    update = (_id,changes,done)=>{
        this.props.updateCertificate(_id,changes,()=>{
            this.onSearch({});
            done && done();
        });
    }

    updateIsLicense = (_id,hasLicense,changes)=>{
        if(!hasLicense) this.props.updateCertificate(_id,changes,()=>this.onSearch({}));
    }

    exportOne = (e, item) => {
        e.preventDefault();
        if (item) {
            this.props.exportFinalLicense([item._id], (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Biên bản GPLX.docx');
            });
        }
    };

    exportFinal = (e)=>{
        e.preventDefault();
        this.props.exportFinalLicense(this.state.listStudent, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Biên bản GPLX.docx');
            this.setState({listStudent:[]});
        });
    }

    changeExportItem = (value,_id)=>{
        let listStudent = this.state.listStudent;
        if(value){
            listStudent.push(_id);
        }else{
            listStudent = listStudent.filter(item=>item!=_id);
        }
        this.setState({listStudent});
    }

    render() {
        const permission = this.getUserPermission('certificate');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.certificate && this.props.certificate.licensePage ?
            this.props.certificate.licensePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
            const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kỳ sát hạch</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đã có CCSC</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đã có GPLX</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cấp phát</th>
                    <th style={{ width: 'auto' }} nowrap='true'>In biên bản</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={<>{item.lastname} {item.firstname}</>} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={item.courseType && item.courseType.title} />
                    <TableCell type='text' content={item.course && item.course.name} />
                    <TableCell type='text' content={item.kySatHach} style={{whiteSpace:'nowrap'}} />
                    <TableCell type='checkbox' content={item.isCertification} permission={permission} onChanged = {value=>this.updateIsLicense(item._id,item.hasLicense,{isCertification:value})}/>
                    <TableCell type='checkbox' content={item.isLicense} permission={permission} onChanged = {value=>this.updateIsLicense(item._id,item.hasLicense,{isLicense:value})}/>
                    {item.isLicense && item.isCertification ? <TableCell type='checkbox' content={item.hasLicense} permission={permission} onChanged = {value=>this.update(item._id,{hasLicense:value})}/>:<TableCell type='text' content=''/>}
                    {item.isLicense && item.isCertification ? <TableCell type='checkbox' isSwitch={false} content={this.state.listStudent.find(studentId=>studentId==item._id)} permission={permission} onChanged = {value=>this.changeExportItem(value,item._id)}/>: <TableCell type='text' content=''/>}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit}>
                    </TableCell>
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-certificate',
            title: 'Phát giấy phép lái xe',
            breadcrumb: ['Phát giấy phép lái xe'],
            content: (
                <>
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <CertificateModal ref={e => this.modal = e} update={this.update} readOnly={!permission.write} />
                    {this.state.listStudent.length>0 ? <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-print' style={{ right: '10px' }} onClick={(e) => this.exportFinal(e)} />: null}
                </div>
                <Pagination pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    pageName = 'pageLicense' getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            
                </>
                
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, certificate: state.trainning.certificate });
const mapActionsToProps = { getLicensePage, updateCertificate,exportFinalLicense };
export default connect(mapStateToProps, mapActionsToProps)(LicensePage);