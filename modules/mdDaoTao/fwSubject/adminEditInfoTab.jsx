import React from 'react';
import { connect } from 'react-redux';
import { updateSubject, getSubject } from './redux';
import { Link } from 'react-router-dom';
import { FormTextBox, FormRichTextBox, FormEditor } from 'view/component/AdminPage';

class AdminEditInfo extends React.Component {
    state = { item: null };

    componentDidMount() {
        T.ready('/user/dao-tao/mon-hoc', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:_id').parse(url);
            this.props.getSubject(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/mon-hoc');
                } else if (data.item) {
                    const item = data.item;
                    this.itemTitle.value(item.title);
                    this.itemDescription.value(item.shortDescription);
                    this.itemEditor.html(item.detailDescription);
                    this.setState(data);
                    this.itemTitle.focus();
                } else {
                    this.props.history.push('/user/dao-tao/mon-hoc');
                }
            });
        });
    }

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            shortDescription: this.itemDescription.value(),
            detailDescription: this.itemEditor.html(),
        };
        this.props.updateSubject(this.state.item._id, changes)
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('subject:write');
        return <>
            <div className='tile-body'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên môn học' />
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='2' />
                <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' />
            </div>
            {readOnly ? null :
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-primary' onClick={this.save}>
                        <i className='fa fa-lg fa-save' /> Lưu
                                </button>
                </div>}
            <Link to='/user/dao-tao/mon-hoc' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { updateSubject, getSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditInfo);
