import React from 'react';
import { connect } from 'react-redux';
import { getFaq, updateFaq } from './redux';
import { AdminPage, FormTextBox, FormCheckbox, FormEditor } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class ContentEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/faq', () => {
            const route = T.routeMatcher('/user/faq/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getFaq(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/faq');
                } else if (data.item) {
                    const { _id, title,active=true, content } = data.item;
                    this.itemTitle.focus();
                    this.itemTitle.value(title);
                    this.itemActive.value(active);
                    this.editor.html(content);

                    this.setState({ _id, title });
                } else {
                    this.props.history.push('/user/faq');
                }
            });
        });
    }

    save = () => this.props.updateFaq(this.state._id, {
        title: this.itemTitle.value().trim(),
        content: this.editor.html(),
        active:this.itemActive.value()?1:0
    });

    render() {
        const permission = this.getUserPermission('faq');
        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Câu hỏi thường gặp: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to='/user/faq'>Câu hỏi thường gặp</Link>, 'Chi tiết'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        <FormTextBox className='col-md-12' ref={e => this.itemTitle = e} label='Câu hỏi' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                        <FormCheckbox className='col-md-12' ref={e => this.itemActive = e} label='Kích hoạt' readOnly={!permission.write} />
                        <FormEditor className='col-md-12' ref={e => this.editor = e} height='300px' label='Câu trả lời' uploadUrl='/user/upload?category=faq' readOnly={!permission.write} />
                    </div>
                </div>),
            backRoute: '/user/faq',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, faq: state.communication.faq });
const mapActionsToProps = { getFaq, updateFaq };
export default connect(mapStateToProps, mapActionsToProps)(ContentEditPage);