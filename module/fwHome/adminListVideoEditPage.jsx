import React from 'react';
import { connect } from 'react-redux';
import { getListVideoItem, updateListVideo } from './redux/reduxListVideo.jsx';
import { getAllVideos, createVideo, updateVideo, deleteVideo ,swapVideo} from './redux/reduxVideo.jsx';
import { Link } from 'react-router-dom';
import ImageBox from '../../view/component/ImageBox.jsx';

class VideoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}};
        this.modal = React.createRef();
        this.imageBox = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#sttTitle').focus())
        }, 250));
    }

    show = (selectedItem) => {
        let {  _id, title, link, image } = selectedItem ? selectedItem : { _id: null, title: '', link: '', image: '' };
        $('#videoTitle').val(title);
        $('#videoLink').val(link);
        this.imageBox.current.setData('video:' + (_id ? _id : 'new'), image || '/img/avatar.jpg');
        this.setState({ item: selectedItem })
        
        $(this.modal.current).modal('show');
    }
    
    save = (event) => {
        const changes = {
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
            if (this.state.item && this.state.item._id ) {
                this.props.updateVideo(this.state.item._id, changes, () => {
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
    
    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thêm/Sửa Video</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='row'>
                                <div className='col-12'>
                                    <div className='form-group'>
                                        <label htmlFor='videoTitle'>Tiêu đề</label><br />
                                        <input className='form-control' id='videoTitle' type='text' placeholder='Tiêu đề' />
                                    </div>
                                </div>

                                <div className='col-12'>
                                    <div className='form-group'>
                                        <label htmlFor='videoLink'>Đường dẫn</label>
                                        <input className='form-control' id='videoLink' type='text' placeholder='Đường dẫn' />
                                    </div>
                                </div>
                                
                                <div className='col-12'>
                                    <div className='form-group'>
                                        <label>Hình đại diện</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='VideoImage' image={this.state.image}  />
                                    </div>
                                </div>
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
        this.state = { item: {}, items: [] };
        this.modal = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/list-video/edit/:listVideoId'), params = route.parse(window.location.pathname);
            this.props.getListVideoItem(params.listVideoId, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    $('#tepViTitle').val(data.item.title).focus();
                    this.props.getAllVideos({ listVideoId : data.item._id }, (items) => {
                        this.setState({ item : data.item, items });
                    })
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    showAddVideoModal = (e) => {
        this.modal.current.show();
        e.preventDefault();
    };

    showEditVideoModal = (e, selectedVideo) => {
        this.modal.current.show(selectedVideo);
        e.preventDefault();
    };

    add = (newData, done) => {
        newData.listVideoId = this.state.item._id;
        this.props.createVideo(newData, newVideo => {
            let items = this.state.items;
            items.push(newVideo);
            this.setState({ items }, done);
        });
    };

    update = (_id, changes, done) => {
        this.props.updateVideo(_id, changes, editedVideo => {
            let items = this.state.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i]._id == _id) {
                    items.splice(i, 1, editedVideo);
                }
            }
            
            this.setState({ items }, done);
        });
    };

    remove = (e, _id) => {
        T.confirm('Xoá video', 'Bạn có chắc muốn xoá video này?', 'info', isConfirm => {
            isConfirm && this.props.deleteVideo(_id, () => {
                let items = this.state.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i]._id == _id) {
                        items.splice(i, 1);
                    }
                }
                this.setState({ items });
            });
        })
        e.preventDefault();
    };
    
    swap = (e,item, index, isMoveUp,done) => {
        this.props.swapVideo(item._id, isMoveUp, () => {
            if (this.state && this.state.item) {
                let items = this.state.items;
                const video = items[index];
                if (isMoveUp && index > 0) {
                    items.splice(index, 1);
                    items.splice(index - 1, 0, video);
                } else if (!isMoveUp && index < items.length - 1) {
                    items.splice(index, 1);
                   items.splice(index + 1, 0, video);
                }
            this.setState({ items }, done);
            }
        })
        
        e.preventDefault();
    };

    save = () => {
        const changes = {
            title: $('#tepViTitle').val().trim(),
            height: $('#crsHeight').val().trim(),
        };

        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            $('#tepViTitle').focus();
        }  else {
            this.props.updateListVideo(this.state.item._id, changes);
        }
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null, currentVideo = this.state.item || {};
        if (this.state.items && this.state.items.length) {
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
                        {this.state.items.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {readOnly ? item.title : <a href='#' onClick={e => this.showEditVideoModal(e, item)}>{item.title}</a>}
                                    </td>
                                    <td>
                                        <a href={item.link} target='_blank'>{item.link}</a>
                                     </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <img src={item.image ? item.image : '/img/avatar.jpg'} alt='avatar' style={{ height: '32px' }} />
                                    </td>
                                    {readOnly ? null :
                                        <td>
                                            <div className='btn-group'>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, index, true)}>
                                                    <i className='fa fa-lg fa-arrow-up' />
                                                </a>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, index, false)}>
                                                    <i className='fa fa-lg fa-arrow-down' />
                                                </a>
                                                <a className='btn btn-primary' href='#' onClick={e => this.showEditVideoModal(e, item)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a>
                                                <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item._id)}>
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
            table = <p>Không có danh sách các video!</p>;
        }

        const title = currentVideo && currentVideo.title ? T.language.parse(currentVideo.title, true) : '<Trống>' ;
        const height = currentVideo.height ;
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Danh Sách Video: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title }} />
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
                                <div className='row'>
                                    <div className="col-md-6">
                                        <div className='form-group mt-3'>
                                            <label className='control-label' htmlFor='tepViTitle'>Tiêu đề</label>
                                            <input className='form-control col-6' type='text' placeholder='Tiêu đề' id='tepViTitle' defaultValue={title} readOnly={readOnly} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className='form-group mt-3'>
                                            <label className='control-label'>Chiều cao</label>
                                            <input className='form-control' type='number' placeholder='Chiều cao' id='crsHeight' defaultValue={height} style={{ textAlign: 'right' }} readOnly={readOnly} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mb-3"  style={{ textAlign: 'right' }}>
                                    <button className='btn btn-primary btn-circle' style={{ padding: '0 12px' }} type='button' onClick={this.save}>
                                            <i className='fa fa-fw fa-lg fa-save' />
                                    </button>
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
                                        <button className='btn btn-info btn-circle'  type='button' onClick={this.showAddVideoModal}>
                                            <i className='fa fa-fw fa-lg fa-plus' style={{ paddingRight: "10px" }} />
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
const mapActionsToProps = { getListVideoItem, updateListVideo, getAllVideos, createVideo, updateVideo, deleteVideo,swapVideo };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoEditPage);
