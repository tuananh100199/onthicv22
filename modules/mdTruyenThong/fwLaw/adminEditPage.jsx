import React from 'react';
import { connect } from 'react-redux';
import { getLaw, updateLaw } from './redux';
import { AdminPage, FormTextBox, FormCheckbox, FormEditor, FormRichTextBox, FormImageBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class ContentEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/law', () => {
            const route = T.routeMatcher('/user/law/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getLaw(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/law');
                } else if (data.item) {
                    const { _id, title,active=true, content,abstract='',image } = data.item;
                    this.itemTitle.focus();
                    this.itemTitle.value(title);
                    this.itemAbstract.value(abstract);
                    this.itemActive.value(active);
                    this.editor.html(content);
                    this.itemImage.setData('law:' + _id);
                    this.setState({ _id, title, image });
                } else {
                    this.props.history.push('/user/law');
                }
            });
        });
    }

    save = () => this.props.updateLaw(this.state._id, {
        title: this.itemTitle.value().trim(),
        content: this.editor.html(),
        active:this.itemActive.value()?1:0,
        abstract: this.itemAbstract.value(),
    });

    render() {
        const permission = this.getUserPermission('law');
        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Quy định pháp luật: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to='/user/law'>Quy định pháp luật</Link>, 'Chi tiết'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className="col-md-8">
                        <FormTextBox className='col-md-12' ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                        <FormCheckbox className='col-md-12' ref={e => this.itemActive = e} label='Kích hoạt' readOnly={!permission.write} />
                        </div>
                        <div className="col-md-4">
                        <FormImageBox ref={e => this.itemImage = e} label='Hình ảnh' uploadType='LawImage' image={this.state.image || '/img/avatar.jpg'} readOnly={!permission.write} />
                        </div>
                        <FormRichTextBox className='col-md-12' ref={e => this.itemAbstract = e} rows={2} label='Tóm tắt' readOnly={!permission.write} />
                        <FormEditor className='col-md-12' ref={e => this.editor = e} height='300px' label='Nội dung' uploadUrl='/user/upload?category=law' readOnly={!permission.write} />
                    </div>
                </div>),
            backRoute: '/user/law',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, law: state.communication.law });
const mapActionsToProps = { getLaw, updateLaw };
export default connect(mapStateToProps, mapActionsToProps)(ContentEditPage);