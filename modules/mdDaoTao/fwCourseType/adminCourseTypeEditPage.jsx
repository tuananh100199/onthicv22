import React from 'react';
import { connect } from 'react-redux';
import { updateCourseType, getCourseType } from './redux';
import { Link } from 'react-router-dom';
import { Select } from 'view/component/Input';
import { ajaxSelectSubject } from '../fwSubject/redux';
import ImageBox from 'view/component/ImageBox';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormTabs } from 'view/component/AdminPage';

class CourseTypeModal extends AdminModal {
    // subjectSelect = React.createRef();
    show = () => {
        this.itemSubject.value('');
        // this.subjectSelect.current.val('');
        this.itemSubject.focus();
        // $(this.modal.current).modal('show');
    }

    onSubmit = () => {
        const changeItem = this.itemSubject.value();
        if (!changeItem) {
            T.notify('Tên cơ sở bị trống!', 'danger');
            this.tiemSubject.focus();
        } else {
            const subjectList = this.props.item.subjectList;
            subjectList.push(changeItem);
            this.props.updateCourseType(this.props.item._id, { subjectList }, () => {
                T.notify('Thêm môn học thành công', 'success');
                this.hide();
            });
        }
    }
    // save = (event) => {
    //     const changeItem = this.subjectSelect.current.val();
    //     const subjectList = this.props.item.subjectList;
    //     subjectList.push(changeItem);
    //     this.props.updateCourseType(this.props.item._id, { subjectList }, () => {
    //         T.notify('Thêm môn học thành công', 'success');
    //         $(this.modal.current).modal('hide');
    //     });
    //     event.preventDefault();
    // }
    render = () => this.renderModal({
        title: 'Môn học',
        body: <Select ref={e => this.itemSubject = e} displayLabel={true}
            adapter={{
                ...ajaxSelectSubject, processResults: response =>
                    ({ results: response && response.page && response.page.list ? response.page.list.filter(item => !this.props.item.subjectList.map(item => item._id).includes(item._id)).map(item => ({ id: item._id, text: item.title })) : [] })
            }} label='Môn học' />
    });
    // render() {
    //     return (
    //         <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
    //             <div className='modal-dialog' role='document'>
    //                 <div className='modal-content'>
    //                     <div className='modal-header'>
    //                         <h5 className='modal-title'>Môn học</h5>
    //                         <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
    //                             <span aria-hidden='true'>&times;</span>
    //                         </button>
    //                     </div>
    //                     <div className='modal-body'>
    //                         <div className='form-group'>
    //                             <Select ref={this.subjectSelect} displayLabel={true}
    //                                 adapter={{
    //                                     ...ajaxSelectSubject, processResults: response =>
    //                                         ({ results: response && response.page && response.page.list ? response.page.list.filter(item => !this.props.item.subjectList.map(item => item._id).includes(item._id)).map(item => ({ id: item._id, text: item.title })) : [] })
    //                                 }} label='Môn học' />
    //                         </div>
    //                     </div>
    //                     <div className='modal-footer'>
    //                         <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
    //                         <button type='button' className='btn btn-success' onClick={this.save}>
    //                             <i className='fa fa-fw fa-lg fa-save' /> Lưu
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }
}

class CourseTypeEditPage extends AdminPage {
    state = {};
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/course-type/list', () => {
            const route = T.routeMatcher('/user/course-type/edit/:_id'), params = route.parse(window.location.pathname);
            this.props.getCourseType(params._id, item => {
                if (item) {
                    // Custom loop fuction to reduce repeat code when fetching data into initialValue of each FormItem
                    Object.entries(item).forEach(([key, value]) => {
                        const formItemRef = this[`item${key[0].toUpperCase()}${key.slice(1)}`];
                        switch (key) {
                            case 'image':
                                formItemRef.setData('course-type:' + (item._id || 'new'), (value || '/img/avatar.png'));
                                break;
                            case 'detailDescription': formItemRef.html(value); break;
                            default: formItemRef && formItemRef.value(value);
                        }
                    });
                    // for (const [key, value] of Object.entries(item)) {
                    //     const formItemRef = this[`item${key[0].toUpperCase() + key.slice(1)}`];
                    // }
                    // Object.keys(item).forEach(i => {
                    //     const formItemRef = this[`item${i[0][0].toUpperCase() + i[0].slice(1)}`];

                    //     formItemRef && (i === 'image' ? this.itemImage.setData('course-type:' + (this.state._id || 'new'), (this.state.image || '/img/avatar.png')) : formItemRef.value(item[i]))
                    // })
                    this.itemTitle.focus();
                    this.setState(item);
                } else this.props.history.push('/user/course-type/list');
            });
            // let tabIndex = parseInt(T.cookie('componentPageTab')),
            //     navTabs = $('#componentPage ul.nav.nav-tabs');
            // if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= navTabs.children().length) tabIndex = 0;
            // navTabs.find('li:nth-child(' + (tabIndex + 1) + ') a').tab('show');
            // $('#componentPage').fadeIn();

            // $(`a[data-toggle='tab']`).on('shown.bs.tab', e => {
            //     T.cookie('componentPageTab', $(e.target).parent().index());
            // });
        });
    }

    remove = (e, index) => {
        T.confirm('Xoá môn học ', 'Bạn có chắc muốn xoá môn học khỏi loại khóa học này?', true, isConfirm => {
            if (isConfirm) {
                let subjectList = this.props.courseType.item.subjectList || [];
                subjectList.splice(index, 1);
                if (subjectList.length == 0) subjectList = 'empty';
                this.props.updateCourseType(this.state._id, { subjectList }, () => {
                    T.alert('Xoá môn học khỏi loại khóa học thành công!', 'error', false, 800);
                });
            }
        })
        e.preventDefault();
    }

    // showSelectModal = (e) => {
    //     e.preventDefault();
    //     this.modal.current.show();
    // }

    // changeActive = (event) => this.setState({ item: { ...this.state.item, isPriceDisplayed: event.target.checked } })

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            shortDescription: this.itemShortDescription.value().trim(),
            detailDescription: this.itemDetailDescription.html(),
            price: this.itemPrice.value().trim(),
            isPriceDisplayed: this.itemIsPriceDisplayed.value()
        };
        this.props.updateCourseType(this.state._id, changes, () => T.notify('Cập nhật loại khóa học thành công!', 'success'))
    }

    render() {
        const permission = this.getUserPermission('course-type'), readOnly = !permission.write;
        const item = this.props.courseType && this.props.courseType.item ? this.props.courseType.item : { title: '', subjectList: [] };
        let table = 'Không có môn học!';
        if (item.subjectList && item.subjectList.length)
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '100%' }}>Tên môn học</th>
                            {permission.delete && <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {item.subjectList.sort((a, b) => a.title.localeCompare(b.title)).map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    {permission.write ?
                                        <Link to={'/user/dao-tao/mon-hoc/edit/' + item._id} data-id={item._id}>
                                            {item.title}
                                        </Link> : item.title}</td>
                                <td>
                                    {permission.delete ?
                                        <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a> : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

        const tabs = [
            {
                title: 'Thông tin chung', component: <>
                    <div className='row'>
                        <div className='form-group col-md-3 order-md-12'>
                            <label>Hình đại diện</label>
                            <ImageBox ref={e => this.itemImage = e} postUrl='/user/upload' uploadType='CourseTypeImage' readOnly={readOnly} />
                        </div>
                        <div className='col-md-9 order-md-1'>
                            <FormTextBox ref={e => this.itemTitle = e} label='Tên loại khóa học' readOnly={readOnly} value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />
                            {/* <div className='form-group'>
                                <label className='control-label'>Tên</label>
                                <input className='form-control' type='text' placeholder='Tên loại khóa học' id='title' readOnly={readOnly} />
                            </div> */}
                            <div className='row'>
                                <FormTextBox className='col-md-6 order-md-1' ref={e => this.itemPrice = e} label='Giá loại khóa học' readOnly={readOnly} />
                                {/* <div className='form-group col-md-6 order-md-1'>
                                    <label className='control-label'>Giá</label>
                                    <input className='form-control' type='number' placeholder='Giá loại khóa học' id='price' readOnly={readOnly} />
                                </div> */}
                                <FormCheckbox className='col-md-3 order-md-12' style={{ display: 'flex' }} ref={e => this.itemIsPriceDisplayed = e} label='Hiển thị giá' />
                                {/* <div className='form-group col-md-3 order-md-12' style={{ display: 'flex' }}>
                                    <label className='control-label'>Hiển thị giá:</label>
                                    <div className='toggle' style={{ paddingLeft: '10px' }}>
                                        <label>
                                            <input type='checkbox' checked={this.state.item ? this.state.item.isPriceDisplayed : 0} onChange={(e) => this.changeActive(e)} /><span className='button-indecator' />
                                        </label>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                    <FormRichTextBox ref={e => this.itemShortDescription = e} label='Mô tả ngắn gọn' readOnly={readOnly} />
                    <FormEditor ref={e => this.itemDetailDescription = e} label='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-primary' type='button' onClick={this.save}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                    </div>
                </>
            },
            {
                title: 'Môn học', component: <>
                    {table}
                    {readOnly ? null :
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.modal.current.show()}>
                                <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                                </button>
                        </div>}
                    <CourseTypeModal ref={this.modal} updateCourseType={this.props.updateCourseType} history={this.props.history} item={item} />
                </>
            },
        ];

        const renderData = {
            icon: 'fa fa-file',
            title: 'Loại khóa học: ' + this.state.title,
            breadcrumb: [<Link to='/user/course-type/list'>Loại khóa học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
        };
        return this.renderPage(renderData);

        // return (
        //     <main className='app-content' id='componentPage' style={{ display: 'none' }}>
        //         <div className='app-title'>
        //             <h1><i className='fa fa-file' /> Loại khóa học: {item.title || ''}</h1>
        //             <ul className='app-breadcrumb breadcrumb'>
        //                 <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
        //                 <Link to='/user/course/list'>Loại khóa học</Link>&nbsp;/&nbsp;Chỉnh sửa
        //             </ul>
        //         </div>

        //         <ul className='nav nav-tabs'>
        //             <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#courseTypeCommon'>Thông tin chung</a></li>
        //             <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#courseTypeSubject'>Môn học</a></li>
        //         </ul>
        //         <div className='tab-content tile'>
        //             <div className='tab-pane fade active show' id='courseTypeCommon'>
        //                 <div className='row'>
        //                     <div className='form-group col-md-3 order-md-12'>
        //                         <label className='control-label'>Hình đại diện</label>
        //                         <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='CourseTypeImage' />
        //                     </div>
        //                     <div className='col-md-9 order-md-1'>
        //                         <div className='form-group'>
        //                             <label className='control-label'>Tên</label>
        //                             <input className='form-control' type='text' placeholder='Tên loại khóa học' id='title' readOnly={readOnly} />
        //                         </div>
        //                         <div className='row'>
        //                             <div className='form-group col-md-6 order-md-1'>
        //                                 <label className='control-label'>Giá</label>
        //                                 <input className='form-control' type='number' placeholder='Giá loại khóa học' id='price' readOnly={readOnly} />
        //                             </div>
        //                             <div className='form-group col-md-3 order-md-12' style={{ display: 'flex' }}>
        //                                 <label className='control-label'>Hiển thị giá:</label>
        //                                 <div className='toggle' style={{ paddingLeft: '10px' }}>
        //                                     <label>
        //                                         <input type='checkbox' checked={this.state.item ? this.state.item.isPriceDisplayed : 0} onChange={(e) => this.changeActive(e)} /><span className='button-indecator' />
        //                                     </label>
        //                                 </div>
        //                             </div>
        //                         </div>
        //                     </div>
        //                 </div>
        //                 <FormRichTextBox ref={e => this.itemShortDescription = e} label='Mô tả ngắn gọn' readOnly={readOnly} />
        //                 <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
        //                 {/* <div className='form-group'>
        //                     <label className='control-label'>Mô tả ngắn gọn</label>
        //                     <textarea defaultValue='' className='form-control' id='shortDescription' placeholder='Mô tả ngắn gọn' readOnly={readOnly} rows={5} />
        //                 </div>
        //                 <div className='form-group'>
        //                     <label className='control-label'>Mô tả chi tiết </label>
        //                     <Editor ref={this.editor} height='400px' placeholder='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
        //                 </div> */}
        //                 <div className='tile-footer' style={{ textAlign: 'right' }}>
        //                     <button className='btn btn-primary' type='button' onClick={this.save}>
        //                         <i className='fa fa-fw fa-lg fa-save' /> Lưu
        //                     </button>
        //                 </div>
        //             </div>
        //             <div className='tab-pane fade' id='courseTypeSubject'>
        //                 {table}
        //                 {readOnly ? null :
        //                     <div className='tile-footer' style={{ textAlign: 'right' }}>
        //                         <button className='btn btn-success' type='button' onClick={() => this.modal.current.show()}>
        //                             <i className='fa fa-fw fa-lg fa-plus' /> Thêm
        //                         </button>
        //                     </div>}
        //                 <CourseTypeModal ref={this.modal} updateCourseType={this.props.updateCourseType} history={this.props.history} item={item} />
        //             </div>
        //         </div>

        //         <Link to='/user/course-type/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
        //             <i className='fa fa-lg fa-reply' />
        //         </Link>
        //     </main>
        // );
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { updateCourseType, getCourseType };
export default connect(mapStateToProps, mapActionsToProps)(CourseTypeEditPage);