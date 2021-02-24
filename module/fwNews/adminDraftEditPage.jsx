import React from 'react';
import { connect } from 'react-redux';
import { getDraftNews, checkLink, createDraftNews, updateDraftNews } from './redux.jsx'
import { Link } from 'react-router-dom';
import ImageBox from '../../view/component/ImageBox.jsx';
import Editor from '../../view/component/CkEditor4.jsx';

class DraftNewsEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, draft: true, draftId: '' };
        this.newsLink = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/news/draft', () => {
            this.getData();
            $('#neNewsViTitle').focus();
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
                let categories = data.categories.map(item => ({ id: item.id, text: T.language.parse(item.text) }));
                $('#neNewsCategories').select2({ data: categories }).val(contentNews.categories).trigger('change');
                const neNewsStartPost = $('#neNewsStartPost').datetimepicker(T.dateFormat);
                const neNewsStopPost = $('#neNewsStopPost').datetimepicker(T.dateFormat);
                if (contentNews.startPost)
                    neNewsStartPost.val(T.dateToText(contentNews.startPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (contentNews.stopPost)
                    neNewsStopPost.val(T.dateToText(contentNews.stopPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (contentNews.link) {
                    $(this.newsLink.current).html(T.rootUrl + '/tintuc/' + contentNews.link).attr('href', '/tintuc/' + contentNews.link);
                } else {
                    $(this.newsLink.current).html('').attr('');
                }
                data.image = data.item.image ? data.item.image : '/image/avatar.jpg';
                this.imageBox.current.setData('draftNews:' + (data.item._id ? data.item._id : 'new'));
                let title = T.language.parse(data.item.title, true),
                    abstract = T.language.parse(contentNews.abstract, true),
                    content = T.language.parse(contentNews.content, true);
                $('#neNewsViTitle').val(title.vi); $('#neNewsEnTitle').val(title.en);
                $('#neNewsViAbstract').val(abstract.vi); $('#neNewsEnAbstract').val(abstract.en);
                this.viEditor.current.html(content.vi); this.enEditor.current.html(content.en);
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
            $(this.newsLink.current).html(T.rootUrl + '/tintuc/' + e.target.value).attr('href', '/tintuc/' + e.target.value);
        } else {
            $(this.newsLink.current).html('').attr('href', '#');
        }
    }
    save = () => {
        const neNewsStartPost = $('#neNewsStartPost').val(),
            neNewsStopPost = $('#neNewsStopPost').val(),
            changes = {
                categories: $('#neNewsCategories').val(),
                title: JSON.stringify({ vi: $('#neNewsViTitle').val(), en: $('#neNewsEnTitle').val() }),
                link: $('#neNewsLink').val().trim(),
                abstract: JSON.stringify({ vi: $('#neNewsViAbstract').val(), en: $('#neNewsEnAbstract').val() }),
                content: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
            };
        if (neNewsStartPost) changes.startPost = T.formatDate(neNewsStartPost);
        if (neNewsStopPost) changes.stopPost = T.formatDate(neNewsStopPost);
        let newDraft = {
            title: JSON.stringify({ vi: $('#neNewsViTitle').val(), en: $('#neNewsEnTitle').val() }),
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
        let title = T.language.parse(item.title, true),
            linkDefaultNews = T.rootUrl + '/news/item/' + item._id;

        const categories = this.props.news && this.props.news.categories ? this.props.news.categories : [];
        let userCategories = '';
        (this.state.item && this.state.item.categories ? this.state.item.categories : []).forEach(_id => {
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].id == _id) {
                    userCategories += ', ' + T.language.parse(categories[i].text);
                    break;
                }
            }
        });
        if (userCategories.length > 2) userCategories = userCategories.substring(2);

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Tin tức: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/news/list'>Danh sách tin tức</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Tên bài viết</label>
                                    <input className='form-control' type='text' placeholder='Tên bài viết' id='neNewsViTitle' defaultValue={title.vi} readOnly={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>News title</label>
                                    <input className='form-control' type='text' placeholder='News title' id='neNewsEnTitle' defaultValue={title.en} readOnly={readOnly} />
                                </div>

                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='NewsDraftImage' image={this.state.image} readOnly={readOnly} />
                                        </div>
                                    </div>

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
                                    <label className='control-label'>Link mặc định</label><br />
                                    <a href={linkDefaultNews} style={{ fontWeight: 'bold' }} target='_blank'>{linkDefaultNews}</a>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Link truyền thông</label><br />
                                    <a href='#' ref={this.newsLink} style={{ fontWeight: 'bold' }} target='_blank' />
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

                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <ul className='nav nav-tabs'>
                                    <li className='nav-item'>
                                        <a className='nav-link active show' data-toggle='tab' href='#newsViTab'>Việt Nam</a>
                                    </li>
                                    <li className='nav-item'>
                                        <a className='nav-link' data-toggle='tab' href='#newsEnTab'>English</a>
                                    </li>
                                </ul>
                                <div className='tab-content' style={{ paddingTop: '12px' }}>
                                    <div id='newsViTab' className='tab-pane fade show active'>
                                        <label className='control-label'>Tóm tắt bài viết</label>
                                        <textarea defaultValue='' className='form-control' id='neNewsViAbstract' placeholder='Tóm tắt bài viết' readOnly={readOnly}
                                            style={{ minHeight: '100px', marginBottom: '12px' }} />
                                        <label className='control-label'>Nội dung bài viết</label>
                                        <Editor ref={this.viEditor} height='400px' placeholder='Nội dung bài biết' uploadUrl='/user/upload?category=news' readOnly={readOnly} />
                                    </div>
                                    <div id='newsEnTab' className='tab-pane fade'>
                                        <label className='control-label'>News abstract</label>
                                        <textarea defaultValue='' className='form-control' id='neNewsEnAbstract' placeholder='News abstracts' readOnly={readOnly}
                                            style={{ minHeight: '100px', marginBottom: '12px' }} />
                                        <label className='control-label'>News content</label>
                                        <Editor ref={this.enEditor} height='400px' placeholder='News content' uploadUrl='/user/upload?category=news' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
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
