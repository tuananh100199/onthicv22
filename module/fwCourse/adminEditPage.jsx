import React from 'react';
import { connect } from 'react-redux';
import { updateCourse, getCourse, checkLink } from './redux.jsx'
import { Link } from 'react-router-dom';
import ImageBox from '../../view/component/ImageBox.jsx';
import Editor from '../../view/component/CkEditor4.jsx';

class CourseEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null };
        this.courseLink = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/course/list', () => {
            this.getData();
            $('#courseTitle').focus();
            $('#courseCategories').select2();
            $('#courseStartPost').datetimepicker(T.dateFormat);
            $('#courseStopPost').datetimepicker(T.dateFormat);
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/course/edit/:courseId'),
            courseId = route.parse(window.location.pathname).courseId;
        this.props.getCourse(courseId, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                this.props.history.push('/user/course/list');
            } else if (data.item) {
                let item = data.item;
                let categories = data.categories.map(item => ({ id: item.id, text: T.language.parse(item.text) }));
                $('#courseCategories').select2({ data: categories }).val(item.categories).trigger('change');
                const courseStartPost = $('#courseStartPost').datetimepicker(T.dateFormat);
                const courseStopPost = $('#courseStopPost').datetimepicker(T.dateFormat);
                if (item.startPost)
                    courseStartPost.val(T.dateToText(item.startPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (item.stopPost)
                    courseStopPost.val(T.dateToText(item.stopPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (item.link) {
                    $(this.courseLink.current).html(T.rootUrl + '/khoahoc/' + item.link).attr('href', '/khoahoc/' + item.link);
                } else {
                    $(this.courseLink.current).html('').attr('');
                }
                item.image = item.image ? item.image : '/image/avatar.jpg';
                this.imageBox.current.setData('course:' + (item._id ? item._id : 'new'));
                let title = T.language.parse(item.title, true),
                    abstract = data.item.abstract,
                    content = T.language.parse(item.content, true);
                $('#courseTitle').val(title.vi);
                $('#courseAbstract').val(abstract);
                this.viEditor.current.html(content.vi);
                this.setState(data);
            } else {
                this.props.history.push('/user/course/list');
            }
        });
    }

    changeActive = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { active: event.target.checked }) });
    }
    changeisInternal = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { isInternal: event.target.checked }) });
    }

    checkLink = (item) => {
        this.props.checkLink(item._id, $('#courseLink').val().trim());
    }
    courseLinkChange = (e) => {
        if (e.target.value) {
            $(this.courseLink.current).html(T.rootUrl + '/tintuc/' + e.target.value).attr('href', '/tintuc/' + e.target.value);
        } else {
            $(this.courseLink.current).html('').attr('href', '#');
        }
    }

    save = () => {
        const courseStartPost = $('#courseStartPost').val(),
            courseStopPost = $('#courseStopPost').val(),
            changes = {
                categories: $('#courseCategories').val(),
                title: JSON.stringify({ vi: $('#courseTitle').val() }),
                link: $('#courseLink').val().trim(),
                active: this.state.item.active,
                isInternal: this.state.item.isInternal,
                abstract: $('#courseAbstract').val().trim(),
                content: JSON.stringify({ vi: this.viEditor.current.html() }),
            };
        if (courseStartPost) changes.startPost = T.formatDate(courseStartPost);
        if (courseStopPost) changes.stopPost = T.formatDate(courseStopPost);
        if (this.props.system.user.permissions.includes('course:write')) {
            this.props.updateCourse(this.state.item._id, changes, () => {
                $('#courseLink').val(changes.link)
            })
        } else {
        }
    };
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = true;
        const item = this.state.item ? this.state.item : {
            priority: 1,
            categories: [],
            title: '',
            content: '',
            image: T.url('/image/avatar.jpg'),
            createdDate: new Date(),
            active: false, isInternal: false,
            view: 0
        };
        let title = T.language.parse(item.title, true), linkDefaultCourse = T.rootUrl + '/course/item/' + item._id;
        const route = T.routeMatcher('/user/course/edit/:courseId'),
            courseId = route.parse(window.location.pathname).courseId;
        const docMapper = {};
        if (!docMapper[courseId]) readOnly = false;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Khóa học: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/course/list'>Danh sách khóa học</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Tên khóa học</label>
                                    <input className='form-control' type='text' placeholder='Tên khóa học' id='courseTitle' defaultValue={title.vi} readOnly={readOnly} />
                                </div>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='CourseImage' image={item.image} readOnly={readOnly} />
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        {currentPermissions.includes('course:write') ? <div className='form-group' style={{ display: 'inline-flex' }}>
                                            <label className='control-label'>Kích hoạt:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.active} onChange={this.changeActive} disabled={readOnly} />
                                                    <span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div> : null}
                                        <div className='form-group'>
                                            <label className='control-label col-12'>Lượt xem: {item.view}</label>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Danh mục khóa học</label>
                                    <select className='form-control' id='courseCategories' multiple={true} defaultValue={[]} disabled={readOnly} >
                                        <optgroup label='Lựa chọn danh mục' />
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Link</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Link mặc định</label><br />
                                    <a href={linkDefaultCourse} style={{ fontWeight: 'bold' }} target='_blank'>{linkDefaultCourse}</a>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Link truyền thông</label><br />
                                    <a href='#' ref={this.courseLink} style={{ fontWeight: 'bold' }} target='_blank' />
                                    <input className='form-control' id='courseLink' type='text' placeholder='Link truyền thông' defaultValue={item.link} readOnly={readOnly}
                                        onChange={this.courseLinkChange} />
                                </div>
                            </div>
                            {readOnly ? '' :
                                <div className='tile-footer'>
                                    <button className='btn btn-danger' type='button' onClick={() => this.checkLink(item)}>
                                        <i className='fa fa-fw fa-lg fa-check-circle' />Kiểm tra link
                                </button>
                                </div>
                            }
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Ngày tháng</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày tạo: {T.dateToText(item.createdDate)}</label>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày bắt đầu đăng khóa học{readOnly && item.startPost ? ': ' + T.dateToText(item.startPost, 'dd/mm/yyyy HH:MM') : ''}</label>
                                    <input className='form-control' id='courseStartPost' type='text' placeholder='Ngày bắt đầu đăng khóa học' defaultValue={item.startPost}
                                        disabled={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày kết thúc đăng khóa học{readOnly && item.stopPost ? ': ' + T.dateToText(item.stopPost, 'dd/mm/yyyy HH:MM') : ''}</label>
                                    <input className='form-control' id='courseStopPost' type='text' placeholder='Ngày kết thúc đăng khóa học' defaultValue={item.stopPost}
                                        disabled={readOnly} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <div className='tab-content' style={{ paddingTop: '12px' }}>
                                    <div id='courseTab' className='tab-pane fade show active'>
                                        <label className='control-label'>Tóm tắt khóa học</label>
                                        <textarea defaultValue='' className='form-control' id='courseAbstract' placeholder='Tóm tắt khóa học' readOnly={readOnly}
                                            style={{ minHeight: '100px', marginBottom: '12px' }} />
                                        <label className='control-label'>Nội dung khóa học</label>
                                        <Editor ref={this.viEditor} height='400px' placeholder='Nội dung bài biết' uploadUrl='/user/upload?category=course' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Link to={'/user/course/list'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { updateCourse, getCourse, checkLink };
export default connect(mapStateToProps, mapActionsToProps)(CourseEditPage);
