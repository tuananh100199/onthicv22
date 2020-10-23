import React from 'react';
import { connect } from 'react-redux';
import { getVideoInPage, createVideo, updateVideo, deleteVideo, getVideo } from './redux/reduxVideo.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';
import Pagination from '../../view/component/Pagination.jsx';
import Editor from '../../view/component/CkEditor4.jsx';

console.log("from admin Video View");

class VideoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.modal = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#videoViTitle').focus());
        }, 250));
    }

    show = (video) => {
        let { _id, title, link, image, content } = video ? video : { _id: null, title: '', link: '', image: '', content: '' };
        title = T.language.parse(title, true);
        content = T.language.parse(content, true);

        $(this.btnSave.current).data('id', _id);
        $('#videoViTitle').val(title.vi);
        $('#videoEnTitle').val(title.en);
        $('#videoLink').val(link);
        this.imageBox.current.setData('video:' + (_id ? _id : 'new'));
        this.viEditor.current.html(content.vi);
        this.enEditor.current.html(content.en);

        this.setState({ image });
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const _id = $(this.btnSave.current).data('id'),
            changes = {
                title: { vi: $('#videoViTitle').val().trim(), en: $('#videoEnTitle').val().trim() },
                link: $('#videoLink').val().trim(),
                content: { vi: this.viEditor.current.html(), en: this.enEditor.current.html() },
            };
        if (changes.title.vi == '') {
            T.notify('Tiêu đề video bị trống!', 'danger');
            $('#videoViTitle').focus();
        } else if (changes.title.en == '') {
            T.notify('Video title bị trống!', 'danger');
            $('#videoEnTitle').focus();
        } else if (changes.link == '') {
            T.notify('Link video bị trống!', 'danger');
            $('#videoLink').focus();
        } else if (changes.content.vi == '') {
            T.notify('Nội dung video bị trống!', 'danger');
        } else if (changes.content.en == '') {
            T.notify('The content of video is empty!', 'danger');
        } else {
            changes.title = JSON.stringify(changes.title);
            changes.content = JSON.stringify(changes.content);
            if (_id) {
                this.props.updateVideo(_id, changes, () => {
                    $(this.modal.current).modal('hide');
                });
            } else { // Create
                this.props.createVideo(changes, () => {
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
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#videoViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#videoEnTab'>English</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='videoViTab' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label htmlFor='videoViTitle'>Tiêu đề</label>
                                        <input className='form-control' id='videoViTitle' type='text' placeholder='Tiêu đề video' readOnly={readOnly} />
                                    </div>
                                    <Editor ref={this.viEditor} placeholder='Nội dung' readOnly={readOnly} />
                                </div>

                                <div id='videoEnTab' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label htmlFor='videoEnTitle'>Title</label>
                                        <input className='form-control' id='videoEnTitle' type='text' placeholder='Video title' readOnly={readOnly} />
                                    </div>
                                    <Editor ref={this.enEditor} placeholder='The content of video' readOnly={readOnly} />
                                </div>
                            </div>

                            <div className='row'>
                                <div className='col-8'>
                                    <div className='form-group'>
                                        <label htmlFor='videoLink'>Link</label>
                                        <input className='form-control' id='videoLink' type='text' placeholder='Link' readOnly={readOnly} />
                                    </div>
                                </div>
                                <div className='col-4'>
                                    <div className='form-group'>
                                        <label>Hình đại diện</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='VideoImage' image={this.state.image} readOnly={readOnly} />
                                    </div>
                                </div>
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

class VideoPage extends React.Component {
    constructor(props) {
        super(props);
        this.videoModal = React.createRef();
    }

    componentDidMount() {
        this.props.getVideoInPage();
    }

    create = (e) => {
        this.videoModal.current.show(null);
        e.preventDefault();
    }

    edit = (e, item) => {
        this.props.getVideo(item._id, video => this.videoModal.current.show(video));
        e.preventDefault();
    }

    changeActive = (item) => {
        this.props.updateVideo(item._id, { active: !item.active });
    }

    delete = (e, item) => {
        T.confirm('Video: Xóa video', 'Bạn có chắc bạn muốn xóa video này?', true, isConfirm => isConfirm && this.props.deleteVideo(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.video && this.props.video.page ?
            this.props.video.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = <p key='table'>Không có video!</p>;
        if (this.props.video && this.props.video.page && this.props.video.page.list && this.props.video.page.list.length > 0) {
            table = (
                <table key='table' className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '40%' }}>Tiêu đề</th>
                            <th style={{ width: '60%' }}>Link</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.video.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.edit(e, item)}>{T.language.parse(item.title)}</a>
                                </td>
                                <td>
                                    <a href={item.link} target='_blank'>{item.link}</a>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {readOnly ? null :
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        const components = [
            table,
            <Pagination key={1} name='adminVideo' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                getPage={this.props.getVideoInPage} />,
            <VideoModal key={2} createVideo={this.props.createVideo} updateVideo={this.props.updateVideo} ref={this.videoModal} readOnly={readOnly} />
        ];
        if (!readOnly) {
            components.push(
                <button key={3} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                    <i className='fa fa-lg fa-plus' />
                </button>);
        }
        return components;
    }
}

const mapStateToProps = state => ({ system: state.system, video: state.video });
const mapActionsToProps = { getVideoInPage, createVideo, updateVideo, deleteVideo, getVideo };
export default connect(mapStateToProps, mapActionsToProps)(VideoPage);