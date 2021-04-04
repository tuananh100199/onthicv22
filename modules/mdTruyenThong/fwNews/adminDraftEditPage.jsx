import React from 'react';
import { connect } from 'react-redux';
import { getDraftNews, checkLink, createDraftNews, updateDraftNews } from './redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';

class DraftNewsEditPage extends React.Component {
    state = { item: null, draft: true, draftId: '' };
    componentDidMount() {
        T.ready('/user/news/draft', () => {
            this.getData();
            $('#neNewsTitle').focus();
            $('#neNewsCategories').select2();
            $('#neNewsStartPost').datetimepicker(T.dateFormat);
            $('#neNewsStopPost').datetimepicker(T.dateFormat);
        });
    }
    getData = () => {
        const route = T.routeMatcher('/user/news/draft/edit/:newsId'),
            IdNews = route.parse(window.location.pathname).newsId;
        this.setState({ draftId: IdNews })
        this.props.getDraftNews(IdNews, data => {
            if (data.error) {
                T.notify('Lấy bản nháp tin tức bị lỗi!', 'danger');
                this.props.history.push('/user/news/draft');
            } else if (data.categories && data.item) {
                const contentNews = JSON.parse(data.item.documentJson);
                let categories = data.categories.map(item => ({ id: item.id, text: item.text }));
                $('#neNewsCategories').select2({ data: categories }).val(contentNews.categories).trigger('change');
                const neNewsStartPost = $('#neNewsStartPost').datetimepicker(T.dateFormat);
                const neNewsStopPost = $('#neNewsStopPost').datetimepicker(T.dateFormat);
                if (contentNews.startPost)
                    neNewsStartPost.val(T.dateToText(contentNews.startPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (contentNews.stopPost)
                    neNewsStopPost.val(T.dateToText(contentNews.stopPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (contentNews.link) {
                    $(this.newsLink).html(T.rootUrl + '/tintuc/' + contentNews.link).attr('href', '/tintuc/' + contentNews.link);
                } else {
                    $(this.newsLink).html('').attr('');
                }
                data.image = data.item.image ? data.item.image : '/image/avatar.jpg';
                this.imageBox.setData('draftNews:' + (data.item._id || 'new'));
                $('#neNewsTitle').val(data.item.title);
                $('#neNewsViAbstract').val(contentNews.abstract);
                this.editor.html(contentNews.content);
                this.setState(data);
            } else {
                this.props.history.push('/user/news/draft');
            }
        });
    }

    changeActive = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { active: event.target.checked }) });
    }

    checkLink = (item) => {
        this.props.checkLink(item._id, $('#neNewsLink').val().trim());
    }
    newsLinkChange = (e) => {
        if (e.target.value) {
            $(this.newsLink).html(T.rootUrl + '/tintuc/' + e.target.value).attr('href', '/tintuc/' + e.target.value);
        } else {
            $(this.newsLink).html('').attr('href', '#');
        }
    }
    save = () => {
        const neNewsStartPost = $('#neNewsStartPost').val(),
            neNewsStopPost = $('#neNewsStopPost').val(),
            changes = {
                categories: $('#neNewsCategories').val(),
                title: $('#neNewsTitle').val(),
                link: $('#neNewsLink').val().trim(),
                abstract: $('#neNewsAbstract').val(),
                content: this.editor.html(),
            };
        if (neNewsStartPost) changes.startPost = T.formatDate(neNewsStartPost);
        if (neNewsStopPost) changes.stopPost = T.formatDate(neNewsStopPost);
        let newDraft = {
            title: $('#neNewsTitle').val(),
            editorId: this.props.system.user._id,
            editorName: this.props.system.user.firstname,
            documentType: 'news',
            documentJson: JSON.stringify(changes),
        }
        if (this.props.system.user.permissions.includes('news:write')) {
            delete newDraft.editorId; delete newDraft.editorName;
        }
        this.props.updateDraftNews(this.state.draftId, newDraft, data => { })

    }

    render() {
        const readOnly = false;
        const item = this.state.item ? this.state.item : {
            priority: 1, categories: [], title: '', content: '', image: T.url('/image/avatar.jpg'),
            createdDate: new Date(), active: false, view: 0
        };
        let title = item.title,
            linkDefaultNews = T.rootUrl + '/news/item/' + item._id;

        const categories = this.props.news && this.props.news.categories ? this.props.news.categories : [];
        let userCategories = '';
        (this.state.item && this.state.item.categories ? this.state.item.categories : []).forEach(_id => {
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].id == _id) {
                    userCategories += ', ' + categories[i].text;
                    break;
                }
            }
        });
        if (userCategories.length > 2) userCategories = userCategories.substring(2);

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Tin tức: {item.title}</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/news/list'>Danh sách tin tức</Link>&nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Tên bài viết</label>
                                    <input className='form-control' type='text' placeholder='Tên bài viết' id='neNewsTitle' defaultValue={title.vi} readOnly={readOnly} />
                                </div>

                                <div className='form-group'>
                                    <label className='control-label'>Hình ảnh</label>
                                    <ImageBox ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='NewsDraftImage' image={this.state.image} readOnly={readOnly} />
                                </div>

                                <div className='form-group'>
                                    <label className='control-label'>Danh mục bài viết</label>
                                    <select className='form-control' id='neNewsCategories' multiple={true} defaultValue={[]} disabled={readOnly}>
                                        <optgroup label='Lựa chọn danh mục' />
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Link</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label' style={{ display: 'flex' }}>Link mặc định:&nbsp;
                                        <a href={linkDefaultNews} style={{ fontWeight: 'bold' }} target='_blank'>{linkDefaultNews}</a>
                                    </label>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' style={{ display: 'flex' }}>Link truyền thông:&nbsp;
                                        <a href='#' ref={e => this.newsLink = e} style={{ fontWeight: 'bold' }} target='_blank' />
                                    </label>
                                    <input className='form-control' id='neNewsLink' type='text' placeholder='Link truyền thông' defaultValue={item.link} readOnly={readOnly}
                                        onChange={this.newsLinkChange} />
                                </div>
                            </div>
                            {readOnly ? '' :
                                <div className='tile-footer'>
                                    <button className='btn btn-danger' type='button' onClick={() => this.checkLink(item)}>
                                        <i className='fa fa-fw fa-lg fa-check-circle' />Kiểm tra link
                                </button>
                                </div>
                            }
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Ngày tháng</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày tạo: {T.dateToText(item.createdDate)}</label>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày bắt đầu đăng bài viết</label>
                                    <input className='form-control' id='neNewsStartPost' type='text' placeholder='Ngày bắt đầu đăng bài viết' defaultValue={item.startPost}
                                        disabled={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày kết thúc đăng bài viết</label>
                                    <input className='form-control' id='neNewsStopPost' type='text' placeholder='Ngày kết thúc đăng bài viết' defaultValue={item.stopPost}
                                        disabled={readOnly} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <label className='control-label'>Tóm tắt bài viết</label>
                            <textarea defaultValue='' className='form-control' id='neNewsViAbstract' placeholder='Tóm tắt bài viết' readOnly={readOnly}
                                style={{ minHeight: '100px', marginBottom: '12px' }} />
                            <label className='control-label'>Nội dung bài viết</label>
                            <Editor ref={this.editor} height='400px' placeholder='Nội dung bài biết' uploadUrl='/user/upload?category=news' readOnly={readOnly} />
                        </div>
                    </div>
                </div>
                <Link to={'/user/news/draft'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getDraftNews, checkLink, createDraftNews, updateDraftNews };
export default connect(mapStateToProps, mapActionsToProps)(DraftNewsEditPage);
