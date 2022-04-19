import React from 'react';
import { connect } from 'react-redux';
import { getLicensePage, updateCertificate,exportFinalLicense } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormCheckbox,CirclePageButton,TableHead,TableHeadCell } from 'view/component/AdminPage';
import FileSaver from 'file-saver';
import {getCourseAll} from 'modules/mdDaoTao/fwCourse/redux';
const isCertificateData = [
    {id:'1',text:'Đã cấp'},
    {id:'0',text:'Chưa cấp'},
];

class ExportModal extends AdminModal {
    state = { copied: false,listStudent:[] };
    componentDidMount() {
        T.ready(() => this.onShown(() => {}));
    }

    onShow = () => {
        this.setState({listStudent:this.props.listStudent});
    }

    delete = (e,item) => {
        e.preventDefault();
        let listStudent = this.state.listStudent.filter(student=>student._id!=item._id);
        console.log(listStudent);
        this.setState({listStudent});
        this.props.updateState({listStudent});
    }


    render = () => {
        const listStudent = this.state.listStudent;
        const tableUser = renderTable({
            getDataSource: () => listStudent,
            stickyHead:true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Học viên</th>
                    <th style={{ width: '100%' }}>CMND</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói học phí</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>kỳ sát hạch</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${item.lastname} ${item.firstname}`} />
                    <TableCell type='text' content={item.identityCard} />
                    {/* <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.feeType ? item.feeType.title : ''} /> */}
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.course && item.course.name} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.kySatHach} />
                    <TableCell type='buttons' content={{ item, index }} permission={{ delete: true }} onDelete={e=>this.delete(e,item)} />
                </tr>),
        });
        return this.renderModal({
        title: 'In biên bản',
        dataBackdrop: 'static',
        size: 'large',
        body: (<div>
                <div className='tile-body'>{tableUser}</div>
            </div>),
        buttons:
        listStudent && listStudent.length ? <button className='btn btn-success' style={{ textAlign: 'right' }}
            onClick={(e)=>this.props.exportFinal(e,this.hide)}>In biên bản</button> : null
    });
    }
}
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
            this.props.getLicensePage(1, 50, {},{},{});
            this.props.getCourseAll({isDefault:false},list=>{
                let course = list.map(course=>({id:course._id,text:course.name}));
                console.log({course});
                this.setState({course});
            });
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getLicensePage(pageNumber, pageSize, {searchText},null,null, (page) => {
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

    exportFinal = (e,done)=>{
        e.preventDefault();
        const listStudentId = this.state.listStudent.map(item=>item._id);
        this.props.exportFinalLicense(listStudentId, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Biên bản GPLX.docx');
            this.setState({listStudent:[]});
            done && done();
        });
    }

    updateState = (newItem)=>{
        this.setState({...newItem});
    }

    changeExportItem = (value,student)=>{
        let listStudent = this.state.listStudent;
        if(value){
            listStudent.push(student);
        }else{
            listStudent = listStudent.filter(item=>item._id!=student._id);
        }
        this.setState({listStudent});
    }

    render() {
        const permission = this.getUserPermission('certificate');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.certificate && this.props.certificate.licensePage ?
            this.props.certificate.licensePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
            const table = renderTable({
            getDataSource: () => list, stickyHead: true,autoDisplay:true,
            renderHead: () => (
                <TableHead getPage = {this.props.getLicensePage}>
                    <TableHeadCell style={{ width: 'auto' }}>#</TableHeadCell>
                    <TableHeadCell style={{ width: '100%' }} nowrap='true'>Học viên</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Loại khóa học</TableHeadCell>
                    <TableHeadCell  name='course' filter='select' filterData={this.state.course} style={{ width: 'auto' }} menuStyle={{width:200}} nowrap='true'>Khóa học</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Kỳ sát hạch</TableHeadCell>
                    <TableHeadCell name='isCertification' filter='select' filterData={isCertificateData} style={{ width: 'auto' }} nowrap='true'>Đã có CCSC</TableHeadCell>
                    <TableHeadCell name='isLicense' filter='select' filterData={isCertificateData} style={{ width: 'auto' }} nowrap='true'>Đã có GPLX</TableHeadCell>
                    <TableHeadCell name='capPhat' filter='select' filterData={isCertificateData} style={{ width: 'auto' }} nowrap='true'>Cấp phát</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>In biên bản</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Thao tác</TableHeadCell>
                </TableHead>),
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
                    {item.isLicense && item.isCertification ? <TableCell type='checkbox' content={item.hasLicense} permission={permission} onChanged = {value=>this.update(item._id,{hasLicense:value,hasCertification:value})}/>:<TableCell type='text' content=''/>}
                    {item.isLicense && item.isCertification ? <TableCell type='checkbox' isSwitch={false} content={this.state.listStudent.find(studentId=>studentId._id==item._id)} permission={permission} onChanged = {value=>this.changeExportItem(value,item)}/>: <TableCell type='text' content=''/>}
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
                    {/* {this.state.listStudent.length>0 ? <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-print' style={{ right: '10px' }} onClick={e=>this.exportFinal(e)} />: null} */}
                    {this.state.listStudent.length>0 ? <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-print' style={{ right: '10px' }} onClick={()=>this.exportModal.show()} />: null}
                </div>

                <ExportModal ref={e => this.exportModal = e} exportFinal={this.exportFinal}  updateState={this.updateState} listStudent={this.state.listStudent} />
                <Pagination pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    pageName = 'pageLicense' getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            
                </>
                
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, certificate: state.trainning.certificate });
const mapActionsToProps = { getLicensePage, updateCertificate,exportFinalLicense,getCourseAll };
export default connect(mapStateToProps, mapActionsToProps)(LicensePage);