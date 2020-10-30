import React from 'react';
import { connect } from 'react-redux';
import { getListVideoItem, updateListVideo, addVideoIntoList, updateVideoInList, removeVideoFromList, swapVideoInList } from './redux/reduxListVideo.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';
import { lineBreak } from 'acorn';

const texts = {
    vi: {
        getListVideoError: 'Lấy danh sách bị lỗi!',
    },
    en: {
        getListVideoError: 'Failed to get list of videos!'
    }
}
const language = T.language(texts);

class VideoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.modal = React.createRef();
        this.editor = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#sttTitle').focus())
        }, 250));
    }

    show = (selectedItem, index) => {
        let {  _id, title, link, image } = selectedItem ? selectedItem : { _id: null, title: '', link: '', image: '' };
        title = T.language.parse(title, true);

        $(this.btnSave.current).data('id', _id);
        $('#videoTitle').val(title.vi);
        $('#videoLink').val(link);

        $(this.btnSave.current).data('isNewMember', selectedItem == null).data('index', index);

        // this.imageBox.current.setData('video:' + (_id ? _id : 'new'));
        $(this.modal.current).modal('show');
    }
    hide = () => {
        $(this.modal.current).modal('hide');
    }

    save = (event) => {
        const _id = $(this.btnSave.current).data('id'),
            changes = {
                title: $('#videoTitle').val().trim(),
                link: $('#videoLink').val().trim(),
            };
        if (changes.title == '') {
            T.notify('Tiêu đề video bị trống!', 'danger');
            $('#videoViTitle').focus();
        } else if (changes.link == '') {
            T.notify('Link video bị trống!', 'danger');
            $('#videoLink').focus();
        } else {
            changes.title = JSON.stringify(changes.title);
            changes.link = JSON.stringify(changes.link);

            if (_id) {
                this.props.updateVideo(_id, changes, () => {
                    $(this.modal.current).modal('hide');
                });
            } else { // Create
                this.props.addVideo(changes, () => {
                    $(this.modal.current).modal('hide');
                });
            }
        }
        event.preventDefault();
    }
    // save = (event) => {
    //     const btnSave = $(this.btnSave.current),
    //         isNewMember = btnSave.data('isNewMember'),
    //         index = btnSave.data('index'),
    //         title = {
    //             vi: $('#videoTitle').val(),
    //         };
        

    //     if (isNewMember) {
    //         this.props.addVideo(JSON.stringify(title), number);
    //     } else {
    //         this.props.updateVideo(index, JSON.stringify(title), number);
    //     }
    //     event.preventDefault();
    // }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='container-fluid row'>
                                <h5 className='modal-title col-6'>Thêm/Sửa Video</h5>
                            </div>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='container-fluid row'>
                                <div className='col-6'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='videoTitle'>Tên</label><br />
                                        <input className='form-control' id='videoTitle' type='text' placeholder='Tên' />
                                    </div>
                                </div>

                                <div className='col-12'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='videoLink'>Link</label>
                                        <input className='form-control' id='videoLink' type='text' placeholder='Link' />
                                   
                                    </div>
                                </div>
                             
                                <div className='col-6'>
                                    <div className='form-group  col-12'>
                                        <label>Hình đại diện</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='VideoImage' image={this.state.image}  />
                                    </div>
                                </div>
                                
                            </div>
                            <div className='row'>
                            
                            </div>
                        </div>

                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class ListVideoEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {} };
        this.modal = React.createRef();
        this.editor = { vi: React.createRef(), en: React.createRef() };
        this.image = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/component', () => {
         const list = 
         {  
            "title": "danh sách 22",
            "items": {  
               "title": "California",
               "link": "https://www.youtube.com/watch?v=BqvCD24PILw",
            }
         };
            const route = T.routeMatcher('/user/list-video/edit/:listVideoId'),
                params = route.parse(window.location.pathname);

            this.props.getListVideoItem(params.listVideoId, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    // console.log(data.item)
                    const title = T.language.parse(data.item.title, true);
                    $('#tepViTitle').val(title.vi).focus();
                    this.setState({ item : data.item });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    imageChanged = (data) => {
        this.setState({ image: data.image });
    };

    showAddVideoModal = () => {
        this.modal.current.show();
    };

    showEditVideoModal = (e, selectedVideo, index) => {
        this.modal.current.show(selectedVideo, index);
        e.preventDefault();
    };

    add = (title, link, image) => {
        this.props.addVideoIntoList(title, number);
        this.modal.current.hide();
    };

    update = (index, title, link) => {
        this.props.updateVideoInList(index, title, link);
        this.modal.current.hide();
    };

    remove = (e, index) => {
        this.props.removeVideoFromList(index);
        e.preventDefault();
    };

    swap = (e, index, isMoveUp) => {
        this.props.swapVideoInList(index, isMoveUp);
        e.preventDefault();
    }

    save = () => {
        const title = {
            vi: $('#tepViTitle').val().trim(),
        };

        if (title.vi === '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            $('#statisticViName').focus();
        }  else {
            const changes = {
                title: JSON.stringify(title),
                // description: JSON.stringify(description),
                items: this.state.item.items || [],
            };
            if (changes.items && changes.items.length == 0) changes.items = 'empty';
            this.props.updateListVideo(this.state.item._id, changes);
        }
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null, currentVideo = this.state.item || {};

        if (currentVideo && currentVideo.items && currentVideo.items.length > 0) {
            table = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '50%' }}>Tên </th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Link</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentVideo.items.map((item, index) => {
                            console.log(item)
                            const title = T.language.parse(item.title, true);
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {readOnly ? title.vi : <a href='#' onClick={e => this.showEditVideoModal(e, item, index)}>{title.vi}</a>}
                                    </td>
                                    <td>
                                        <a href={item.link} target='_blank'>{item.link}</a>
                                     </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                    </td>
                                    {readOnly ? null :
                                        <td>
                                            <div className='btn-group'>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                                    <i className='fa fa-lg fa-arrow-up' />
                                                </a>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                                    <i className='fa fa-lg fa-arrow-down' />
                                                </a>
                                                <a className='btn btn-primary' href='#' onClick={e => this.showEditVideoModal(e, item, index)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a>
                                                <a className='btn btn-danger' href='#' onClick={e => this.remove(e, index)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </a>
                                            </div>
                                        </td>
                                    }
                                </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có thống kê!</p>;
        }

        const title = currentVideo && currentVideo.title ? T.language.parse(currentVideo.title, true) : { en: '<empty>', vi: '<Trống>' };
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Danh Sách Video: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <div className='tab-content'>
                                <div id='statisticViTab' className='tab-pane fade show active'>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='tepViTitle'>Tiêu đề</label>
                                        <input className='form-control col-6' type='text' placeholder='Tiêu đề' id='tepViTitle' defaultValue={title.vi} readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                            <div className='form-group'>
                                {table}
                            </div>
                        </div>
                        {readOnly ? null :
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={this.showAddVideoModal}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm video
                                    </button>&nbsp;
                                    <button className='btn btn-primary' type='button' onClick={this.save}>
                                            <i className='fa fa-fw fa-lg fa-save' />Lưu
                                    </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <VideoModal ref={this.modal} addVideo={this.add} updateVideo={this.update} />
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, video: state.video });
const mapActionsToProps = { getListVideoItem, updateListVideo, addVideoIntoList, updateVideoInList, removeVideoFromList, swapVideoInList };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoEditPage);
