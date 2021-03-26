import React from 'react';
import { connect } from 'react-redux';
import { getListContent, updateListContent } from './redux/reduxListContent';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, FormImageBox, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { ajaxSelectContent } from 'modules/_default/fwHome/redux/reduxContent';
import { Link } from 'react-router-dom';

class ListContentModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => { }));
    }

    onShow = ([index, item]) => this.setState({ item, index }, () => item ? this.itemContent.value({ id: item._id, text: item.title }) : this.itemContent.value(''));

    onSubmit = () => {
        const content = this.itemContent.value(), items = this.props.item.items.map(item => item._id);
        if (!content) T.notify('Bài viết bị trống!', 'danger');
        else {
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
        console.log('start')
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/list-content/edit/:_id'),
                params = route.parse(window.location.pathname);
            console.log('start1')
            this.props.getListContent(params._id, data => {
                console.log('ts')
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    console.log()
                    const { _id = 'new', title = '', image = '/img/avatar.jpg', abstract } = data.item;
                    this.itemTitle.value(title);
                    this.itemAbstract.value(abstract);
                    this.imageBox.setData('listContent:' + _id, image);
                    this.itemTitle.focus();
                    this.setState({ _id, title, image });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }
    edit = (e, [index, item]) => e.preventDefault() || this.modal.show([index, item]);
    remove = (e, [index, item]) => e.preventDefault() || T.confirm('Xoá bài viết ', 'Bạn có chắc muốn xoá bài viết khỏi danh sách này?', true, isConfirm =>
        isConfirm && this.props.updateListContent(this.state._id, index, () => T.alert('Xoá bài viết trong danh sách thành công!', 'error', false, 800)));
    swap = (e, [index, item], isMoveUp) => e.preventDefault() || this.props.updateListContent(this.state._id, { index, isMoveUp }, () => T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info'));

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
        let item;
        item = this.props.component.listContent ? this.props.component.listContent : [];
        console.log('item', item)
        item = item.find(item => item._id === this.state._id)
        console.log('d', this.props.component.listContent)
        // item = item.find(item => item._id === this.state._id);
        console.log('d', item)
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
                    <TableCell type='buttons' content={[index, item]} permission={permission} onSwap={this.swap} onEdit={this.edit} onDelete={this.remove} />
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
                            <button className='btn btn-success' type='button' onClick={e => this.modal.show([])}>
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
