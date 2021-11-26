import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { importCar } from '../redux';
// import { importPreStudent } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormFileBox, FormCheckbox, FormDatePicker, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class CarModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { id, licensePlates, user, ngayHetHanDangKiem, ngayHetHanTapLai, ngayDangKy, ngayThanhLy, brand, isPersonalCar } = item || { id: '', licensePlates: '', ngayHetHanDangKiem: '', ngayHetHanTapLai: '', ngayDangKy: '', ngayThanhLy: '', brand: {} };
        this.itemLicensePlates.value(licensePlates);
        this.itemUser.value(user ? user.id : '0');
        this.itemBrand.value(brand ? brand.id : null);
        this.itemIsPersonalCar.value(isPersonalCar);
        this.itemNgayHetHanDangKiem.value(ngayHetHanDangKiem);
        this.itemNgayHetHanTapLai.value(ngayHetHanTapLai);
        this.itemNgayDangKy.value(ngayDangKy);
        this.itemNgayThanhLy.value(ngayThanhLy ? ngayDangKy : null);
        this.setState({ id });
    }

    onSubmit = () => {
        const { brandTypes, dataLecturer } = this.props;
        let brand = this.itemBrand.value(),
            user = this.itemUser.value();
        const i = brandTypes.findIndex(brandType => brandType.id.toLowerCase().trim() == brand);
        const index = dataLecturer.findIndex(lecturer => lecturer.id == user);
        if (i != -1)
            brand = brandTypes[i];
        else brand = null;
        if (index != -1)
            user = dataLecturer[index];
        else user = dataLecturer[0];
        const data = {
            id: this.state.id,
            licensePlates: this.itemLicensePlates.value(),
            user: user,
            brand: brand,
            isPersonalCar: this.itemIsPersonalCar.value(),
            ngayHetHanDangKiem: this.itemNgayHetHanDangKiem.value(),
            ngayHetHanTapLai: this.itemNgayHetHanTapLai.value(),
            ngayDangKy: this.itemNgayDangKy.value(),
            ngayThanhLy: this.itemNgayThanhLy.value(),
        };
        if (data.licensePlates == '') {
            T.notify('Biển số xe không được trống!', 'danger');
            this.itemLicensePlates.focus();
        } else if (data.brand == '') {
            T.notify('Nhãn hiệu xe không được trống!', 'danger');
            this.itemBrand.focus();
        } else if (!data.user) {
            T.notify('Vui lòng chọn chủ xe!', 'danger');
            this.itemUser.focus();
        } else {
            this.props.edit(data);
            T.notify('Cập nhật thông tin xe thành công!', 'success');
            this.hide();
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý xe',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-md-5' ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={readOnly} />
                    <FormSelect ref={e => this.itemBrand = e} className='col-md-4' data={this.props.brandTypes} label='Nhãn hiệu xe' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsPersonalCar = e} isSwitch={true} className='col-md-3' label='Xe cá nhân' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgayHetHanDangKiem = e} className='col-md-6' label='Ngày hết hạn đăng kiểm' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayHetHanTapLai = e} className='col-md-6' label='Ngày hết hạn tập lái' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayDangKy = e} className='col-md-6' label='Ngày đăng ký' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayThanhLy = e} className='col-md-6' label='Ngày thanh lý' readOnly={readOnly} type='date-mask' />
                    <FormSelect className='col-md-4' ref={e => this.itemUser = e} label='Chủ xe' data={this.props.dataLecturer} readOnly={readOnly} />

                </div >
        });
    }
}

class ImportPage extends AdminPage {
    fileBox = React.createRef();
    state = { isFileBoxHide: false };
    componentDidMount() {
        T.ready('/user/car');
        this.props.getAllLecturer(data => {
            if (data && data.length) {
                const listLecturer = [{ id: 0, text: 'Trống', identityCard: 0 }];
                data.forEach(lecturer => listLecturer.push({ id: lecturer._id, text: lecturer.lastname + ' ' + lecturer.firstname, identityCard: lecturer.identityCard }));
                this.setState({ listLecturer });
            }
        });
        this.props.getCategoryAll('car', null, (items) =>
            this.setState({ brandTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
    }

    onUploadSuccess = (data) => {
        const { brandTypes, listLecturer } = this.state;
        const carData = data.data;
        if (carData && carData.length && brandTypes && brandTypes.length, listLecturer && listLecturer.length) {
            carData.forEach(car => {
                const i = brandTypes.findIndex(brandType => brandType.text.toLowerCase().trim() == car.brand);
                const index = listLecturer.findIndex(lecturer => lecturer.identityCard == car.user);
                if (i != -1)
                    car.brand = brandTypes[i];
                else car.brand = null;
                if (index != -1)
                    car.user = listLecturer[index];
                else car.user = listLecturer[0];
            });
        }
        this.setState({ data: carData, isFileBoxHide: true });
        this.itemDivision.value(null);
        this.itemCourseType.value(null);
    }

    showEditModal = (e, item) => e.preventDefault() || this.modal.show(item);

    edit = (changes) => {
        this.setState(prevState => ({
            data: prevState.data.map(data => data.id === changes.id ? changes : data)
        }));
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa thông tin ứng viên', `Bạn có chắc bạn muốn xóa thông tin ứng viên <strong>${item.firstname + ' ' + item.lastname}</strong>?`, true, isConfirm =>
        isConfirm && this.setState(prevState => ({
            data: prevState.data.filter(data => data.id !== item.id)
        }))
    );

    save = () => {
        if (!this.itemDivision.value()) {
            T.notify('Chưa chọn cơ sở đào tạo!', 'danger');
            this.itemDivision.focus();
        } else if (!this.itemCourseType.value()) {
            T.notify('Chưa chọn loại khóa học!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.importCar(this.state.data, this.itemDivision.value(), this.itemCourseType.value(), data => {
                if (data.error) {
                    T.notify('Import ứng viên bị lỗi!', 'danger');
                } else {
                    this.props.history.push('/user/car/manager');
                }
            });
        }
    }

    onReUpload = () => {
        this.setState({ data: [], isFileBoxHide: false });
    }

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'import']),
            readOnly = !permission.write;
        const table = renderTable({
            getDataSource: () => this.state.data && this.state.data.length > 0 ? this.state.data : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Biển số xe</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nhãn hiệu</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày hết hạn đăng kiểm</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày hết hạn đăng ký tập lái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày thanh lý</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chủ xe</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.licensePlates} />
                    <TableCell type='text' content={item.brand && item.brand.text} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayHetHanDangKiem, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayHetHanTapLai, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayDangKy, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ngayThanhLy ? T.dateToText(item.ngayThanhLy, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.user && item.user.text} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showEditModal} onDelete={this.delete} />
                </tr>),
        });

        const filebox = !this.state.isFileBoxHide && (
            <div className='tile'>
                <h3 className='tile-title'>Import danh sách xe</h3>
                <FormFileBox ref={e => this.fileBox = e} uploadType='CarFile'
                    onSuccess={this.onUploadSuccess} readOnly={readOnly} />
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-primary' type='button'>
                        <a href='/download/car.xlsx' style={{ textDecoration: 'none', color: 'white' }}><i className='fa-fw fa-lg fa fa-download' /> Tải xuống file mẫu</a>
                    </button>
                </div>
            </div >
        );
        const list = (
            <div>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect ref={e => this.itemDivision = e} className='col-md-4' label={'Chọn cơ sở'} data={ajaxSelectDivision} readOnly={readOnly} />
                        <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label={'Chọn loại khóa học'} data={ajaxSelectCourseType} readOnly={readOnly} />
                    </div>
                    <h3 className='tile-title'>Danh sách ứng viên</h3>
                    <div className='tile-body' style={{ overflowX: 'auto' }}>
                        {table}
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-danger' type='button' style={{ marginRight: 10 }} onClick={this.onReUpload}>
                            <i className='fa fa-fw fa-lg fa-cloud-upload' /> Upload lại
                        </button>
                        <button className='btn btn-primary' type='button' onClick={this.save}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div>
                <CarModal readOnly={!permission.write} ref={e => this.modal = e} brandTypes={this.state.brandTypes} edit={this.edit} dataLecturer={this.state.listLecturer} />
            </div>
        );
        return this.renderPage({
            icon: 'fa fa-car',
            title: 'Nhập danh sách xe bằng Excel',
            breadcrumb: [<Link key={0} to='/user/car'>Quản lý xe</Link>, 'Nhập danh sách xe bằng Excel'],
            content: <>
                {filebox}
                {this.state.data && this.state.data.length ? list : null}
            </>,
            backRoute: '/user/car/manager',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getAllLecturer, getCategoryAll, importCar };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
