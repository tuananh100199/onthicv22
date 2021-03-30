import React from 'react';
import { connect } from 'react-redux';
import { getListVideo, updateListVideo } from './redux/reduxListVideo';
import { AdminModal, FormTextBox, TableCell, renderTable, AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class ListVideoModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => { }));
    }

    onShow = ([index, item]) => this.setState({ item, index }, () => item ? this.itemContent.value({ id: item._id, text: item.title }) : this.itemContent.value(''));

    onSubmit = () => {
        const content = this.itemContent.value(), items = this.props.item.items.map(item => item._id);
        if (!content) T.notify('Video bị trống!', 'danger');
        else {
            this.state.item ? items.splice(this.state.index, 1, content) : items.push(content);
            this.props.update(this.props.item._id, { items }, () => {
                T.notify('Cập nhật danh sách video thành công', 'success');
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Video',
        body: <FormSelect ref={e => this.itemContent = e} label='Video' data={ajaxSelectContent} readOnly={this.props.readOnly} />
    });
}

class ListVideoEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/list-video/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getListVideo(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const { _id = 'new', title = '', height } = data.item;
                    this.itemTitle.value(title);
                    this.itemHeight.value(height);
                    this.itemTitle.focus();
                    this.setState({ _id, title });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }
    edit = (e, [index, item]) => e.preventDefault() || this.modal.show([index, item]);
    remove = (e, [index, item]) => e.preventDefault() || T.confirm('Xoá video ', 'Bạn có chắc muốn xoá video khỏi danh sách này?', true, isConfirm =>
        isConfirm && this.props.updateListVideo(this.state._id, index, () => T.alert('Xoá video trong danh sách thành công!', 'error', false, 800)));
    swap = (e, [index, item], isMoveUp) => e.preventDefault() || this.props.updateListVideo(this.state._id, { index, isMoveUp }, () => T.notify('Thay đổi thứ tự video trong danh sách thành công!', 'info'));

    save = () => {
        const changes = {
            title: this.itemTitle.value().trim(),
            height: this.itemHeight.value(),
        };
        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.updateListVideo(this.state.item._id, changes);
            T.notify('Cập nhật danh sách video thành công!', 'success');
        }
    };

    render() {
        const permission = this.getUserPermission('component'),
            item = this.props.component.listVideo && this.props.component.listVideo.list && this.props.component.listVideo.list.length ? this.props.component.listVideo.list.find(item => item._id === this.state._id) : {};
        let table = renderTable({
            getDataSource: () => item && item.items || [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} />
                    <TableCell type='buttons' content={[index, item]} permission={permission} onSwap={this.swap} onEdit={this.edit} onDelete={this.remove} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Danh sách video: ' + (this.state.title || '...'),
            breadcrumb: [<Link to='/user/component'>Thành phần giao diện</Link>, 'Danh sách video'],
            content: (
                <>
                    <div className='tile'>
                        <div className='tile-body row'>
                            <FormTextBox className='col-md-6' ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                            <FormTextBox className='col-md-6' ref={e => this.itemHeight = e} label='Chiều cao' type='number' readOnly={!permission.write} />
                        </div>
                        {permission.write ?
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-primary' type='button' onClick={this.save}>
                                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                            </div> : null}
                    </div>
                    <div className='tile'>
                        <h3 className='tile-title'>Video</h3>
                        <div className='tile-body'>{table}</div>
                        {permission.write ?
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={e => this.modal.show([])}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                            </button>
                            </div> : null}
                    </div>
                    <ListVideoModal ref={e => this.modal = e} update={this.props.updateListVideo} item={item} readOnly={!permission.write} />
                </>
            ),
            backRoute: '/user/component',
        })
    }
}
const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { updateListVideo, getListVideo };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoEditPage);
