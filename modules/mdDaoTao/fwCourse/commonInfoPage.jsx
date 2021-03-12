import React from 'react';
import { connect } from 'react-redux';
import { updateCourse, getCourse } from './redux';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';
import { Select } from 'view/component/Input';
import { ajaxSelectAddress } from 'modules/mdTruyenThong/fwAddress/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';

class CommonInfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null };
        this.licenseClass = React.createRef();
        this.editor = React.createRef();
        this.addressSelect = React.createRef();

    }
    componentDidMount() {
        T.ready('/user/course/list', () => {
            $('#launchTime, #startTime,#endTime,#endSubTimeExpect,#endSubTimeOfficial,#graduationTestTimeExpect,#graduationTestTimeOfficial')
                .datepicker({ autoclose: true, format: 'dd/mm/yyyy' });

            const route = T.routeMatcher('/user/course/edit/:courseId'),
                courseId = route.parse(window.location.pathname).courseId;
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/list');
                } else if (data.item) {
                    const item = data.item;
                    $('#courseTitle').val(item.title);
                    $('#courseAbstract').val(item.abstract);
                    $('#launchTime').datepicker('update', item.launchTime ? T.dateToText(item.launchTime, 'dd/mm/yyyy') : '');
                    $('#startTime').datepicker('update', item.startTime ? T.dateToText(item.startTime, 'dd/mm/yyyy') : '');
                    $('#endTime').datepicker('update', item.endTime ? T.dateToText(item.endTime, 'dd/mm/yyyy') : '');
                    $('#endSubTimeExpect').datepicker('update', item.endSubTimeExpect ? T.dateToText(item.endSubTimeExpect, 'dd/mm/yyyy') : '');
                    $('#endSubTimeOfficial').datepicker('update', item.endSubTimeOfficial ? T.dateToText(item.endSubTimeOfficial, 'dd/mm/yyyy') : '');
                    $('#graduationTestTimeExpect').datepicker('update', item.graduationTestTimeExpect ? T.dateToText(item.graduationTestTimeExpect, 'dd/mm/yyyy') : '');
                    $('#graduationTestTimeOfficial').datepicker('update', item.graduationTestTimeOfficial ? T.dateToText(item.graduationTestTimeOfficial, 'dd/mm/yyyy') : '');

                    const address = item.addressId;
                    this.licenseClass.current.val({ id: item.licenseClass._id, text: item.licenseClass.title });
                    this.addressSelect.current.val({ id: address ? address._id : '', text: address ? address.title : '' });
                    this.editor.current.html(item.content);

                    this.setState(data);
                    $('#courseTitle').focus();
                } else {
                    this.props.history.push('/user/course/list');
                }
            });
        });

    }
    // changeActive = (event) => {
    //     this.setState({ item: Object.assign({}, this.state.item, { active: event.target.checked }) });
    // }
    save = () => {
        const changes = {
            title: $('#courseTitle').val().trim(),
            // active: this.state.item.active,
            abstract: $('#courseAbstract').val().trim(),
            content: this.editor.current.html(),
            launchTime: $('#launchTime').val() ? T.formatDate($('#launchTime').val()) : null,
            startTime: $('#startTime').val() ? T.formatDate($('#startTime').val()) : null,
            endTime: $('#endTime').val() ? T.formatDate($('#endTime').val()) : null,
            endSubTimeExpect: $('#endSubTimeExpect').val() ? T.formatDate($('#endSubTimeExpect').val()) : null,
            endSubTimeOfficial: $('#endSubTimeOfficial').val() ? T.formatDate($('#endSubTimeOfficial').val()) : null,
            graduationTestTimeExpect: $('#graduationTestTimeExpect').val() ? T.formatDate($('#graduationTestTimeExpect').val()) : null,
            graduationTestTimeOfficial: $('#graduationTestTimeOfficial').val() ? T.formatDate($('#graduationTestTimeOfficial').val()) : null,
            licenseClass: this.licenseClass.current.val(),
            addressId: this.addressSelect.current.val(),
        };
        this.props.updateCourse(this.state.item._id, changes)
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('course:write');
        const item = this.state.item ? this.state.item : {
            title: '', content: '', createdDate: new Date(), active: false
        };
        return (
            <>
                <div className='row'>
                    <div className='col-12 col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='form-group col-sm-12 col-md-8 col-lg-6'>
                                        <label className='control-label'>Tên khóa học</label>
                                        <input className='form-control' type='text' placeholder='Tên khóa học' id='courseTitle' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group col-md-12 col-lg-3 control-label'>
                                        <Select ref={this.addressSelect} displayLabel={true} adapter={ajaxSelectAddress} label='Cơ sở ' />
                                    </div>
                                    <div className='form-group col-sm-12 col-md-4 col-lg-3 control-label'>
                                        <Select ref={this.licenseClass} displayLabel={true} adapter={ajaxSelectCourseType} label='Loại khóa học ' />
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-4' id='launchTimeSection'>
                                        <label className='control-label' htmlFor='launchTime'>Thời gian khai giảng</label>
                                        <input type='text' className='form-control' id='launchTime' placeholder='Thời gian khai giảng' autoComplete='off' data-date-container='#launchTimeSection' />
                                    </div>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-4' id='startTimeSection'>
                                        <label className='control-label' htmlFor='startTime'>Thời gian bắt đầu</label>
                                        <input type='text' className='form-control' id='startTime' placeholder='Thời gian bắt đầu' autoComplete='off' data-date-container='#startTimeSection' />
                                    </div>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-4' id='endTimeSection'>
                                        <label className='control-label' htmlFor='endTime'>Thời gian kết thúc</label>
                                        <input type='text' className='form-control' id='endTime' placeholder='Thời gian kết thúc' autoComplete='off' data-date-container='#endTimeSection' />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-6' id='endSubTimeExpectSection'>
                                        <label className='control-label' htmlFor='endSubTimeExpect'> Thời gian thi kết thúc môn dự kiến</label>
                                        <input type='text' className='form-control' id='endSubTimeExpect' placeholder='Thời gian thi kết thúc môn dự kiến' autoComplete='off' data-date-container='#endSubTimeExpectSection' />
                                    </div>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-6' id='endSubTimeOfficialSection'>
                                        <label className='control-label' htmlFor='endSubTimeOfficial'> Thời gian thi kết thúc môn chính thức</label>
                                        <input type='text' className='form-control' id='endSubTimeOfficial' placeholder='Thời gian thi kết thúc môn chính thức' autoComplete='off' data-date-container='#endSubTimeOfficialSection' />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-6' id='graduationTestTimeExpectSection'>
                                        <label className='control-label' htmlFor='graduationTestTimeExpect'> Thời gian thi tốt nghiệp dự kiến</label>
                                        <input type='text' className='form-control' id='graduationTestTimeExpect' placeholder='Thời gian thi tốt nghiệp dự kiến' autoComplete='off' data-date-container='#graduationTestTimeExpectSection' />
                                    </div>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-6' id='graduationTestTimeOfficialSection'>
                                        <label className='control-label' htmlFor='graduationTestTimeOfficial'> Thời gian thi tốt nghiệp chính thức</label>
                                        <input type='text' className='form-control' id='graduationTestTimeOfficial' placeholder='Thời gian thi tốt nghiệp chính thức' autoComplete='off' data-date-container='#graduationTestTimeOfficialSection' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <label className='control-label'>Tóm tắt khóa học</label>
                                <textarea defaultValue='' className='form-control' id='courseAbstract' placeholder='Tóm tắt khóa học' readOnly={readOnly}
                                    style={{ minHeight: '100px', marginBottom: '12px' }} />
                                <label className='control-label'>Nội dung khóa học</label>
                                <Editor ref={this.editor} height='400px' placeholder='Nội dung bài biết' uploadUrl='/user/upload?category=course' readOnly={readOnly} />
                            </div>
                        </div>
                    </div>
                </div>

                <Link to='/user/course/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
                {!readOnly &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </>
        )

    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { updateCourse, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(CommonInfoPage);
