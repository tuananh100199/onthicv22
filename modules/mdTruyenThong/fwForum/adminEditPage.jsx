import React from 'react';
import { connect } from 'react-redux';
import { updateForum, getForum, addMessage, updateMessage, deleteMessage } from './redux';
import { Link } from 'react-router-dom';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { AdminPage, AdminModal, FormTabs, FormTextBox, FormCheckbox, FormEditor, FormSelect, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

const backUrl = '/user/forum';
class MessageModal extends AdminModal {
    onShow = (item) => {
        let { _id, user, active, content, createdDate } = item || { id: null, user: null, active: false, content: '', createdDate: '' };
        this.itemMassgeActive.value(active);
        this.itemMassgeContent.value(content);
        this.setState({ _id, user, createdDate });
    }

    onSubmit = () => {
        const messages = {
            active: this.itemMassgeActive.value(),
            content: this.itemMassgeContent.value()
        };
         !this.state.user ? (messages.user = this.props.currentUser && this.props.currentUser._id) : (messages._id =  this.state._id);
         if (messages.messages == '') {
            T.notify('Nội dung bài viết không được trống!', 'danger');
            this.itemLastname.focus();
        } else {
             this.state._id ? this.props.update(this.props._id, messages, this.hide()) : this.props.addMessage(this.props._id, messages, this.hide());
        }
    }

    render = () => this.renderModal({
        title: 'Thêm bài viết',
        size: 'large',
        body: <>
            <div className='row'>
                {this.state.user ? (<>
                <div className='col-md-6'>
                    <p style={{ width: '100%' }}>Người tạo bài viết: <b>{this.state.user && (this.state.user.lastname + ' ' + this.state.user.firstname)}</b></p>
                </div>
                <div className='col-md-6'>
                    <p style={{ width: '100%' }}>Ngày tạo bài viết: <b>{new Date(this.state.createdDate).getShortText()}</b></p>
                </div>
                </>
                ) : null}
                <FormCheckbox className='col-md-6' isSwitch={true} ref={e => this.itemMassgeActive = e} label='Kích hoạt' />
                <FormEditor className='col-md-12' ref={e => this.itemMassgeContent = e} height='400px' label='Nội dung bài viết' uploadUrl='/user/upload?category=forum' />
            </div>
         </>
    });
}

const stateMapper = {
    approved: { text: 'Đã duyệt', style: { color: '#28A745' } },
    waiting: { text: 'Đang chờ duyệt', style: { color: '#1488DB' } },
    reject: { text: 'Từ chối', style: { color: '#DC3545' } },
};
const states = Object.entries(stateMapper).map(([key, value]) => ({ id: key, text: value.text }));
class ForumEditPage extends AdminPage {
    state = { title: '...', categories: [] };
    componentDidMount() {
        T.ready(backUrl, () => {
            const route = T.routeMatcher('/user/forum/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.props.getCategoryAll('forum', null, (items) => {
                if (items) {
                    this.props.getForum(_id, data => {
                        if (data) {
                            const { _id = '', user = '', title = '', categories = [], createdDate = '', state = '' } = data;
                            this.itemTitle.value(title);
                            this.itemUserCreate.value(user.lastname + ' ' + user.firstname );
                            this.itemCreatedDate.value(createdDate ? T.dateToText(createdDate) : '');
                            this.itemState.value(state);
                            const forumCategories = (items || []).map(item => ({ id: item._id, text: item.title }));

                            this.setState({ _id, title, categories: forumCategories }, () => this.itemCategories.value(categories));
                            this.itemTitle.focus();
                        } else {
                            T.notify('Lấy thông tin forum bị lỗi!', 'danger');
                        }
                    });
                } else {
                    T.notify('Lấy loại forum bị lỗi!', 'danger');
                }
            });
        });
    }

    saveInfo = () => {
        const newData = {
            title: this.itemTitle.value(),
            categories: this.itemCategories.value(),
            state: this.itemState.value(),
        };
        if (newData.title == '') {
            T.notify('Tên forum bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (newData.categories == '') {
            T.notify('Tên loại forum bị trống!', 'danger');
            this.itemCategories.focus();
        } else {
            this.props.updateForum(this.state._id, newData);
        }
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    changeActive = (active, item) => {
        const messages = {
            _id: item._id,
            active: active,
            content: item.content
        };
        this.props.updateMessage(this.state._id, messages);
    }

    deleteMessage = (e, lesson) => e.preventDefault() || T.confirm('Xóa bài viết', 'Bạn có chắc bạn muốn xóa bài viết này?', true, isConfirm =>
    isConfirm && this.props.deleteMessage(this.state._id, lesson._id));

    render() {
        const currentUser = this.props.system ? this.props.system.user : null;
        const permission = this.getUserPermission('forum'),
            readOnly = !permission.write;
       const messages = this.props.forum && this.props.forum.item ? this.props.forum.item  && this.props.forum.item.messages: null;
        const tableMessage = renderTable({
            getDataSource: () => messages || [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }}>Người tạo</th>
                    <th style={{ width: '40%' }}>Ngày tạo</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.user && (item.user.lastname + ' ' + item.user.firstname)} onClick={e => this.showMessageModal(e, item)} />
                    <TableCell type='date' content={item.createdDate} style={{ whiteSpace: 'nowrap' }} />
                    {!readOnly && <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.changeActive(active, item)} />}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.deleteMessage} />
                </tr>),
        });
        const componentInfo = (
            <div className='tile-body'>
                <div className='row'>
                    <FormTextBox type='text' className='col-md-6' ref={e => this.itemTitle = e} label='Tên bài viết' onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                    <FormSelect  className='col-md-6' ref={e => this.itemCategories = e} label='Danh mục forum' data={this.state.categories} readOnly={readOnly} />
                    <FormSelect className='col-md-4' ref={e => this.itemState = e} label='Trạng thái' data={states} />
                    <FormTextBox type='text' className='col-md-4' ref={e => this.itemUserCreate = e} label='Người tạo'  readOnly={true} />
                    <FormTextBox type='text' className='col-md-4' ref={e => this.itemCreatedDate = e} label={'Ngày tạo'} readOnly={true} />
                    {permission.write ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
                </div>
            </div>  
        );
        const componentMessage = (
            <div className='tile-body'>
                {tableMessage}
                {permission.write ? <CirclePageButton type='create' onClick={ permission.write ? e => e.preventDefault() || this.modal.show() : null} /> : null}
                <MessageModal _id={this.state._id} ref={e => this.modal = e} addMessage={this.props.addMessage} update={this.props.updateMessage} currentUser={currentUser} readOnly={!permission.write} />
            </div>);
        const tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Bài viết', component: componentMessage }];

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Forum: ' + this.state.title,
            breadcrumb: [<Link key={0} to='/user/forum'>Forum</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: backUrl,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { updateForum, getForum, getCategoryAll, addMessage, updateMessage, deleteMessage };
export default connect(mapStateToProps, mapActionsToProps)(ForumEditPage);