// import React from 'react';
// import { connect } from 'react-redux';
// import { updateCourse, getCourse } from './redux.jsx'
// import { Link } from 'react-router-dom';
// import Editor from '../../view/component/CkEditor4.jsx';
// import { ajaxSelectUser } from '../fwUser/redux.jsx';
// import { ajaxSelectAddress } from '../fwAddress/redux.jsx';
// import { Select } from '../../view/component/Input.jsx';
// import Dropdown from '../../view/component/Dropdown.jsx';

// class CourseEditPage extends React.Component {
//     state = { item: null };
//     licenseClass = React.createRef();
//     editor = React.createRef();
//     adminSelect = React.createRef();
//     addressSelect = React.createRef();
//     supSelect = React.createRef();

//     componentDidMount() {
//         // this.userSelect.current.val('');
//         T.ready('/user/course/list', () => {
//             $('#birthday').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
//             $('#identityDate').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
//             $('#launchTime').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
//             // $('#startTime').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
//             const route = T.routeMatcher('/user/course/edit/:courseId'),
//                 courseId = route.parse(window.location.pathname).courseId;
//             this.props.getCourse(courseId, data => {
//                 if (data.error) {
//                     T.notify('Lấy khóa học bị lỗi!', 'danger');
//                     this.props.history.push('/user/course/list');
//                 } else if (data.item) {
//                     const item = data.item;
//                     $('#courseTitle').val(item.title);
//                     $('#courseAbstract').val(item.abstract);
//                     const admin = item.adminId;
//                     const address = item.addressId;
//                     this.licenseClass.current.val(item.licenseClass ? item.licenseClass : '');
//                     this.addressSelect.current.val({ id: address._id, text: address.title });
//                     this.adminSelect.current.val({ id: admin._id, text: `${admin.lastname} ${admin.firstname} (${admin.email})` });
//                     this.editor.current.html(item.content);

//                     this.setState(data);
//                     $('#courseTitle').focus();
//                 } else {
//                     this.props.history.push('/user/course/list');
//                     this.adminSelect.current.val('');
//                 }
//             });
//         });
//     }

//     changeActive = (event) => {
//         this.setState({ item: Object.assign({}, this.state.item, { active: event.target.checked }) });
//     }
//     save = () => {
//         const changes = {
//             title: $('#courseTitle').val().trim(),
//             active: this.state.item.active,
//             abstract: $('#courseAbstract').val().trim(),
//             content: this.editor.current.html(),
//         };
//         this.props.updateCourse(this.state.item._id, changes)
//     };
//     render() {
//         const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
//         const readOnly = !currentPermissions.includes('course:write');

//         const item = this.state.item ? this.state.item : {
//             title: '', content: '', createdDate: new Date(), active: false
//         };

//         return (
//             <main className='app-content'>
//                 <div className='app-title'>
//                     <div>
//                         <h1><i className='fa fa-file' /> Khóa học: Chỉnh sửa</h1>
//                         <p dangerouslySetInnerHTML={{ __html: item.title != '' ? 'Tiêu đề: <b>' + item.title + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
//                     </div>
//                     <ul className='app-breadcrumb breadcrumb'>
//                         <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
//                         &nbsp;/&nbsp;
//                         <Link to='/user/course/list'>Danh sách khóa học</Link>
//                         &nbsp;/&nbsp;Chỉnh sửa
//                     </ul>
//                 </div>
//                 <div className='row'>
//                     <div className='col-12 col-md-12'>
//                         <div className='tile'>
//                             <h3 className='tile-title'>Thông tin chung</h3>
//                             <div className='tile-body'>
//                                 <div className='row'>
//                                     <div className='form-group col-sm-12 col-md-8 col-lg-6'>
//                                         <label className='control-label'>Tên khóa học</label>
//                                         <input className='form-control' type='text' placeholder='Tên khóa học' id='courseTitle' readOnly={readOnly} />
//                                     </div>
//                                     <div className='form-group col-md-12 col-lg-3 control-label'>
//                                         <Select ref={this.addressSelect} displayLabel={true} adapter={ajaxSelectAddress} label='Cơ sở ' />
//                                     </div>
//                                     <div className='form-group col-sm-12 col-md-4 col-lg-3'>
//                                         <label className='control-label'>Loại khóa học</label>
//                                         <Dropdown style={{ marginLeft: '10px' }} ref={this.licenseClass} text='' items={Object.keys(T.licenseClass)} />
//                                     </div>
//                                 </div>

//                                 <div className='row'>
//                                     <div className='form-group col-sm-12 col-xl-6' id='birthdaySection'>
//                                         <label className='control-label' htmlFor='birthday'>Ngày sinh</label>
//                                         <input className='form-control' type='text' placeholder='Ngày sinh' id='birthday' autoComplete='off' data-date-container='#birthdaySection' />
//                                     </div>
//                                     <div className='form-group col-md-12 col-lg-6 col-xl-4' id='identityDateSection'>
//                                         <label className='control-label' htmlFor='identityDate'>Cấp ngày</label>
//                                         <input className='form-control' type='text' placeholder='Ngày cấp CMND' id='identityDate' data-date-container='#identityDateSection' />
//                                     </div>
//                                 </div>

//                                 <div className='row'>
//                                     <div className='col-md-12 col-lg-6 col-xl-8'>
//                                         <div className='form-group'>
//                                             <label className='control-label' htmlFor='regularResidence'>Nơi đăng ký hộ khẩu thường trú</label>
//                                             <textarea className='form-control' id='regularResidence' placeholder='Nơi đăng ký hộ khẩu thường trú' rows='5' />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className='row'>
//                                     <div className='form-group col-md-12 col-lg-12 col-xl-5'>
//                                         <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu)</label>
//                                         <input className='form-control' type='text' id='identityCard' placeholder='Nhập số CMND' />
//                                     </div>
//                                     <div className='form-group col-md-12 col-lg-6 col-xl-4' id='identityDateSection'>
//                                         <label className='control-label' htmlFor='identityDate'>Cấp ngày</label>
//                                         <input className='form-control' type='text' placeholder='Ngày cấp CMND' id='identityDate' data-date-container='#identityDateSection' />
//                                     </div>
//                                     <div className='form-group col-md-12 col-lg-6 col-xl-3'>
//                                         <label className='control-label' htmlFor='identityIssuedBy'>Nơi cấp</label>
//                                         <input className='form-control' type='text' placeholder='Nơi cấp CMND' id='identityIssuedBy' />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className='tile-footer' style={{ textAlign: 'right' }}>
//                                 <button className='btn btn-primary' type='button' onClick={this.saveCommon}>Lưu</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className='row'>
//                     <div className='col-md-6'>
//                         <div className='tile'>
//                             <h3 className='tile-title'>Thông tin chung</h3>
//                             <div className='tile-body'>
//                                 <div className='form-group'>
//                                     <label className='control-label'>Tên khóa học</label>
//                                     <input className='form-control' type='text' placeholder='Tên khóa học' id='courseTitle' readOnly={readOnly} />
//                                 </div>
//                                 <div className='row'>
//                                     <div className='col-md-6'>
//                                         <div className='form-group' style={{ width: '100%' }}>
//                                             <label className='control-label'>Loại khóa học</label>
//                                             <Dropdown style={{ marginLeft: '10px' }} ref={this.licenseClass} text='' items={Object.keys(T.licenseClass)} />
//                                         </div>
//                                     </div>
//                                     <div className='col-md-6'>
//                                         <div className='form-group' style={{ display: 'inline-flex' }}>
//                                             <label className='control-label'>Kích hoạt&nbsp;</label>
//                                             <div className='toggle'>
//                                                 <label>
//                                                     <input type='checkbox' checked={item.active} onChange={this.changeActive} disabled={readOnly} />
//                                                     <span className='button-indecator' />
//                                                 </label>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className='form-group col-sm-12 col-xl-6' id='launchTimeSection'>
//                                     <label className='control-label' htmlFor='launchTime'>Thời gian khai giảng</label>
//                                     <input type='text' className='form-control' id='launchTime' placeholder='Thời gian khai giảng' autoComplete='off' data-date-container='#launchTimeSection' />
//                                 </div>

//                                 {/* <div className='row'>
//                                     <div className='form-group col-sm-12 col-xl-6' id='startTimeSection'>
//                                         <label className='control-label' htmlFor=' startTime'>Thời gian bắt đầu</label>
//                                         <input type='text' className='form-control' id=' startTime' placeholder='Thời gian khai giảng' autoComplete='off' data-date-container='#startTimeSection' />
//                                     </div>
//                                     <div className='form-group col-sm-12 col-xl-6' id='birthdaySection'>
//                                         <label className='control-label' htmlFor='title'>Thời gian kết thúc</label>
//                                         <input type='text' className='form-control' id='title' placeholder='Thời gian khai giảng' autoComplete='off' data-date-container='#birthdaySection' />
//                                     </div>
//                                 </div>
//                                 <div className='row'>
//                                     <div className='form-group col-sm-12 col-xl-6' id='birthdaySection'>
//                                         <label className='control-label' htmlFor='title'> Thời gian thi kết thúc môn dự kiến</label>
//                                         <input type='text' className='form-control' id='title' placeholder='Thời gian khai giảng' autoComplete='off' data-date-container='#birthdaySection' />
//                                     </div>
//                                     <div className='form-group col-sm-12 col-xl-6' id='birthdaySection'>
//                                         <label className='control-label' htmlFor='title'>Thời gian thi kết thúc môn chính thức</label>
//                                         <input type='text' className='form-control' id='title' placeholder='Thời gian khai giảng' autoComplete='off' data-date-container='#birthdaySection' />
//                                     </div>
//                                 </div>
//                                 <div className='row'>
//                                     <div className='form-group col-sm-12 col-xl-6' id='birthdaySection'>
//                                         <label className='control-label' htmlFor='title'> Thời gian  thi tốt nghiệp dự kiến</label>
//                                         <input type='text' className='form-control' id='title' placeholder='Thời gian khai giảng' autoComplete='off' data-date-container='#birthdaySection' />
//                                     </div>
//                                     <div className='form-group col-sm-12 col-xl-6' id='birthdaySection'>
//                                         <label className='control-label' htmlFor='title'>Thời gian  thi tốt nghiệp chính thức</label>
//                                         <input type='text' className='form-control' id='title' placeholder='Thời gian khai giảng' autoComplete='off' data-date-container='#birthdaySection' />
//                                     </div>
//                                 </div> */}
//                             </div>
//                         </div>
//                     </div>

//                     <div className='col-md-6'>
//                         <div className='tile'>
//                             <h3 className='tile-title'>Thông tin người quản trị</h3>
//                             <div className='tile-body'>
//                                 <div className='form-group control-label'>
//                                     <Select ref={this.adminSelect} displayLabel={true} adapter={ajaxSelectUser} label='Quản lý chung' />
//                                 </div>
//                                 <div className='form-group control-label'>
//                                     <Select ref={this.supSelect} displayLabel={true} adapter={ajaxSelectUser} label='Giám sát viên' />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className='row'>
//                         <div className='form-group col-sm-12 col-xl-6' id='birthdaySection'>
//                             <label className='control-label' htmlFor='birthday'>Ngày sinh</label>
//                             <input className='form-control' type='text' placeholder='Ngày sinh' id='birthday' autoComplete='off' data-date-container='#birthdaySection' />
//                         </div>
//                     </div>

//                     <div className='col-md-12'>
//                         <div className='tile'>
//                             <div className='tile-body'>
//                                 <label className='control-label'>Tóm tắt khóa học</label>
//                                 <textarea defaultValue='' className='form-control' id='courseAbstract' placeholder='Tóm tắt khóa học' readOnly={readOnly}
//                                     style={{ minHeight: '100px', marginBottom: '12px' }} />
//                                 <label className='control-label'>Nội dung khóa học</label>
//                                 <Editor ref={this.editor} height='400px' placeholder='Nội dung bài biết' uploadUrl='/user/upload?category=course' readOnly={readOnly} />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <Link to='/user/course/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
//                 {!readOnly &&
//                     <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
//                         <i className='fa fa-lg fa-save' />
//                     </button>}
//             </main>
//         );
//     }
// }

// const mapStateToProps = state => ({ system: state.system, course: state.course });
// const mapActionsToProps = { updateCourse, getCourse };
// export default connect(mapStateToProps, mapActionsToProps)(CourseEditPage);
