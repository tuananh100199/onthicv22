import React from 'react';
import { connect } from 'react-redux';
import { getTeacher, updateTeacher,getTeacherCertificationAll,createTeacherCertification,updateTeacherCertification,deleteTeacherCertification } from '../redux';
import { AdminPage, FormTextBox, FormSelect,FormDatePicker, AdminModal, renderTable,TableCell,FormRichTextBox } from 'view/component/AdminPage';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import Dropdown from 'view/component/Dropdown';

const stateMapper = {
    dangKiemTra: { text: 'Đang kiểm tra', style: { color: 'black' } },
    hopLe: { text: 'Hợp lệ', style: { color: '#1488DB' } },
    khongHopLe: { text: 'Không hợp lệ', style: { color: '#DC3545' } },
};

const states = Object.entries(stateMapper).map(([key, value]) => ({ id: key, text: value.text }));

class CertificationModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, category,trinhDo,ngayCap,noiCap,congVanDi,congVanDen,state} = item || 
        {_id:null,trinhDo:'',ngayCap:'',noiCap:'',congVanDi:'',congVanDen:''};
        this.itemTrinhDo.value(trinhDo || '');
        this.itemLoaiChungChi.value(category? category._id : null);
        this.itemNgayCap.value(ngayCap||'');
        this.itemNoiCap.value(noiCap || '');
        this.itemCongVanDen.value(congVanDen||'');
        this.itemCongVanDi.value(congVanDi||'');
        this.itemTrangThai.value(state?state:'dangKiemTra');
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            trinhDo: this.itemTrinhDo.value(),
            category: this.itemLoaiChungChi.value(),
            ngayCap: this.itemNgayCap.value(),
            noiCap: this.itemNoiCap.value(),
            congVanDen: this.itemCongVanDen.value(),
            congVanDi:this.itemCongVanDi.value(),
            teacher:this.props.teacher,
            state:this.itemTrangThai.value(),
        };
        if (!data.category) {
            T.notify('loại chứng chỉ không được trống!', 'danger');
            this.itemLoaiChungChi.focus();
        }else {
            this.state._id ?this.props.update(this.state._id,data,()=>{
                this.hide();
                this.props.reload({});
            }):this.props.create(data,()=>{
                this.hide();
                this.props.reload({});
            });
        }
    }

    // eslint-disable-next-line no-unused-vars

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Chứng chỉ',
            size: 'large',
            body: 
            <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.itemLoaiChungChi = e} label='Loại chứng chỉ' data={this.props.certifications} readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.itemTrinhDo = e} label='Trình độ' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.itemNgayCap = e} label='Ngày cấp' readOnly={readOnly} type='date-mask' />
                <FormTextBox className='col-md-6' ref={e => this.itemNoiCap = e} label='Nơi cấp' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.itemCongVanDi = e} label='Công văn đi' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.itemCongVanDen = e} label='Công văn đến' readOnly={readOnly}/>
                <FormSelect className='col-md-6' ref={e => this.itemTrangThai = e} label='Trạng thái' data={states} readOnly={readOnly} required />
            </div >
        });
    }
}

class InValidModal extends AdminModal {
    state = {};

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLyDo.focus()));
    }

    onShow = (done) => {
        this.setState({ done });
    }

    onSubmit = () => {
        const done = this.state.done;
        const data = {
            lyDo:this.itemLyDo.value()
        };
        if (!data.lyDo) {
            T.notify('Lý do không được trống!', 'danger');
            this.itemLyDo.focus();
        }else {
            done && done(data);
            this.hide();
        }
    }

    // eslint-disable-next-line no-unused-vars

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Lý do không hợp lệ',
            body: 
            <div className='row'>
                <FormRichTextBox className='col-12' ref={e => this.itemLyDo = e} label='Lý do' readOnly={readOnly} row='2'/>
            </div >
        });
    }
}


class TeacherInfoPage extends AdminPage {
    state = {stateChuyenMon:'dangKiemTra'};
    componentDidMount() {
        T.ready('/user/teacher', () => {
            const route = T.routeMatcher('/user/teacher/:_id'), params = route.parse(window.location.pathname);
            if(params && params._id){
                // chứng chỉ
                this.props.getCategoryAll('teacher-certification', null, (items) =>{
                    this.setState({ certifications: (items || []).map(item => ({ id: item._id, text: item.title })) },()=>{
                        if (this.props.teacherData) {
                            const { _id,trinhDoChuyenMon} = this.props.teacherData;
                                this.itemTrinhDo.value(trinhDoChuyenMon? trinhDoChuyenMon.trinhDo:'');
                                this.itemChuyenNganh.value(trinhDoChuyenMon? trinhDoChuyenMon.chuyenNganh:'');
                                this.itemNgayCap.value(trinhDoChuyenMon? trinhDoChuyenMon.ngayCap:null);
                                this.itemNoiCap.value(trinhDoChuyenMon? trinhDoChuyenMon.noiCap:'');
                                this.itemCongVanDen.value(trinhDoChuyenMon? trinhDoChuyenMon.congVanDen:'');
                                this.itemCongVanDi.value(trinhDoChuyenMon? trinhDoChuyenMon.congVanDi:'');
                                this.itemStateChuyenMon.value(trinhDoChuyenMon && trinhDoChuyenMon.state?trinhDoChuyenMon.state:this.state.stateChuyenMon);
                                // this.itemLyDoChuyenMon.value(trinhDoChuyenMon && trinhDoChuyenMon.lyDo?trinhDoChuyenMon.lyDo:'');
                                this.setState({ _id,_teacherId:params._id,stateChuyenMon:trinhDoChuyenMon.state });
                        } else {
                            this.props.history.push('/user/teacher');
                        }
                    });
                });
                // giấy phép lái và chứng chỉ thực hành.
                this.props.getCategoryAll('gplx', null, (items) =>{
                    this.setState({ licences: (items || []).map(item => ({ id: item._id, text: item.title })) },()=>{
                        if (this.props.teacherData) {
                            const {giayPhepLaiXe={},chungChiThucHanh={}} = this.props.teacherData;
                            // giấy phép lái xe
                            this.itemHangGplx.value(giayPhepLaiXe.category||'');
                            this.itemSoGplx.value(giayPhepLaiXe.soGplx||'');
                            this.itemNgayCapGplx.value(giayPhepLaiXe.ngayCap||'');
                            this.itemNoiCapGplx.value(giayPhepLaiXe.noiCap||'');
                            this.itemNgayTrungTuyen.value(giayPhepLaiXe.ngayTrungTuyen||'');
                            this.itemStateGplx.value(giayPhepLaiXe.state||'dangKiemTra');

                            // chứng chỉ thực hành
                            this.itemTrinhDoChungChiThucHanh.value(chungChiThucHanh.category||'');
                            this.itemNgayCapChungChiThucHanh.value(chungChiThucHanh.ngayCap||'');
                            this.itemNoiCapChungChiThucHanh.value(chungChiThucHanh.noiCap||'');
                            this.itemStateChungChiThucHanh.value(chungChiThucHanh.state||'dangKiemTra');
                        } else {
                            this.props.history.push('/user/teacher');
                        }
                    });
                });

                // lấy danh sách chứng chỉ của giáo viên

                this.onSearch({_teacherId:params._id});
                
            }else{
                this.props.history.push('/user/teacher');   
            }
        });
    }

    onSearch = ({_teacherId})=>{
        this.props.getTeacherCertificationAll({teacher:_teacherId?_teacherId:this.state._teacherId});
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    deleteChungChi = (e, item) => e.preventDefault() || T.confirm('Chứng chỉ giáo viên', 'Bạn có chắc bạn muốn xoá chứng chỉ này không?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteTeacherCertification(item._id, ()=>this.onSearch({})));

    updateState = (item, state) =>{
        // if(state!='khongHopLe'){
        //     this.props.updateTeacherCertification(item._id, { state },()=>this.onSearch({}));
        // }else{
        //     this.inVaildModal.show(data=>this.props.updateTeacherCertification(item._id, { state,...data },()=>this.onSearch({})));
        // }
        this.props.updateTeacherCertification(item._id, { state },()=>this.onSearch({}));
    }

    // save data
    
    saveChuyenMon = () => {
        const data = {
            trinhDo: this.itemTrinhDo.value(),
            chuyenNganh: this.itemChuyenNganh.value(),
            ngayCap: this.itemNgayCap.value(),
            noiCap: this.itemNoiCap.value(),
            congVanDen: this.itemCongVanDen.value(),
            congVanDi: this.itemCongVanDi.value(),
            state:this.itemStateChuyenMon.value(),
        };
        this.props.updateTeacher(this.state._id, {trinhDoChuyenMon:data});
    }

    saveGplx = ()=>{
        const data = {
            category: this.itemHangGplx.value(),
            soGplx: this.itemSoGplx.value(),
            ngayCap: this.itemNgayCapGplx.value(),
            noiCap: this.itemNoiCapGplx.value(),
            ngayTrungTuyen: this.itemNgayTrungTuyen.value(),
            state:this.itemStateGplx.value(),
        };
        this.props.updateTeacher(this.state._id, {giayPhepLaiXe:data});
    }

    saveChungChiThucHanh = ()=>{
        const data = {
            category: this.itemHangChungChiThucHanh.value(),
            ngayCap: this.itemNgayCapChungChiThucHanh.value(),
            noiCap: this.itemNoiCapChungChiThucHanh.value(),
            state:this.itemStateChungChiThucHanh.value(),
        };
        this.props.updateTeacher(this.state._id, {chungChiThucHanh:data});
    }

    render() {
        const permission = this.props.permission;
        const readOnly = !permission.write;
        const listChungChi = this.props.teacher && this.props.teacher.listCertification&& this.props.teacher.listCertification.length ? this.props.teacher.listCertification:[];

        const tableCertification = renderTable({
            getDataSource: () => listChungChi,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại bằng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Trình độ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày cấp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nơi cấp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const selectedState = stateMapper[item.state],
                    dropdownState = <Dropdown items={states} item={selectedState} onSelected={e => this.updateState(item, e.id)} textStyle={selectedState ? selectedState.style : null} />;
                return(
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.category ?item.category.title : '_'} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.trinhDo} />
                        <TableCell type='text' content={T.dateToText(item.ngayCap, 'dd/mm/yyyy')} />
                        <TableCell type='text' content={item.noiCap} style={{ whiteSpace: 'nowrap' }}/>
                        <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={e=>this.edit(e,item)} onDelete={this.deleteChungChi} />
                    </tr>
                );
            }
                
        });
        return<>
                <div className='tile'>
                    <div className="tile-title">Trình độ chuyên môn</div>
                    <div className="tile-body">
                        <div className='row'>
                                <FormTextBox className='col-md-4' ref={e => this.itemTrinhDo = e} label='Trình độ' readOnly={readOnly} />
                                <FormTextBox className='col-md-4' ref={e => this.itemChuyenNganh = e} label='Chuyên ngành' readOnly={readOnly} />
                                <FormDatePicker className='col-md-4' ref={e => this.itemNgayCap = e} label='Ngày cấp' readOnly={readOnly} type='date-mask' />
                                <FormTextBox className='col-md-4' ref={e => this.itemNoiCap = e} label='Nơi cấp' readOnly={readOnly} type='email' />
                                <FormTextBox className='col-md-4' ref={e => this.itemCongVanDi = e} readOnly={readOnly} label='Công văn đi' />
                                <FormTextBox className='col-md-4' ref={e => this.itemCongVanDen = e} readOnly={readOnly} label='Công văn đến' />
                                <FormSelect className='col-md-4' ref={e => this.itemStateChuyenMon = e} label='Trạng thái' data={states} readOnly={readOnly} onChange = {value=>this.setState({stateChuyenMon:value.id})} />
                                {/* <div className="col-md-8" style={{display:this.state.stateChuyenMon=='khongHopLe'?'block':'none'}}>
                                    <FormTextBox ref={e => this.itemLyDoChuyenMon = e} label='Lý do' readOnly={readOnly} />
                                </div> */}
                        </div>
                    </div>

                    <div className="tile-footer" style={{textAlign:'right'}}>
                    <button className='btn btn-primary' type='button' onClick={this.saveChuyenMon}>Lưu</button>
                    </div>
                        
                </div>

                <div className='tile'>
                    <div className="tile-title">Chứng chỉ</div>
                    <div className="tile-body">
                        <div className='row'>
                            <div className="col-12">
                                {tableCertification}
                            </div>
                        </div>
                    </div>

                    <div className="tile-footer" style={{textAlign:'right'}}>
                    <button className='btn btn-success' type='button' onClick={this.edit}>Tạo mới</button>
                    </div>
                        
                </div>

                <div className='tile'>
                    <div className="tile-title">Giấy phép lái xe</div>

                    <div className="tile-body">
                        <div className='row'>
                            <FormSelect className='col-md-4' ref={e => this.itemHangGplx = e} label='Hạng GPLX' data={this.state.licences} multiple={true} readOnly={readOnly} />
                            <FormTextBox className='col-md-4' ref={e => this.itemSoGplx = e} label='Số GPLX' readOnly={readOnly} />
                            <FormDatePicker className='col-md-4' ref={e => this.itemNgayCapGplx = e} label='Ngày cấp' readOnly={readOnly} type='date-mask' />
                            <FormTextBox className='col-md-4' ref={e => this.itemNoiCapGplx = e} label='Nơi cấp' readOnly={readOnly}  />
                            <FormDatePicker className='col-md-4' ref={e => this.itemNgayTrungTuyen = e} label='Ngày trúng tuyển' readOnly={readOnly} type='date-mask' />
                            <FormSelect className='col-md-4' ref={e => this.itemStateGplx = e} label='Trạng thái' data={states} readOnly={readOnly} />
                        
                        </div>
                    </div>

                    <div className="tile-footer" style={{textAlign:'right'}}>
                    <button className='btn btn-primary' type='button' onClick={this.saveGplx}>Lưu</button>
                    </div>
                </div>

                <div className='tile'>
                    <div className="tile-title">Chứng chỉ thực hành</div>
                    <div className="tile-body">
                        <div className='row'>
                            <FormSelect className='col-md-6' ref={e => this.itemTrinhDoChungChiThucHanh = e} label='Trình độ' data={this.state.licences} multiple={true} readOnly={readOnly} />
                            <FormDatePicker className='col-md-6' ref={e => this.itemNgayCapChungChiThucHanh = e} label='Ngày cấp' readOnly={readOnly} type='date-mask' />
                            <FormTextBox className='col-md-6' ref={e => this.itemNoiCapChungChiThucHanh = e} label='Nơi cấp' readOnly={readOnly}  />
                            <FormSelect className='col-md-6' ref={e => this.itemStateChungChiThucHanh= e} label='Trạng thái' data={states} readOnly={readOnly} />
                        
                        </div>
                    </div>

                    <div className="tile-footer" style={{textAlign:'right'}}>
                    <button className='btn btn-primary' type='button' onClick={this.saveGplx}>Lưu</button>
                    </div>
                </div>

                <CertificationModal ref={e => this.modal = e} readOnly={!permission.write} certifications={this.state.certifications}
                    create={this.props.createTeacherCertification} update={this.props.updateTeacherCertification} teacher = {this.state._teacherId} reload = {this.onSearch}/>
                <InValidModal ref = {e => this.inVaildModal = e} readOnly={!permission.write}/>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system,teacher:state.enrollment.teacher });
const mapActionsToProps = { updateTeacher, getTeacher ,getCategoryAll,getTeacherCertificationAll,createTeacherCertification,updateTeacherCertification,deleteTeacherCertification};
export default connect(mapStateToProps, mapActionsToProps)(TeacherInfoPage);