import React from 'react';
import { connect } from 'react-redux';
import { getListVideoItem, updateListVideo } from './redux/reduxListVideo';
import { getAllVideos, createVideo, updateVideo, deleteVideo, swapVideo } from './redux/reduxVideo';
import { AdminModal, FormTextBox, TableCell, renderTable, AdminPage, FormEditor, FormImageBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class VideoModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }
    
    onShow = (video) => {
        let { _id, title, link, image, content } = video ? video : { _id: null, title: '', link: '', image: '', content: '' };
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.itemEditor.html(content);
        this.imageBox.setData('video:' + (_id ? _id : 'new'));
        this.setState({ _id: _id, image: image });
    }
    
    onSubmit = () => {
        const data = {
            title: this.itemTitle.value().trim(),
            link: this.itemLink.value().trim(),
            content: this.itemEditor.html(),
        };
        if (data.title == '') {
            T.notify('Tiêu đề video bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.link == '') {
            T.notify('Link video bị trống!', 'danger');
            this.itemLink.focus();
        } else if (data.content == '') {
            T.notify('Nội dung video bị trống!', 'danger');
            this.itemEditor.focus();
        } else {
            this.state._id ? this.props.updateVideo(this.state._id, data) : this.props.createVideo(data);
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Thêm/Sửa Video',
        size: 'large',
        body: <>
            <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' />
                    <FormTextBox ref={e => this.itemLink = e} label='Đường dẫn' />
                </div>
                <div className='col-md-4'>
                    <FormImageBox ref={e => this.imageBox = e} label='Hình đại diện' uploadType='VideoImage' image={this.state.image} />
                </div>
            </div>
            <FormEditor ref={e => this.itemEditor = e} label='Nội dung video' />
        </>
    })
}

class ListVideoEditPage extends AdminPage {
    state = { item: {}, items: [] };
    
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/list-video/edit/:listVideoId'), params = route.parse(window.location.pathname);
            this.props.getListVideoItem(params.listVideoId, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    this.itemTitle.focus();
                    this.itemTitle.value(data.item.title);
                    this.itemHeight.value(data.item.height);
                    this.props.getAllVideos({ listVideoId: data.item._id }, (items) => {
                        this.setState({ item: data.item, items });
                    })
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    showVideoModal = (e, selectedVideo) => {
        this.modal.show(selectedVideo);
        e.preventDefault();
    }

    add = (newData, done) => {
        newData.listVideoId = this.state.item._id;
        this.props.createVideo(newData, newVideo => {
            let items = this.state.items;
            items.push(newVideo);
            this.setState({ items }, done);
        });
    }

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
    }

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
    }

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
    }

    save = () => {
        const changes = {
            title: this.itemTitle.value().trim(),
            height: this.itemHeight.value().trim(),
        };

        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.updateListVideo(this.state.item._id, changes);
        }
    };

    render() {
        const permission = this.getUserPermission('component');
        let table = renderTable({
            getDataSource: () => this.state.items,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%' }}>Tên </th>
                    <th style={{ width: '50%', textAlign: 'center' }} nowrap='true'>Link</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    {permission.write && <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    {permission.write ? (
                        <TableCell type='link' content={item.title} onClick={e => this.showVideoModal(e, item)} />
                    ) : (
                        <TableCell type='text' content={item.title} />
                    )}
    
                    <TableCell type='link' content={item.link} url={item.link} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} />
                    <TableCell content={(
                        <div className='btn-group'>
                            {permission.write ?
                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, index, true)}>
                                    <i className='fa fa-lg fa-arrow-up' />
                                </a> : null}
                            {permission.write ?
                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, index, false)}>
                                    <i className='fa fa-lg fa-arrow-down' />
                                </a> : null}
                            {permission.write ?
                                <a className='btn btn-primary' href='#' onClick={e => this.showVideoModal(e, item)}>
                                    <i className='fa fa-lg fa-edit' />
                                </a> : null}
                            {permission.delete ?
                                <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item._id)}>
                                    <i className='fa fa-lg fa-trash' />
                                </a> : null}
                        </div>)} />
                </tr>
            )
        });
        
        return this.renderPage({
            icon: 'fa-bar-chart',
            title: 'Danh Sách Video: Chỉnh sửa',
            breadcrumb: [<Link to='/user/component'>Thành phần giao diện</Link>, 'Chỉnh sửa'],
            content: (
                <>
                    <div className='row'>
                        <div className='tile col-md-12'>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={!permission.write} />
                                    </div>
                                    <div className='col-md-6'>
                                        <FormTextBox ref={e => this.itemHeight = e} label='Chiều cao' type='number' readOnly={!permission.write} />
                                    </div>
                                </div>
                            </div>
                        </div>
        
                        <div className='tile col-md-12'>
                            <h3 className='tile-title'>Danh sách video</h3>
                            <div className='tile-body'>
                                {table}
                            </div>
                            {permission.write &&
                                <div className='tile-footer'>
                                    <div className='row'>
                                        <div className='col-md-12' style={{ textAlign: 'right' }}>
                                            <button className='btn btn-info' type='button' onClick={this.showVideoModal}>
                                                <i className='fa fa-fw fa-lg fa-plus' />Thêm video
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <VideoModal ref={e => this.modal = e} createVideo={this.add} updateVideo={this.update} readOnly={!permission.write}/>
                </>
            ),
            backRoute: '/user/component',
            onSave: permission.write ? this.save : null,
        })
    }
}
const mapStateToProps = state => ({ system: state.system, video: state.video });
const mapActionsToProps = { getListVideoItem, updateListVideo, getAllVideos, createVideo, updateVideo, deleteVideo, swapVideo };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoEditPage);
