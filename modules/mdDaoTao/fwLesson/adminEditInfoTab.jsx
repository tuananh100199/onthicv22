import React from 'react';
import { connect } from 'react-redux';
import { updateLesson, getLesson } from './redux';
import { Link } from 'react-router-dom';
import { FormTextBox, FormRichTextBox, FormEditor } from 'view/component/AdminPage';

class AdminEditInfo extends React.Component {
    state = { item: null };

    componentDidMount() {
        T.ready(() => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            this.props.getLesson(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc');
                } else if (data.item) {
                    const item = data.item;
                    this.itemTitle.value(item.title);
                    this.itemDescription.value(item.shortDescription);
                    this.itemEditor.value(item.detailDescription);
                    this.setState(data);
                    this.itemTitle.focus();
                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc');
                }
            });
        });
    }

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            shortDescription: this.itemDescription.value(),
            detailDescription: this.itemEditor.value(),
        };
        this.props.updateLesson(this.state.item._id, changes);
    }

    render() {
        return (
            <div>
                <div className='tile-body'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tên bài học' />
                    <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='2' />
                    <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' />
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-primary' onClick={this.save}>
                        <i className='fa fa-lg fa-save' /> Lưu
                    </button>
                </div>
                <Link to='/user/dao-tao/bai-hoc' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { updateLesson, getLesson };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditInfo);
