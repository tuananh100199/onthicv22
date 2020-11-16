// import React from 'react';
// import { connect } from 'react-redux';
// import { createContentList } from './redux.jsx';
// import { getAllContents } from '../fwHome/redux/reduxContent.jsx'

// class ContentListModal extends React.Component {
//     constructor(props) {
//         super(props);
//         this.modal = React.createRef();
//     }

//     componentDidMount() {
//         this.props.getAllContents();
//         $(document).ready(() => {
//             $(this.modal.current).on('shown.bs.modal', () => $('#contentListName').focus());
//         });
//     }

//     show = () => {
//         $('#contentListName').val('');
//         $(this.modal.current).modal('show');
//     }

//     save = (event) => {
//         const newData = {
//             title: $('#contentListName').val().trim()
//         };

//         if (newData.title == '') {
//             T.notify('Tên danh sách noi dung bị trống!', 'danger');
//             $('#contentListName').focus();
//         } else {
//             this.props.createContentList(newData, data => {
//                 if (data.item) {
//                     $(this.modal.current).modal('hide');
//                     this.props.history.push('/user/list-content/edit/' + data.item._id);
//                 }
//             });
//         }
//         event.preventDefault();
//     }

//     render() {
//         return (
//             <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
//                 <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
//                     <div className='modal-content'>
//                         <div className='modal-header'>
//                             <h5 className='modal-title'>Danh sách noi dung</h5>
//                             <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
//                                 <span aria-hidden='true'>&times;</span>
//                             </button>
//                         </div>
//                         <div className='modal-body'>
//                             <div className='tab-content'>
//                                 <div id='ContentListViTab' className='tab-pane fade show active mt-3'>
//                                     <div className='form-group'>
//                                         <label htmlFor='ContentListName'>Tên danh sách noi dung</label>
//                                         <input className='form-control' id='ContentListName' type='text' placeholder='Tên danh sách video' />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className='modal-footer'>
//                             <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
//                             <button type='submit' className='btn btn-primary'>Lưu</button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         );
//     }
// }
// const mapStateToProps = state => ({ system: state.system, contentList: state.contentList, content: state.content });
// const mapActionsToProps = { createContentList, getAllContents };
// export default connect(mapStateToProps, mapActionsToProps)(ContentListModal);