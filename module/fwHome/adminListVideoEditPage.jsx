import React from 'react';
import { connect } from 'react-redux';
import { getListVideoItem, updateListVideo, addVideoIntoList, updateVideoInList, removeVideoFromList, swapVideoInList } from './redux/reduxListVideo.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';

const texts = {
    vi: {
        getListVideoError: 'Lấy danh sách video bị lỗi 1!',
    },
}
const language = T.language(texts);

class ListVideoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.modal = React.createRef();
        this.editor = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#sttTitle').focus() )
        }, 250));
    }

    show = (selectedItem, index) => {
        console.log('show các trường mới nhập');

        let { title, description, link, image } = selectedItem ? selectedItem : { title: JSON.stringify({ vi: '' }), description: JSON.stringify({ vi: '' }),link: JSON.stringify({vi: ''}),image};
        title = T.language.parse(title, true);
        description = T.language.parse(description, true);
        link = T.language.parse(link, true);
        $('#sttViTitle').val(title.vi);
        $('#videoDescription').val(description.vi);
        $('#videoLink').val(link.vi);
        $(this.btnSave.current).data('isNewMember', selectedItem == null).data('index', index);

        $(this.modal.current).modal('show');
    }
    hide = () => {
        $(this.modal.current).modal('hide');
    }

    save = (event) => {
        console.log('lưu');
        const btnSave = $(this.btnSave.current),
            isNewMember = btnSave.data('isNewMember'),
            index = btnSave.data('index'),
            title = {
                vi: $('#sttViTitle').val(),
            },
            description = { 
               vi: $('#videoDescription').val(),
            },
            link = { 
                vi: $('#videoLink').val(),
             };
        if (isNewMember) {
            // console.log(this.props);
            this.props.addListVideo(JSON.stringify(title),JSON.stringify(description),JSON.stringify(link));
        } else {
            this.props.updateListVideo(index,JSON.stringify(title),JSON.stringify(description),JSON.stringify(link));
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='container-fluid row'>
                                <h5 className='modal-title col-6'>Thêm/Chỉnh sửa video</h5>
                            </div>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='container-fluid row'>
                                <div className='col-6'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='sttViTitle'>Tên</label><br />
                                        <input className='form-control' id='sttViTitle' type='text' placeholder='Tên' />
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='videoLink'>Link</label>
                                        <input className='form-control' id='videoLink' type='text' placeholder='Link'/>
                                    </div>
                                </div>
                                <div className='col-6'>
                                    <div className='form-group col-12'>
                                        <label>Hình đại diện</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='VideoImage' image={this.state.image}  />
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='videoDescription'>Mô tả</label>
                                        <input className='form-control' id='videoDescription' type='text' style={{ height: '100px' }}/>
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
        this.state = { image: '' };
        this.modal = React.createRef();
        this.editor = { vi: React.createRef(), en: React.createRef() };
        this.image = React.createRef();
        this.listVideoId = null;
    }
    

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/list-video/edit/:listVideoId'),
                params = route.parse(window.location.pathname);

            this.props.getListVideoItem(params.listVideoId, data => {
                if (data.error) {
                    T.notify(language.getListVideoError, 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {

                    this.listVideoId = params.listVideoId;
                    const title = T.language.parse(data.item.title, true),
                    link = T.language.parse(data.item.items.link, true),
                    description = T.language.parse(data.item.items.description, true);
                    $('#tepViTitle').val(title.vi).focus();
                    $('#videoLink').val(link).focus();
                    $('#videoDescription').val(description).focus();
                    this.setState({ image: data.item.image ? data.item.image : '' });
                } else {
                    this.props.history.push('/user/component');
                }
                // console.log(this.props);
            });
        });
    }

    imageChanged = (data) => {
        this.setState({ image: data.image });
    };

    showAddListVideoModal = () => {
        this.modal.current.show();
    };

    showEditListVideoModal = (e, selectedListVideo, index) => {
        this.modal.current.show(selectedListVideo, index);
        e.preventDefault();
    };

    add = (title, number) => {
        this.props.addVideoIntoList(title, number);
        this.modal.current.hide();
    };

    update = (index, title, number) => {
        this.props.updateVideoInList(index, title, number);
        this.modal.current.hide();
    };

    remove = (e, index) => {
        this.props.updateVideoInList(index);
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
        const description = {
            vi: $('#videoDescription').val().trim(),
        };
        const link = {
            vi: $('#videoLink').val().trim(),
        }

        if (title.vi === '') {
            T.notify('Tên nhóm danh sách video bị trống!', 'danger');
            $('#listVideoViName').focus();
        }
        else {
            const changes = {
                title: JSON.stringify(title),
                description: JSON.stringify(description),
                link: JSON.stringify(link),
                image: this.state.image,
                items: this.props.listVideo.items,
              
            };
            // console.log(this.props);
            if (changes.items && changes.items.length == 0) changes.items = 'empty';
            this.props.updateListVideo(this.props.listVideo.items._id, changes);
        }
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null,
        currentListVideo = this.props.listVideoId  ? this.props.listVideoId : null;
        // console.log(currentListVideo);
        if (currentListVideo && currentListVideo.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '50%' }}>Tên</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Link</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mô tả</th>
                            {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentListVideo.items.map((item, index) => {
                            const title = T.language.parse(item.title, true);
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {readOnly ? title.vi : <a href='#' onClick={e => this.showEditListVideoModal(e, item, index)}>{title.vi}</a>}
                                    </td>
                                    <td>
                                        <a href={item.link} target='_blank'>{item.link}</a>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item.description}
                                    </td>
                                    {readOnly ? null :
                                        <td style={{ textAlign: 'center' }}>
                                            <div className='btn-group'>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                                    <i className='fa fa-lg fa-arrow-up' />
                                                </a>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                                    <i className='fa fa-lg fa-arrow-down' />
                                                </a>
                                                <a className='btn btn-primary' href='#' onClick={e => this.showEditListVideoModal(e, item, index)}>
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
            table = <p>Không có danh sách video!</p>;
        }

        const title = currentListVideo && currentListVideo.title ? T.language.parse(currentListVideo.title, true) : { en: '<empty>', vi: '<Trống>' };
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Danh sách video: Chỉnh sửa</h1>
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
                                <div id='listVideoViTab' className='tab-pane fade show active'>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='tepViTitle'><h5>Tiêu đề</h5></label>
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
                                        <button className='btn btn-info' type='button' onClick={this.showAddListVideoModal}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm video vào danh sách
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

                <ListVideoModal ref={this.modal} addListVideo={this.add} updateListVideo={this.update} />
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, listVideo: state.listVideo });
const mapActionsToProps = { getListVideoItem, updateListVideo, addVideoIntoList, updateVideoInList, removeVideoFromList, swapVideoInList };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoEditPage);
