import React from 'react';
import { connect } from 'react-redux';
import { getAnnouncement, updateAnnouncement,checkLink } from './redux';
import { AdminPage, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormImageBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import {typeOptions} from './constant';
const backUrl = '/user/announcement';

class NewsEditPage extends AdminPage {
    state = { title: '...' };
    componentDidMount() {
        T.ready(backUrl, () => {
            const route = T.routeMatcher('/user/announcement/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.props.getAnnouncement(_id, data => {
                if (data.item) {
                    const { _id, title, image, link, startPost, stopPost, abstract, content, createdDate, view, active, type='' } = data.item;
                    this.itemTitle.value(title);
                    this.itemLink.value(link ? link : '');
                    this.itemView.value(view);
                    this.itemActive.value(active);
                    this.itemCreatedDate.value(createdDate ? T.dateToText(createdDate) : '');
                    this.itemStartPost.value(startPost);
                    this.itemStopPost.value(stopPost);
                    this.itemAbstract.value(abstract);
                    this.itemContent.html(content);
                    this.itemImage.setData('announcement:' + _id);
                    this.itemType.value(type);
                    this.setState({ _id, title, link, image });
                    this.itemTitle.focus();
                } else {
                    T.notify('Lấy tin tức bị lỗi!', 'danger');
                    this.props.history.push(backUrl);
                }
            });
        });
    }
    save = () => {
        const newData = {
            title: this.itemTitle.value(),
            active: this.itemActive.value(),
            link: this.itemLink.value(),
            abstract: this.itemAbstract.value(),
            content: this.itemContent.html(),
            startPost: this.itemStartPost.value(),
            stopPost: this.itemStopPost.value(),
            type:this.itemType.value(),
        };
        if (newData.title == '') {
            T.notify('Tên tin tức bị trống!', 'danger');
            this.itemTitle.focus();
        }else {
            this.state.link ?
                this.props.checkLink(this.state._id, this.itemLink.value().trim(), error => {
                    if (error) {
                        T.notify('Link không hợp lệ!', 'danger');
                        this.itemLink.focus();
                    } else {
                        this.props.updateAnnouncement(this.state._id, newData);
                    }
                }) :
                this.props.updateAnnouncement(this.state._id, newData);
        }
    }
    render() {
        const permission = this.getUserPermission('announcement'),
            readOnly = !permission.write;
        const { _id, title } = this.state,
            linkDefaultNews = T.rootUrl + '/announcement/' + _id;

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Thông báo: ' + title,
            breadcrumb: [<Link key={0} to='/user/announcement'>Thông báo</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <FormTextBox type='text' ref={e => this.itemTitle = e} label='Tiêu đề' onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                                <div className='row'>
                                    <FormImageBox ref={e => this.itemImage = e} label='Hình ảnh' uploadType='AnnouncementImage' image={this.state.image || '/img/avatar.jpg'} className='col-md-6' readOnly={readOnly} />
                                    <div className='col-md-6'>
                                        <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
                                        <FormTextBox type='number' ref={e => this.itemView = e} label={'Lượt xem'} readOnly={true} />
                                    </div>
                                </div>
                                <div className="row">
                                    <FormSelect className='col-md-12' onChange = {data=>this.onSelectNewsType(data)} ref={e => this.itemType = e} label='Loại bài viết' data={typeOptions} readOnly={readOnly} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Link</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label style={{ display: 'flex' }}>Link mặc định:&nbsp;
                                        <a href={linkDefaultNews} style={{ fontWeight: 'bold' }} target='_blank' rel='noreferrer'>{linkDefaultNews}</a>
                                    </label>
                                </div>
                                <FormTextBox type='text' ref={e => this.itemLink = e} label='Link truyền thông' onChange={e => this.setState({ link: e.target.value })} readOnly={readOnly} />
                                {this.state.link ? <>URL: <a href={T.rootUrl + '/thong-bao/' + this.state.link} style={{ fontWeight: 'bold' }} target='_blank' rel='noreferrer'>{T.rootUrl + '/thong-bao/' + this.state.link}</a></> : ''}
                            </div>
                            {readOnly || !this.state.link ? '' :
                                <div className='tile-footer'>
                                    <button className='btn btn-danger' type='button' onClick={() => this.props.checkLink(_id, this.itemLink.value().trim(), error => {
                                        if (error) {
                                            T.notify('Link không hợp lệ!', 'danger');
                                        } else {
                                            T.notify('Link hợp lệ!', 'success');
                                        }
                                    })}>
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

const mapStateToProps = state => ({ system: state.system, announcement: state.communication.announcement });
const mapActionsToProps = { getAnnouncement, updateAnnouncement,checkLink };
export default connect(mapStateToProps, mapActionsToProps)(NewsEditPage);