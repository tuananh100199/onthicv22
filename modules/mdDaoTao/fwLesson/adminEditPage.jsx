import React from 'react';
import { connect } from 'react-redux';
import { updateLesson, getLesson } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, FormTextBox, FormRichTextBox, FormEditor, BackButton } from 'view/component/AdminPage';
import AdminEditLessonQuestion from './adminEditQuestionTab';
import AdminEditLessonVideo from './adminEditVideoTab';

const adminPageLink = '/user/dao-tao/bai-hoc';
class adminEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready(adminPageLink, () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            this.props.getLesson(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push(adminPageLink);
                } else if (data.item) {
                    const { _id, title, shortDescription, detailDescription } = data.item;
                    this.itemTitle.value(title);
                    this.itemDescription.value(shortDescription);
                    this.itemEditor.html(detailDescription);

                    this.setState({ _id, title });
                    this.itemTitle.focus();
                } else {
                    this.props.history.push(adminPageLink);
                }
            });
        });
    }

    saveInfo = () => {
        const changes = {
            title: this.itemTitle.value(),
            shortDescription: this.itemDescription.value(),
            detailDescription: this.itemEditor.html(),
        };
        this.props.updateLesson(this.state._id, changes);
    }

    render() {
        const permission = this.getUserPermission('lesson'),
            readOnly = !permission.write;

        const componentInfo = <>
            <div className='tile-body'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên bài học' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='2' readOnly={readOnly} />
                <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' readOnly={readOnly} />
            </div>
            <div></div>
            <div style={{ textAlign: 'right' }}>
                <button type='button' className='btn btn-primary' onClick={this.saveInfo}>
                    <i className='fa fa-lg fa-save' /> Lưu
                </button>
            </div>
        </>;

        const tabs = [
            { title: 'Thông tin chung', component: componentInfo },
            { title: 'Video bài giảng', component: <AdminEditLessonVideo readOnly={readOnly} history={this.props.history} /> },
            { title: 'Câu hỏi', component: <AdminEditLessonQuestion readOnly={readOnly} history={this.props.history} /> },
        ];

        const renderData = {
            icon: 'fa fa-book',
            title: 'Bài học: ' + this.state.title,
            breadcrumb: [<Link to={adminPageLink}>Bài học</Link>, 'Chỉnh sửa'],
            content: <>
                <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />
                <BackButton to={adminPageLink} />
            </>,
        };
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateLesson, getLesson };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);