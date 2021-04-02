import React from 'react';
import { connect } from 'react-redux';
import { updateNews, getNews, getDraftNews, checkLink, createDraftNews, updateDraftNews } from './redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';

class NewsEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null };
        this.newsLink = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/news/list', () => {
            this.getData();
            $('#neNewsViTitle').focus();
            $('#neNewsCategories').select2();
            $('#neNewsStartPost').datetimepicker(T.dateFormat);
            $('#neNewsStopPost').datetimepicker(T.dateFormat);
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/news/edit/:newsId'),
            newsId = route.parse(window.location.pathname).newsId;
        this.props.getNews(newsId, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                this.props.history.push('/user/news/list');
            } else if (data.item) {
                let categories = data.categories.map(item => ({ id: item.id, text: item.text }));
                $('#neNewsCategories').select2({ data: categories }).val(data.item.categories).trigger('change');
                const neNewsStartPost = $('#neNewsStartPost').datetimepicker(T.dateFormat);
                const neNewsStopPost = $('#neNewsStopPost').datetimepicker(T.dateFormat);
                if (data.item.startPost)
                    neNewsStartPost.val(T.dateToText(data.item.startPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (data.item.stopPost)
                    neNewsStopPost.val(T.dateToText(data.item.stopPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (data.item.link) {
                    $(this.newsLink.current).html(T.rootUrl + '/tintuc/' + data.item.link).attr('href', '/tintuc/' + data.item.link);
                } else {
                    $(this.newsLink.current).html('').attr('');
                }
                data.image = data.item.image ? data.item.image : '/img/avatar.jpg';
                this.imageBox.current.setData('news:' + (data.item._id ? data.item._id : 'new'));
                $('#neNewsViTitle').val(data.item.title);
                $('#neNewsViAbstract').val(data.item.abstract);
                this.viEditor.current.html(data.item.content);
                this.setState(data);
            } else {
                this.props.history.push('/user/news/list');
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
                title: $('#neNewsViTitle').val(),
                link: $('#neNewsLink').val().trim(),
                active: this.state.item.active,
                abstract: $('#neNewsViAbstract').val(),
                content: this.viEditor.current.html()
            };
        if (neNewsStartPost) changes.startPost = T.formatDate(neNewsStartPost);
        if (neNewsStopPost) changes.stopPost = T.formatDate(neNewsStopPost);
        let newDraft = {
            title: $('#neNewsViTitle').val(),
            editorId: this.props.system.user._id,
            documentId: this.state.item._id,
            editorName: this.props.system.user.firstname,
            documentType: 'news',
            documentJson: JSON.stringify(changes),
        }
        if (this.props.system.user.permissions.includes('news:write')) {
            this.props.updateNews(this.state.item._id, changes, () => {
                $('#neNewsLink').val(changes.link)
            })
        } else {
            this.props.createDraftNews(newDraft, result => { this.getData() });
        }
    };
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = true;
        const item = this.state.item ? this.state.item : {
            priority: 1,
            categories: [],
            title: '',
            content: '',
            image: T.url('/image/avatar.jpg'),
            createdDate: new Date(),
            active: false,
            view: 0
        };
        let title = item.title, linkDefaultNews = T.rootUrl + '/news/item/' + item._id;
        const route = T.routeMatcher('/user/news/edit/:newsId'),
            newsId = route.parse(window.location.pathname).newsId;
        const docDraftUser = this.props.news && this.props.news.docDraftUser ? this.props.news.docDraftUser : [];
        const docMapper = {};
        docDraftUser.forEach(user => docMapper[user.documentId] = user._id);
        if (!docMapper[newsId]) readOnly = false;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Tin tức: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title != '' ? 'Tiêu đề: <b>' + title + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
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
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='NewsImage' image={this.state.image} readOnly={!currentPermissions.includes('news:write')} />
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        {currentPermissions.includes('news:write') ? <div className='form-group row' style={{ display: 'inline-flex' }}>
                                            <label className='control-label'>Kích hoạt:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.active} onChange={this.changeActive} disabled={readOnly} />
                                                    <span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div> : null}
                                        <div className='form-group row'>
                                            <label className='control-label col-12'>Lượt xem: {item.view}</label>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Danh mục bài viết</label>
                                    <select className='form-control' id='neNewsCategories' multiple={true} defaultValue={[]} disabled={readOnly} >
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
                                        <a href='#' ref={this.newsLink} style={{ fontWeight: 'bold' }} target='_blank' />
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
                                    <label className='control-label'>Ngày bắt đầu đăng bài viết{readOnly && item.startPost ? ': ' + T.dateToText(item.startPost, 'dd/mm/yyyy HH:MM') : ''}</label>
                                    <input className='form-control' id='neNewsStartPost' type='text' placeholder='Ngày bắt đầu đăng bài viết' defaultValue={item.startPost}
                                        disabled={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày kết thúc đăng bài viết{readOnly && item.stopPost ? ': ' + T.dateToText(item.stopPost, 'dd/mm/yyyy HH:MM') : ''}</label>
                                    <input className='form-control' id='neNewsStopPost' type='text' placeholder='Ngày kết thúc đăng bài viết' defaultValue={item.stopPost}
                                        disabled={readOnly} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <label className='control-label'>Tóm tắt bài viết</label>
                                <textarea defaultValue='' className='form-control' id='neNewsViAbstract' placeholder='Tóm tắt bài viết' readOnly={readOnly}
                                    style={{ minHeight: '100px', marginBottom: '12px' }} />

                                <label className='control-label'>Nội dung bài viết</label>
                                <Editor ref={this.viEditor} height='400px' placeholder='Nội dung bài biết' uploadUrl='/user/upload?category=news' readOnly={readOnly} />
                            </div>
                        </div>
                    </div>
                </div>

                <Link to={'/user/news/list'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {!readOnly &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { updateNews, getNews, getDraftNews, checkLink, createDraftNews, updateDraftNews };
export default connect(mapStateToProps, mapActionsToProps)(NewsEditPage);
