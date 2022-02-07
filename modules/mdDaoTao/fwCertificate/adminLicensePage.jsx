import React from 'react';
import { connect } from 'react-redux';
import { getLicensePage, updateCertificate } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormCheckbox } from 'view/component/AdminPage';

class CertificateModal extends AdminModal {
    state = {isLicense:false};
    onShow = (item) => {
        let { _id, lastname, firstname, identityCard, courseType, isLicense,hasLicense,kySatHach  } = item || { _id: null, student: null,isLicense:false,hasLicense:false,kySatHach:'' };
        this.itemStudent.value(lastname + ' ' + firstname);
        this.itemCourseType.value(courseType ? courseType.title : '');
        this.itemIdentityCard.value(identityCard);
        this.itemIsLicense.value(isLicense);
        this.itemKySatHach.value(kySatHach);
        this.itemHasLicense.value(hasLicense);

        this.setState({ _id,isLicense });
    };

    onSubmit = () => {
        const data = { 
            isLicense:this.itemIsLicense.value(),
            hasLicense:this.itemHasLicense.value(),
            kySatHach:this.itemKySatHach.value(),
        };
        this.props.update(this.state._id, data,this.hide);
    }

    onChangeLicense = isLicense=>{
        this.setState({isLicense});
        this.itemHasLicense.value(false);
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
                    <FormTextBox className='col-md-4' ref={e => this.itemKySatHach = e} label='Kỳ sát hạch' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsLicense = e} isSwitch={true} className='col-md-4' label='Đã có GPLX' readOnly={readOnly} onChange={this.onChangeLicense} />
                    <FormCheckbox className='col-md-4' style={{display:this.state.isLicense?'flex':'none'}} ref={e => this.itemHasLicense = e} isSwitch={true} label='Cấp phát' readOnly={readOnly} />
                </div>
                </>
        });
    }
}

class LicensePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/license', () => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });
            this.props.getLicensePage(1, 50, {datSatHach:true});
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getLicensePage(pageNumber, pageSize, { searchText,datSatHach:true }, (page) => {
            this.setState({ searchText, isSearching: false });
            done && done(page);
        }));
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    }

    update = (_id,changes,done)=>{
        this.props.updateCertificate(_id,changes,()=>{
            this.onSearch({});
            done && done();
        });
    }

    updateHasLicense = (_id,isLicense,changes)=>{
        if(isLicense) this.props.updateCertificate(_id,changes,()=>this.onSearch({}));
    }

    printDeliveryForm = (e,item)=>{
        e.preventDefault();
        console.log('get file docs!',item);
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
                    <th style={{ width: '40%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: '40%' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: '20%' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kỳ sát hạch</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đã có GPLX</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cấp phát</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={<>{item.lastname} {item.firstname}</>} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={item.courseType && item.courseType.title} />
                    <TableCell type='text' content={item.kySatHach} style={{whiteSpace:'nowrap'}} />
                    <TableCell type='checkbox' content={item.isLicense} permission={permission} onChanged = {value=>this.update(item._id,{isLicense:value,hasLicense:0})}/>
                    {item.isLicense && <TableCell type='checkbox' content={item.hasLicense} permission={permission} onChanged = {value=>this.updateHasLicense(item._id,item.isLicense,{hasLicense:value})}/>}
                    {!item.isLicense && <TableCell type='text' content=''/>}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit}>
                        <a className='btn btn-warning' href='#' onClick={(e) => this.printDeliveryForm(e, item)}>
                            <i className='fa fa-lg fa-print' />
                        </a>
                    </TableCell>
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-certificate',
            title: 'Phát giấy phép lái xe',
            breadcrumb: ['Phát giấy phép lái xe'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        pageName = 'pageLicense' getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
                    <CertificateModal ref={e => this.modal = e} update={this.update} readOnly={!permission.write} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, certificate: state.trainning.certificate });
const mapActionsToProps = { getLicensePage, updateCertificate };
export default connect(mapStateToProps, mapActionsToProps)(LicensePage);