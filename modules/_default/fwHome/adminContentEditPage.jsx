import React from 'react';
import { connect } from 'react-redux';
import { getContent, updateContent } from './redux/reduxContent';
import { AdminPage, FormRichTextBox, FormTextBox, FormCheckbox, FormEditor, FormImageBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class ContentEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/content/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getContent(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const { _id, title, titleVisible = true, abstract, content, image = '/img/avatar.jpg' } = data.item;
                    this.itemTitle.focus();
                    this.itemTitle.value(title);
                    this.itemAbstract.value(abstract);
                    this.itemTitleVisible.value(titleVisible);
                    this.imageBox.setData('content:' + _id, image);
                    this.editor.html(content);

                    this.setState({ _id, title, image });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    save = () => this.props.updateContent(this.state._id, {
        title: this.itemTitle.value().trim(),
        titleVisible: this.itemTitleVisible.value() ? 1 : 0,
        abstract: this.itemAbstract.value(),
        content: this.editor.html(),
    });

    render() {
        const permission = this.getUserPermission('component');
        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Bài viết: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to='/user/component'>Thành phần giao diện</Link>, 'Bài viết'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-8'>
                            <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                            <FormCheckbox ref={e => this.itemTitleVisible = e} label='Hiển thị tiêu đề' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.itemAbstract = e} label='Mô tả ngắn' readOnly={!permission.write} />
                        </div>
                        <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='ContentImage' image={this.state.image} readOnly={!permission.write} />
                        <FormEditor className='col-md-12' ref={e => this.editor = e} height='400px' label='Nội dung' uploadUrl='/user/upload?category=content' readOnly={!permission.write} />
                    </div>
                </div>),
            backRoute: '/user/component',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getContent, updateContent };
export default connect(mapStateToProps, mapActionsToProps)(ContentEditPage);