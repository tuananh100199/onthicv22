import React from 'react';
import { connect } from 'react-redux';
import { getListContent, updateListContent } from './redux/reduxListContent';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, CirclePageButton, FormImageBox, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { ajaxSelectContent } from 'modules/_default/fwHome/redux/reduxContent';
import { Link } from 'react-router-dom';

class ListContentModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => { }));
    }

    onShow = (item, index) => this.setState({ item, index }, () => item ? this.itemContent.value(item.title) : this.itemContent.value(''));

    onSubmit = () => {
        const content = this.itemContent.value(), items = this.props.item.items;
        if (content == '') {
            T.notify('Bài viết bị trống!', 'danger');
            this.itemContent.focus();
        } else {
            this.state.item ? items.splice(this.state.index, 1, content) : items.push(content);
            this.props.update(this.props.item._id, { items }, () => {
                T.notify('Cập nhật danh sách bài viết thành công', 'success');
                this.hide();
            });
        }
    }
    render = () => this.renderModal({
        title: 'Bài viết',
        body: <FormSelect ref={e => this.itemContent = e} label='Bài viết' data={ajaxSelectContent} readOnly={this.props.readOnly} />
    });
}

class ListContentEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/list-content/edit/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getListContent(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const { _id = 'new', title = '', image = '/img/avatar.jpg', abstract, items } = data.item;
                    this.itemTitle.value(title);
                    this.itemAbstract.value(abstract);
                    this.imageBox.setData('listContent:' + _id, image);
                    this.itemTitle.focus();
                    this.setState({ _id, title, image, items });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    remove = (e, index) => e.preventDefault() || T.confirm('Xoá bài viết ', 'Bạn có chắc muốn xoá bài viết khỏi danh sách này?', true, isConfirm => {
        if (isConfirm) {
            const items = this.props.component.listContent.find(item => item._id == this.state._id).items.map(item => item._id) || [];
            items.splice(index, 1);
            if (items.length == 0) items = 'empty';
            this.props.updateListContent(item._id, { items }, () => {
                T.alert('Xoá bài viết trong danh sách thành công!', 'error', false, 800);
            });
        }
    })

    swapVideo = (e, video, isMoveUp) => e.preventDefault() || this.props.swapLessonVideo(this.state._id, video._id, isMoveUp);
    swap = (e, index, isMoveUp) => {
        const items = this.props.component.listContent.find(item => item._id == this.state._id).map(item => item._id) || [];
        // let items = item.items || [];
        if (items.length == 1) {
            T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
                } else {
                    const temp = items[index - 1], changes = {};

                    items[index - 1] = items[index];
                    items[index] = temp;

                    changes.items = items;
                    this.props.updateListContent(item._id, changes, () => {
                        T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
                    });
                }
            } else {
                if (index == items.length - 1) {
                    T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
                } else {
                    const temp = items[index + 1], changes = {};

                    items[index + 1] = items[index];
                    items[index] = temp;

                    changes.items = items;
                    this.props.updateListContent(item._id, changes, () => {
                        T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
                    });
                }
            }
        }
        e.preventDefault();
    };

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            abstract: this.itemAbstract.value()
        };
        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.updateListContent(this.state._id, changes, () => {
                T.notify('Cập nhật danh sách bài viết thành công!', 'success');
            });
        }
    }

    render() {
        const permission = this.getUserPermission('component');
        let item = this.props.component.listContent || [];
        item = item && item.find(item => item._id === this.state._id);
        const table = renderTable({
            getDataSource: () => item && item.items || [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={`/user/content/edit/${item._id}`} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={e => this.swap(e, index, isMoveUp)} onEdit={() => this.modal.show(item, index)} onDelete={e => this.remove(e, index)} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Danh sách bài viết: ' + (this.state.title || '...'),
            breadcrumb: [<Link to='/user/component'>Thành phần giao diện</Link>, 'Danh sách bài viết'],
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-9'>
                            <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                            <FormRichTextBox ref={e => this.itemAbstract = e} label='Mô tả ngắn' readOnly={!permission.write} />
                        </div>
                        <FormImageBox ref={e => this.imageBox = e} className='col-md-3' label='Hình đại diện' uploadType='ListContentImage' image={this.state.image} readOnly={!permission.write} />
                    </div>
                    {permission.write ?
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div> : null}
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Bài viết</h3>
                    <div className='tile-body'>{table}</div>
                    {permission.write ?
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={e => this.modal.show()}>
                                <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                            </button>
                        </div> : null}
                </div>
                <ListContentModal ref={e => this.modal = e} readOnly={!permission.write} update={this.props.updateListContent} item={item} />
            </>,
            backRoute: '/user/component',
        });
    }
}
const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { updateListContent, getListContent };
export default connect(mapStateToProps, mapActionsToProps)(ListContentEditPage);
