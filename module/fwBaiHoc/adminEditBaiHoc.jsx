import React from 'react';
import { connect } from 'react-redux';
import { updateBaiHoc, getBaiHoc } from './redux/redux.jsx'
import { createLessonVideo, getLessonVideoList } from './redux/reduxLessonVideo.jsx'
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
// import ImageBox from '../../view/component/ImageBox.jsx';
class VideoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.modal = React.createRef();
        // this.imageBox = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#videoTitle').focus());
        }, 250));
    }

    show = (video) => {
        let { _id, title, link } = video ? video : { _id: null, title: '', link: '' };

        $(this.btnSave.current).data('id', _id);
        $('#videoTitle').val(title);
        $('#videoLink').val(link);
        // this.imageBox.current.setData('video:' + (_id ? _id : 'new'));
        // this.setState({ image });
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const _id = $(this.btnSave.current).data('id'),
            changes = {
                title: $('#videoTitle').val().trim(),
                link: $('#videoLink').val().trim(),
            };
        if (changes.title == '') {
            T.notify('Tiêu đề video bị trống!', 'danger');
            $('#videoTitle').focus();
        } else if (changes.link == '') {
            T.notify('Link video bị trống!', 'danger');
            $('#videoLink').focus();
        } else {
            if (_id) {
                // this.props.updateVideo(_id, changes, () => {
                //     $(this.modal.current).modal('hide');
                // });
            } else { // Create
                this.props.createLessonVideo('6048fc07c9cf4b13bc96301b', changes, () => {
                    T.notify('Thêm câu hỏi thành công!', 'info');
                    $(this.modal.current).modal('hide');
                });
            }
        }
        event.preventDefault();
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={e => this.save(e)}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin video</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='tab-pane fade show active'>
                                <div className='form-group'>
                                    <label htmlFor='videoTitle'>Tiêu đề</label>
                                    <input className='form-control' id='videoTitle' type='text' placeholder='Tiêu đề video' readOnly={readOnly} />
                                </div>
                            </div>

                            <div className='row'>
                                <div className='col-8'>
                                    <div className='form-group'>
                                        <label htmlFor='videoLink'>Đường dẫn</label>
                                        <input className='form-control' id='videoLink' type='text' placeholder='Link' readOnly={readOnly} />
                                    </div>
                                </div>
                                {/* <div className='col-4'>
                                    <div className='form-group'>
                                        <label>Hình đại diện</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='VideoImage' image={this.state.image} readOnly={readOnly} />
                                    </div>
                                </div> */}
                            </div>
                        </div>

                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' ref={this.btnSave}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
class adminEditBaiHoc extends React.Component {
    state = { item: null };
    editor = React.createRef();
    create = (e) => {
        this.videoModal.current.show(null);
        e.preventDefault();
    }

    edit = (e, item) => {
        this.props.getVideo(item._id, video => this.videoModal.current.show(video));
        e.preventDefault();
    }
    componentDidMount() {
        this.videoModal = React.createRef();
        // this.props.createLessonVideo('60477298b01ec13de4752295', { title: 'hello', link: 'hi' }, () => {
        //     T.notify('Thêm câu hỏi thành công!', 'info');
        //     $(this.modal.current).modal('hide');
        // });
        T.ready('/user/dao-tao', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:baihocId').parse(url);
            this.props.getLessonVideoList(params.baihocId, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                }
                else console.log('ok')
            });
            this.props.getBaiHoc(params.baihocId, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                } else if (data.item) {
                    const item = data.item;
                    $('#title').val(item.title);
                    $('#shortDescription').val(item.shortDescription);
                    this.editor.current.html(item.detailDescription);
                    this.setState(data);
                    $('#title').focus();
                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                }
            });
        });
    }
    save = () => {
        const changes = {
            title: $('#title').val().trim(),
            shortDescription: $('#shortDescription').val().trim(),
            detailDescription: this.editor.current.html(),
        };
        this.props.updateBaiHoc(this.state.item._id, changes)
    };
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('lesson:write');
        const item = this.state.item ? this.state.item : {
            title: ''
        };
        let table = 'Chưa có bài học!';
        if (this.props.subject && this.props.subject.listbaihoc && this.props.subject.listbaihoc.lesson && this.props.subject.listbaihoc.lesson.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên bài học</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.subject.listbaihoc.lesson.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'/user/dao-tao/bai-hoc/view/' + item._id}>{item.title}</Link></td>
                                <td>
                                    <div className='btn-group'>
                                        <a key={0} className='btn btn-success' href='#' onClick={e => this.swap(e, index, monhocId, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>,
                                            <a key={1} className='btn btn-success' href='#' onClick={e => this.swap(e, index, monhocId, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>

                                        <Link to={'/user/dao-tao/bai-hoc/edit/' + item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.contains('lesson:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, monhocId, item._id, item.title)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Bài học: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: item.title != '' ? 'Tiêu đề: <b>' + item.title + '</b> ' : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/dao-tao/bai-hoc/list'>Danh sách tất cả bài học</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Tên bài học</label>
                                        <input className='form-control' type='text' placeholder='Tên loại khóa học' id='title' readOnly={readOnly} />
                                    </div>
                                    {/* <div className='form-group col-sm-12 col-md-8 col-lg-6'>
                                        <label className='control-label'>Giá loại khóa học</label>
                                        <input className='form-control' type='number' placeholder='Giá loại khóa học' id='price' readOnly={readOnly} />
                                    </div> */}
                                </div>

                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Mô tả ngắn gọn</label>
                                        <textarea defaultValue='' className='form-control' id='shortDescription' placeholder='Mô tả ngắn gọn' readOnly={readOnly}
                                            rows={2} />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Mô tả chi tiết </label>
                                        <Editor ref={this.editor} height='400px' placeholder='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-end' >
                                    <button type='button' className='btn btn-primary' onClick={this.save}>
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='tile'>
                            <div className='tile-body'>
                                <label className='control-label'>Danh sách bài giảng video</label>
                                <div className='d-flex justify-content-end'>
                                    <button type='button' className='btn btn-primary' onClick={this.create}>
                                        Thêm bài giảng video mới
                                </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <VideoModal key={2} createLessonVideo={this.props.createLessonVideo} updateVideo={this.props.updateVideo} ref={this.videoModal} readOnly={readOnly} />
                </div>
                <Link to='/user/dao-tao/bai-hoc/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>

            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, baihoc: state.baihoc });
const mapActionsToProps = { updateBaiHoc, getBaiHoc, createLessonVideo, getLessonVideoList };
export default connect(mapStateToProps, mapActionsToProps)(adminEditBaiHoc);
