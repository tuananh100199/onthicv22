import React from 'react';
import { connect } from 'react-redux';
import { updateCourse, getCourse, checkLink } from './redux.jsx'
import { Link } from 'react-router-dom';
import ImageBox from '../../view/component/ImageBox.jsx';
import Editor from '../../view/component/CkEditor4.jsx';

class CourseEditPage extends React.Component {
    state = { item: null };
    courseLink = React.createRef();
    imageBox = React.createRef();
    editor = React.createRef();

    componentDidMount() {
        T.ready('/user/course/list', () => {
            const route = T.routeMatcher('/user/course/edit/:courseId'),
                courseId = route.parse(window.location.pathname).courseId;
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/list');
                } else if (data.item) {
                    const item = data.item;
                    if (item.link) {
                        $(this.courseLink.current).html(T.rootUrl + '/khoahoc/' + item.link).attr('href', '/khoahoc/' + item.link);
                    } else {
                        $(this.courseLink.current).html('').attr('');
                    }

                    this.imageBox.current.setData('course:' + (item._id ? item._id : 'new'), item.image || '/img/avatar.jpg');
                    $('#courseTitle').val(item.title);
                    $('#courseAbstract').val(item.abstract);
                    this.editor.current.html(item.content);

                    this.setState(data);
                    $('#courseTitle').focus();
                } else {
                    this.props.history.push('/user/course/list');
                }
            });
        });
    }

    changeActive = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { active: event.target.checked }) });
    }

    checkLink = (item) => {
        this.props.checkLink(item._id, $('#courseLink').val().trim());
    }

    courseLinkChange = (e) => {
        if (e.target.value) {
            $(this.courseLink.current).html(T.rootUrl + '/khoa-hoc/' + e.target.value).attr('href', '/khoa-hoc/' + e.target.value);
        } else {
            $(this.courseLink.current).html('').attr('href', '#');
        }
    }

    save = () => {
        const changes = {
            title: $('#courseTitle').val().trim(),
            link: $('#courseLink').val().trim(),
            active: this.state.item.active,
            abstract: $('#courseAbstract').val().trim(),
            content: this.editor.current.html(),
        };
        this.props.updateCourse(this.state.item._id, changes, () => {
            $('#courseLink').val(changes.link)
        })
    };
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('course:write');

        const item = this.state.item ? this.state.item : {
            title: '', content: '', createdDate: new Date(), active: false
        };
        let linkDefaultCourse = T.rootUrl + '/course/item/' + item._id;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Khóa học: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: item.title != '' ? 'Tiêu đề: <b>' + item.title + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
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
                                    <input className='form-control' type='text' placeholder='Tên khóa học' id='courseTitle' readOnly={readOnly} />
                                </div>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='CourseImage' readOnly={readOnly} />
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        <div className='form-group' style={{ display: 'inline-flex' }}>
                                            <label className='control-label'>Kích hoạt:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.active} onChange={this.changeActive} disabled={readOnly} />
                                                    <span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
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
                            {!readOnly &&
                                <div className='tile-footer'>
                                    <button className='btn btn-danger' type='button' onClick={() => this.checkLink(item)}>
                                        <i className='fa fa-fw fa-lg fa-check-circle' />Kiểm tra link
                                </button>
                                </div>
                            }
                        </div>
                    </div>

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
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { updateCourse, getCourse, checkLink };
export default connect(mapStateToProps, mapActionsToProps)(CourseEditPage);
