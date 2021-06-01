// import React from 'react';
// import { connect } from 'react-redux';
// import { updateForum, getForum } from './redux';
// import { Link } from 'react-router-dom';
// import { AdminPage, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormImageBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';

// const backUrl = '/user/forum';
// class ForumEditPage extends AdminPage {
//     state = { title: '...', categories: [] };
//     componentDidMount() {
//         T.ready(backUrl, () => {
//             const route = T.routeMatcher('/user/forum/:_id'),
//                 _id = route.parse(window.location.pathname)._id;
//             this.props.getForum(_id, data => {
//                 console.log('data', data)
//                 if (data.item && data.categories) {
//                     const { _id, title, categories, createdDate, state, messages } = data.item;
//                     this.itemTitle.value(title);
//                     this.itemCreatedDate.value(createdDate ? T.dateToText(createdDate) : '');
//                     const forumCategories = data.categories.map(item => ({ id: item.id, text: item.text }));
//                     this.setState({ _id, title, link, image, categories: forumCategories }, () => this.itemCategories.value(categories.map(item => item._id)));

//                     this.itemTitle.focus();
//                 } else {
//                     T.notify('Lấy thông tin forum bị lỗi!', 'danger');
//                     // this.props.history.push(backUrl);
//                 }
//             });
//         });
//     }

//     save = () => {
//         const newData = {
//             title: this.itemTitle.value(),
//             categories: this.itemCategories.value(),
//             active: this.itemActive.value(),
//             link: this.itemLink.value(),
//             abstract: this.itemAbstract.value(),
//             content: this.itemContent.html(),
//             startPost: this.itemStartPost.value(),
//             stopPost: this.itemStopPost.value(),
//         };
//         if (newData.title == '') {
//             T.notify('Tên tin tức bị trống!', 'danger');
//             this.itemTitle.focus();
//         } else {
//             this.props.updateForum(this.state._id, newData);
//         }
//     }

//     render() {
//         const permission = this.getUserPermission('forum'),
//             readOnly = !permission.write;
//         const { _id, title } = this.state;

//         return this.renderPage({
//             icon: 'fa fa-file',
//             title: 'forum: ' + title,
//             breadcrumb: [<Link key={0} to='/user/forum'>Forum</Link>, 'Chỉnh sửa'],
//             content: <>
//                 <div className='row'>
//                     <div className='col-md-6'>
//                         <div className='tile'>
//                             <h3 className='tile-title'>Thông tin chung</h3>
//                             <div className='tile-body'>
//                                 <FormTextBox type='text' ref={e => this.itemTitle = e} label='Tên bài viết' onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
//                                 <div className='row'>
//                                     <div className='col-md-6'>
//                                         <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
//                                         <FormTextBox type='number' ref={e => this.itemView = e} label={'Lượt xem'} readOnly={true} />
//                                     </div>
//                                 </div>
//                                 <FormSelect ref={e => this.itemCategories = e} label='Danh mục bài viết' data={this.state.categories} multiple={true} readOnly={readOnly} />
//                             </div>
//                         </div>
//                     </div>

//                     <div className='col-md-12'>
//                         <div className='tile'>
//                             <h3 className='tile-title'>Nội dung</h3>
//                             <div className='tile-body'>
//                                 <FormRichTextBox ref={e => this.itemAbstract = e} label='Tóm tắt bài viết' readOnly={readOnly} style={{ minHeight: '100px' }} />
//                                 <FormEditor ref={e => this.itemContent = e} height='400px' label='Nội dung bài viết' uploadUrl='/user/upload?category=news' readOnly={readOnly} />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </>,
//             backRoute: backUrl,
//             onSave: permission.write ? this.save : null,
//         });
//     }
// }

// const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
// const mapActionsToProps = { updateForum, getForum };
// export default connect(mapStateToProps, mapActionsToProps)(ForumEditPage);