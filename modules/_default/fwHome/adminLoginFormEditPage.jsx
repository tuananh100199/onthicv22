import React from 'react';
import { connect } from 'react-redux';
import { getLoginForm, updateLoginForm } from './redux/reduxLoginForm';
import { AdminPage, FormRichTextBox, FormTextBox, FormImageBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class LoginFormEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/login-form/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getLoginForm(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const { _id, title, content, image = '/img/avatar.jpg' } = data.item;
                    this.itemTitle.focus();
                    this.itemTitle.value(title);
                    this.itemContent.value(content);
                    this.imageBox.setData('loginForm:' + _id, image);

                    this.setState({ _id, title, image });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    save = () => this.props.updateLoginForm(this.state._id, {
        title: this.itemTitle.value().trim(),
        content: this.itemContent.value(),
    });

    render() {
        const permission = this.getUserPermission('component');
        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Đăng nhập: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to='/user/component'>Thành phần giao diện</Link>, 'Đăng nhập'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-8'>
                            <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                            <FormRichTextBox ref={e => this.itemContent = e} label='Mô tả' readOnly={!permission.write} />
                        </div>
                        <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='LoginFormImage' image={this.state.image} readOnly={!permission.write} />
                    </div>
                </div>),
            backRoute: '/user/component',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getLoginForm, updateLoginForm };
export default connect(mapStateToProps, mapActionsToProps)(LoginFormEditPage);