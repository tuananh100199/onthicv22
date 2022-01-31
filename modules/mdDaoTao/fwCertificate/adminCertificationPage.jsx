import React from 'react';
import { connect } from 'react-redux';
import { getCertificationPage, updateCertificate } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormCheckbox } from 'view/component/AdminPage';

class CertificateModal extends AdminModal {
    state = {isCertification:false};
    onShow = (item) => {
        let { _id, lastname, firstname, identityCard, courseType, course,isCertification,hasCertification } = item || { _id: null, student: null, ngayNhanChungChiHoanThanhKhoaHoc: '', ngayNhanGiayPhepLaiXe: '',isCertification:false,hasCertification:false };
        this.itemStudent.value(lastname + ' ' + firstname);
        this.itemIdentityCard.value(identityCard);
        this.itemCourseType.value(courseType ? courseType.title : '');
        this.itemCourse.value(course ? course.name : '');
        this.itemIsCertification.value(isCertification);
        this.itemHasCertification.value(hasCertification);
        this.setState({ _id, isCertification });
    };

    onSubmit = () => {
        const data = { 
            isCertification:this.itemIsCertification.value(),
            hasCertification:this.itemHasCertification.value(),
        };
        this.props.update(this.state._id, data,this.hide);
    }

    onChangeLicense = isCertification=>{
        this.setState({isCertification});
        this.itemHasCertification.value(false);
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Chứng chỉ sơ cấp',
            size: 'large',
            body:
                <>
                <div className='row'>
                    <FormTextBox className='col-md-4' ref={e => this.itemStudent = e} label='Học viên' readOnly={true} />
                    <FormTextBox className='col-md-4' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={true} />
                    <FormTextBox className='col-md-4' ref={e => this.itemCourseType = e} label='Loại khóa học' readOnly={true} />
                    <FormTextBox className='col-md-4' ref={e => this.itemCourse = e} label='Khóa học' readOnly={true} />
                    <FormCheckbox ref={e => this.itemIsCertification = e} isSwitch={true} className='col-md-4' label='Đã có CCSC' readOnly={readOnly} onChange={this.onChangeCertification} />
                    <FormCheckbox className='col-md-4' style={{display:this.state.isCertification?'flex':'none'}} ref={e => this.itemHasCertification = e} isSwitch={true} label='Cấp phát' readOnly={readOnly} />
                </div>
                </>
        });
    }
}

class CertificationPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/certification', () => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });
            this.props.getCertificationPage(1, 50, {totNghiep:true});
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getCertificationPage(pageNumber, pageSize, { searchText,totNghiep:true }, (page) => {
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

    render() {
        const permission = this.getUserPermission('certificate');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.certificate && this.props.certificate.certificationPage ?
            this.props.certificate.certificationPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '40%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: '40%' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: '20%' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: '40%' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đã có CCSC</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cấp phát</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${item.lastname} ${item.firstname}`} onClick={e => this.edit(e, item)} />
                    <TableCell type='link' content={item.identityCard} onClick={e => this.edit(e, item)}/>
                    <TableCell type='text' content={item.courseType && item.courseType.title} />
                    <TableCell type='text' content={item.course && item.course.name} />
                    <TableCell type='checkbox' content={item.isCertification} permission={permission} onChanged = {value=>this.update(item._id,{isCertification:value,hasCertification:0})}/>
                    {item.isCertification && <TableCell type='checkbox' content={item.hasCertification} permission={permission} onChanged = {hasCertification=>this.update(item._id,{hasCertification})}/>}
                    {!item.isCertification && <TableCell type='text' content=''/>}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-certificate',
            title: 'Phát chứng chỉ sơ cấp',
            breadcrumb: ['Phát chứng chỉ sơ cấp'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        pageName = 'pageCertification' getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
                    <CertificateModal ref={e => this.modal = e} update={this.update} readOnly={!permission.write} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, certificate: state.trainning.certificate });
const mapActionsToProps = { getCertificationPage, updateCertificate };
export default connect(mapStateToProps, mapActionsToProps)(CertificationPage);