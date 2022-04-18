import React from 'react';
import { connect } from 'react-redux';
import { getTeacher, updateTeacher } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect,FormCheckbox } from 'view/component/AdminPage';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';

class StaffEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/teacher-course', () => {
            const route = T.routeMatcher('/user/teacher-course/:_id'), params = route.parse(window.location.pathname);
            if(params && params._id){
                this.props.getTeacher(params._id, item => {
                    if (item) {
                        this.setState({item});
                        const { _id=null,dayLyThuyet=false,courseTypes=[] } = item ||{};
                        this.itemDayLyThuyet.value(dayLyThuyet);
                        this.itemDayThucHanh.value(!dayLyThuyet);
                        this.itemCourseTypes.value(courseTypes.map(item=>({id:item._id,text:item.title})));
                        this.setState({ _id });
                    } else {
                        this.props.history.push('/user/teacher-course');
                    }
                });
            }else{
                this.props.history.push('/user/teacher-course');   
            }
        });
    }

    save = () => {
        const data = {
            dayLyThuyet:this.itemDayLyThuyet.value()?1:0,
            courseTypes:this.itemCourseTypes.value().length?this.itemCourseTypes.value():' ',
        };
        this.props.updateTeacher(this.state._id, data);
    }

    handleChange = value=>this.itemDayLyThuyet.value(value)||this.itemDayThucHanh.value(!value);

    render() {
        const permission = this.getUserPermission('teacher');
        const readOnly = !permission.write;
        const item = this.state.item ? this.state.item:null;
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Đi khóa giáo viên: ' + (item ? `${item.lastname} ${item.firstname}`:''),
            breadcrumb: [<Link key={0} to='/user/teacher-course'>Đi khóa giáo viên</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='tile'>
                    <div className="tile-title">Hạng đăng ký dạy</div>
                    <div className="tile-body">
                        <div className='row'>
                        <FormSelect className='col-md-6' ref={e => this.itemCourseTypes = e} label='Danh sách loại khóa học' data={ajaxSelectCourseType} multiple={true} readOnly={readOnly} />
                        <FormCheckbox className='col-md-3' ref={e => this.itemDayLyThuyet = e} isSwitch={true} label='Dạy lý thuyết' readOnly={readOnly} onChange={active => this.handleChange(active)} />
                        <FormCheckbox className='col-md-3' ref={e => this.itemDayThucHanh = e} isSwitch={true} label='Dạy thực hành' readOnly={readOnly} onChange={active => this.handleChange(!active)} />
                        </div >
                    </div>
                    <div className="tile-footer" style={{textAlign:'right'}}>
                        <button className='btn btn-primary' type='button' onClick={this.save}>Lưu</button>
                    </div>
                </div>

                <div className='tile'>
                    <div className="tile-title">Lịch sử đi khóa</div>
                    <div className="tile-body">
                        
                    </div>
                </div>
            </>,
            backRoute: '/user/teacher-course',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staffInfo: state.framework.staffInfo });
const mapActionsToProps = { updateTeacher, getTeacher };
export default connect(mapStateToProps, mapActionsToProps)(StaffEditPage);