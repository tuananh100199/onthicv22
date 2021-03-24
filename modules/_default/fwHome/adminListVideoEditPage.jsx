import React from 'react';
import { connect } from 'react-redux';
import { getListVideoItem, updateListVideo } from './redux/reduxListVideo';
import { getVideoAll, createVideo, updateVideo, deleteVideo, swapVideo } from './redux/reduxVideo';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, FormCheckbox, FormImageBox, TableCell, renderTable } from 'view/component/AdminPage';

class VideoModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, link, image, active, listVideoId } = Object.assign({ title: '', link: '', active: true, image: '/img/avatar.jpg' }, item);
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.itemActive.value(active);
        this.imageBox.setData('video:' + (_id ? _id : 'new'), image || '/img/avatar.jpg');
        this.setState({ _id, listVideoId, image });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            title: this.itemTitle.value().trim(),
            link: this.itemLink.value().trim(),
            active: this.itemActive.value(),
            listVideoId: this.state.listVideoId,
        };

        if (changes.title == '') {
            T.notify('Tên video bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (changes.link == '') {
            T.notify('Link video bị trống!', 'danger');
            this.itemLink.focus();
        } else {
            this.state._id ? this.props.updateVideo(this.state._id, changes) : this.props.createVideo(changes);
            this.hide();
        }
    };

    render = () => this.renderModal({
        title: 'Thêm/Sửa Video',
        size: 'large',
        body: <div className='row'>
            <div className='col-md-8'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemLink = e} type='link' label='Link liên kết' readOnly={this.props.readOnly} />
            </div>
            <div className='col-md-4'>
                <FormImageBox ref={e => this.imageBox = e} label='Hình ảnh nền' uploadType='CarouselItemImage' image={this.state.image} readOnly={this.props.readOnly} />
                <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
            </div>
        </div>,
    });

    // render() {
    //     return (
    //         <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
    //             <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
    //                 <div className='modal-content'>
    //                     <div className='modal-header'>
    //                         <h5 className='modal-title'>Thêm/Sửa Video</h5>
    //                         <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
    //                             <span aria-hidden='true'>&times;</span>
    //                         </button>
    //                     </div>
    //                     <div className='modal-body'>
    //                         <div className='row'>
    //                             <div className='col-12'>
    //                                 <div className='form-group'>
    //                                     <label htmlFor='videoTitle'>Tiêu đề</label><br />
    //                                     <input className='form-control' id='videoTitle' type='text' placeholder='Tiêu đề' />
    //                                 </div>
    //                             </div>

    //                             <div className='col-12'>
    //                                 <div className='form-group'>
    //                                     <label htmlFor='videoLink'>Đường dẫn</label>
    //                                     <input className='form-control' id='videoLink' type='text' placeholder='Đường dẫn' />
    //                                 </div>
    //                             </div>

    //                             <div className='col-12'>
    //                                 <div className='form-group'>
    //                                     <label>Hình đại diện</label>
    //                                     <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='VideoImage' image={this.state.image} />
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>
    //                     <div className='modal-footer'>
    //                         <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
    //                         <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>
    //                             <i className='fa fa-fw fa-lg fa-save' /> Lưu
    //                         </button>
    //                     </div>
    //                 </div>
    //             </form>
    //         </div>
    //     );
    // }
}

class ListVideoEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(() => {
            const route = T.routeMatcher('/user/list-video/edit/:listVideoId'), params = route.parse(window.location.pathname);
            this.props.getListVideoItem(params.listVideoId, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    $('#listVideoTitle').val(data.item.title).focus();
                    this.props.getVideoAll({ listVideoId: data.item._id }, (items) => {
                        this.setState({ item: data.item, items });
                    })
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    showEditVideoModal = (e, video) => e.preventDefault() || this.modal.show(video);

    save = () => this.props.updateListVideo(this.state._id, {
        title: this.itemTitle.value(),
        height: parseInt(this.itemHeight.value()),
        active: this.itemActive.value(),
    });

    createItem = (e) => e.preventDefault() || this.modal.show({ listVideoId: this.state._id });

    editItem = (e, item) => e.preventDefault() || this.modal.show(item);

    swapItem = (e, item, isMoveUp) => e.preventDefault() || this.props.swapVideoItem(item._id, isMoveUp);

    deleteItem = (e, item) => e.preventDefault() || T.confirm('Xóa hình ảnh', 'Bạn có chắc bạn muốn xóa hình ảnh này?', true, isConfirm =>
        isConfirm && this.props.deleteVideoItem(item._id));

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

    swap = (e, item, index, isMoveUp, done) => {
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
            title: $('#listVideoTitle').val().trim(),
            height: $('#videoHeight').val().trim(),
        };

        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            $('#listVideoTitle').focus();
        } else {
            this.props.updateListVideo(this.state.item._id, changes);
        }
    };

    // render() {
    //     const permission = this.getUserPermission('component');
    //     const table = renderTable({
    //         getDataSource: () => this.props.component.carousel && this.props.component.carousel.selectedItem && this.props.component.carousel.selectedItem.items,
    //         renderHead: () => (
    //             <tr>
    //                 <th style={{ width: 'auto' }}>#</th>
    //                 <th style={{ width: '80%' }}>Tiêu đề</th>
    //                 <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
    //                 <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
    //                 <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
    //             </tr>),
    //         renderRow: (item, index) => (
    //             <tr key={index}>
    //                 <TableCell type='number' content={index + 1} />
    //                 <TableCell type='link' content={item.title} onClick={this.editItem} />
    //                 <TableCell type='image' content={item.image || '/img/avatar.jpg'} />
    //                 <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateCarouselItem(item._id, { active })} />
    //                 <TableCell type='buttons' content={item} permission={permission} onSwap={this.swapItem} onEdit={this.editItem} onDelete={this.deleteItem} />
    //             </tr>),
    //     });

    //     return this.renderPage({
    //         icon: 'fa fa-picture-o',
    //         title: 'Tập hình ảnh: ' + (this.state.title || '...'),
    //         breadcrumb: [<Link to='/user/component'>Thành phần giao diện</Link>, 'Tập hình ảnh'],
    //         content: (<>
    //             <div className='tile'>
    //                 <h3 className='tile-title'>Thông tin chung</h3>
    //                 <div className='tile-body row'>
    //                     <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' className='col-md-6' onChange={e => this.setState({ title: e.target.value })} readOnly={!permission.write} />
    //                     <FormTextBox ref={e => this.itemHeight = e} label='Chiều cao' className='col-md-6' readOnly={!permission.write} />
    //                     <FormCheckbox ref={e => this.itemSingle = e} label='Đơn ảnh' className='col-md-6' readOnly={!permission.write} />
    //                     <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' className='col-md-6' readOnly={!permission.write} />
    //                 </div>
    //                 {permission.write &&
    //                     <div className='tile-footer' style={{ textAlign: 'right' }}>
    //                         <button className='btn btn-primary' type='button' onClick={this.save}>
    //                             <i className='fa fa-fw fa-lg fa-save' /> Lưu
    //                         </button>
    //                     </div>}
    //             </div>

    //             <div className='tile'>
    //                 <h3 className='tile-title'>Danh sách hình ảnh</h3>
    //                 <div className='tile-body'>
    //                     {table}
    //                     {permission.write &&
    //                         <div style={{ textAlign: 'right' }}>
    //                             <button className='btn btn-success' type='button' onClick={this.createItem}>
    //                                 <i className='fa fa-fw fa-lg fa-plus'></i> Thêm
    //                             </button>
    //                         </div>}
    //                 </div>
    //             </div>

    //             <CarouselItemModal ref={e => this.modal = e} create={this.props.createCarouselItem} update={this.props.updateCarouselItem} readOnly={!permission.write} />
    //         </>),
    //         backRoute: '/user/component',
    //     });
    // }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null, currentVideo = this.state.item || {};
        if (this.state.items && this.state.items.length) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '50%' }}>Tên </th>
                            <th style={{ width: '50%', textAlign: 'center' }} nowrap='true'>Link</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
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

        const height = currentVideo.height;
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Danh Sách Video: Chỉnh sửa</h1>
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
                            <div className='row'>
                                <div className='col-md-6'>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='listVideoTitle'>Tiêu đề</label>
                                        <input className='form-control' type='text' placeholder='Tiêu đề' id='listVideoTitle' defaultValue={currentVideo.title} readOnly={readOnly} />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='videoHeight'>Chiều cao (px)</label>
                                        <input className='form-control' type='number' placeholder='Chiều cao' id='videoHeight' defaultValue={height} style={{ textAlign: 'right' }} readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='tile col-md-12'>
                        <h3 className='tile-title'>Danh sách video</h3>
                        <div className='tile-body'>
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
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
                <VideoModal ref={this.modal} addVideo={this.add} updateVideo={this.update} />
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getListVideoItem, updateListVideo, getAllVideos, createVideo, updateVideo, deleteVideo, swapVideo };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoEditPage);
