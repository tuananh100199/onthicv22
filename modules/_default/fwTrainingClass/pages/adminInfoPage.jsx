import React from 'react';
import { connect } from 'react-redux';
import { getTrainingClass, updateTrainingClass } from '../redux';
import { AdminPage, FormTextBox, FormRichTextBox, FormSelect,FormDatePicker, CirclePageButton } from 'view/component/AdminPage';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';

class TrainingClassInfoPage extends AdminPage {
    state = {gplx:[]};
    componentDidMount() {
        T.ready('/user/training-class', () => {
            const route = T.routeMatcher('/user/training-class/:_id'), params = route.parse(window.location.pathname);
            if(params && params._id){
                // danh mục gplx
                this.props.getCategoryAll('gplx', null, (items) =>{
                    this.setState({ gplx: (items || []).map(item => ({ id: item._id, text: item.title })) },()=>{
                        if (this.props.trainingClass) {
                            const { _id=null,name='',startDate='',endDate='',diaChi='',hangTapHuan='' } = this.props.trainingClass || {};
                                this.itemName.value(name);
                                this.itemHangTapHuan.value(hangTapHuan);
        
                                this.itemStartDate.value(startDate);
                                this.itemEndDate.value(endDate);
                                
                                this.itemDiaChi.value(diaChi);
                                // thời gian làm việc
                                
                                this.setState({ _id });
                                
                            this.itemName.focus();
                        } else {
                            this.props.history.push('/user/training-class');
                        }
                    });
                });
                
            }else{
                this.props.history.push('/user/training-class');   
            }
        });
    }

    onUploadSuccess = ({ error, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
        }
    }

    handleChange = value=>this.itemDayLyThuyet.value(value)||this.itemDayThucHanh.value(!value);

    save = () => {
        const data = {
            name: this.itemName.value(),
            hangTapHuan: this.itemHangTapHuan.value(),
            startDate: this.itemStartDate.value(),
            endDate: this.itemEndDate.value(),
            diaChi: this.itemDiaChi.value(),
            // image:this.state.image
        };
        if (data.name == '') {
            T.notify('Tên lớp tập huấn không được trống!', 'danger');
            this.itemName.focus();
        } else if (!data.hangTapHuan) {
            T.notify('Hạng đăng ký tập huấn không được trống!', 'danger');
            this.itemHangTapHuan.focus();
        }else {
            this.props.updateTrainingClass(this.state._id, data);
        }
    }

    render() {
        const permission = this.getUserPermission('trainingClass');
        const readOnly = !permission.write;
        return<>
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox className='col-md-6' ref={e => this.itemName = e} label='Tên lớp tập huấn' readOnly={readOnly} required />
                        <FormSelect className='col-md-6' ref={e => this.itemHangTapHuan = e} label='Hạng đăng ký tập huấn' data={this.state.gplx} readOnly={readOnly} />
                        <FormDatePicker className='col-md-6' ref={e => this.itemStartDate = e} label='Ngày khai giảng' readOnly={readOnly} type='date-mask' required />
                        <FormDatePicker className='col-md-6' ref={e => this.itemEndDate = e} label='Ngày bế giảng' readOnly={readOnly} type='date-mask' required />
                        <FormRichTextBox className='col-12' ref={e => this.itemDiaChi = e} label='Địa chỉ tập huấn' readOnly={readOnly} rows='2'/>
                    </div >
                </div>

            {permission.write ?<>
                <CirclePageButton type='save' style={{ right: '10px' }} onClick={this.save} />
            </>  : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateTrainingClass, getTrainingClass ,getCategoryAll};
export default connect(mapStateToProps, mapActionsToProps)(TrainingClassInfoPage);