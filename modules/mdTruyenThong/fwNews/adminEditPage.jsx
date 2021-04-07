import React from 'react';
import { connect } from 'react-redux';
import { updateNews, getNews, checkLink } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormImageBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';

const backUrl = '/user/news';
class NewsEditPage extends AdminPage {
    state = { title: '...', categories: [] };
    componentDidMount() {
        T.ready(backUrl, () => {
            const route = T.routeMatcher('/user/news/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.props.getNews(_id, data => {
                if (data.item && data.categories) {
                    const { _id, title, image, link, startPost, stopPost, categories, abstract, content, createdDate, view, active } = data.item;
                    this.itemTitle.value(title);
                    this.itemLink.value(link ? link : '');
                    this.itemView.value(view);
                    this.itemActive.value(active);
                    this.itemCreatedDate.value(createdDate ? T.dateToText(createdDate) : '');
                    this.itemStartPost.value(startPost);
                    this.itemStopPost.value(stopPost);
                    this.itemAbstract.value(abstract);
                    this.itemContent.html(content);
                    this.itemImage.setData('news:' + _id);

                    const newsCategories = data.categories.map(item => ({ id: item.id, text: item.text }));
                    this.setState({ _id, title, link, image, categories: newsCategories }, () => this.itemCategories.value(categories.map(item => item._id)));

                    this.itemTitle.focus();
                } else {
                    T.notify('Lấy tin tức bị lỗi!', 'danger');
                    this.props.history.push(backUrl);
                }
            });
        });
    }

    save = () => this.props.updateNews(this.state._id, {
        title: this.itemTitle.value(),
        categories: this.itemCategories.value(),
        active: this.itemActive.value(),
        link: this.itemLink.value(),
        abstract: this.itemAbstract.value(),
        content: this.itemContent.html(),
        startPost: this.itemStartPost.value(),
        stopPost: this.itemStopPost.value(),
    });

    render() {
        const permission = this.getUserPermission('news'),
            readOnly = !permission.write;
        const { _id, title } = this.state,
            linkDefaultNews = T.rootUrl + '/news/' + _id;

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Tin tức: ' + title,
            breadcrumb: [<Link to='/user/news'>Tin tức</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <FormTextBox type='text' ref={e => this.itemTitle = e} label='Tên bài viết' onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                                <div className='row'>
                                    <FormImageBox ref={e => this.itemImage = e} label='Hình ảnh' uploadType='NewsImage' image={this.state.image || '/img/avatar.jpg'} className='col-md-6' readOnly={readOnly} />
                                    <div className='col-md-6'>
                                        <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
                                        <FormTextBox type='number' ref={e => this.itemView = e} label={'Lượt xem'} readOnly={true} />
                                    </div>
                                </div>
                                <FormSelect ref={e => this.itemCategories = e} label='Danh mục bài viết' data={this.state.categories} multiple={true} readOnly={readOnly} />
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Link</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label style={{ display: 'flex' }}>Link mặc định:&nbsp;
                                        <a href={linkDefaultNews} style={{ fontWeight: 'bold' }} target='_blank'>{linkDefaultNews}</a>
                                    </label>
                                </div>
                                <FormTextBox type='text' ref={e => this.itemLink = e} label='Link truyền thông' onChange={e => this.setState({ link: e.target.value })} readOnly={readOnly} />
                                {this.state.link ? <>URL: <a href={T.rootUrl + '/tintuc/' + this.state.link} style={{ fontWeight: 'bold' }} target='_blank'>{T.rootUrl + '/tintuc/' + this.state.link}</a></> : ''}
                            </div>
                            {readOnly ? '' :
                                <div className='tile-footer'>
                                    <button className='btn btn-danger' type='button' onClick={() => this.props.checkLink(_id, this.itemLink.value().trim())}>
                                        <i className='fa fa-fw fa-lg fa-check-circle' />Kiểm tra link
                                    </button>
                                </div>}
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Thời gian</h3>
                            <div className='tile-body'>
                                <FormTextBox type='text' ref={e => this.itemCreatedDate = e} label={'Ngày tạo'} readOnly={true} />
                                <FormDatePicker type='time' ref={e => this.itemStartPost = e} label='Ngày bắt đầu đăng bài viết' readOnly={readOnly} />
                                <FormDatePicker type='time' ref={e => this.itemStopPost = e} label='Ngày kết thúc đăng bài viết' readOnly={readOnly} />
                            </div>
                        </div>
                    </div>

                    <div className='col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Nội dung</h3>
                            <div className='tile-body'>
                                <FormRichTextBox ref={e => this.itemAbstract = e} label='Tóm tắt bài viết' readOnly={readOnly} style={{ minHeight: '100px' }} />
                                <FormEditor ref={e => this.itemContent = e} height='400px' label='Nội dung bài viết' uploadUrl='/user/upload?category=news' readOnly={readOnly} />
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            backRoute: backUrl,
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { updateNews, getNews, checkLink };
export default connect(mapStateToProps, mapActionsToProps)(NewsEditPage);