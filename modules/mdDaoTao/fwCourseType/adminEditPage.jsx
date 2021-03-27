import React from 'react';
import { connect } from 'react-redux';
import { updateCourseType, getCourseType } from './redux';
import { Link } from 'react-router-dom';
import { Select } from 'view/component/Input';
import { ajaxSelectSubject } from 'modules/mdDaoTao/fwSubject/redux';
import ImageBox from 'view/component/ImageBox';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormTabs } from 'view/component/AdminPage';

class CourseTypeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => $(this.subjectSelect).focus()));
    }

    onShow = () => this.subjectSelect.val('');

    onSubmit = () => {
        const changeItem = this.subjectSelect.val();
        if (!changeItem) {
            T.notify('Tên cơ sở bị trống!', 'danger');
            $(this.subjectSelect).focus();
        } else {
            const subjects = this.props.item.subjects.map(item => item._id);
            subjects.push(changeItem);
            this.props.updateCourseType(this.props.item._id, { subjects }, () => {
                T.notify('Thêm môn học thành công', 'success');
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Môn học',
        body:
            <Select ref={e => this.subjectSelect = e} displayLabel={true}
                adapter={{
                    ...ajaxSelectSubject, processResults: response =>
                        ({ results: response && response.page && response.page.list ? response.page.list.filter(item => !this.props.item.subjects.map(item => item._id).includes(item._id)).map(item => ({ id: item._id, text: item.title })) : [] })
                }} label='Môn học' />
    });
}

class CourseTypeEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/course-type/list', () => {
            const route = T.routeMatcher('/user/course-type/edit/:_id'), params = route.parse(window.location.pathname);
            this.props.getCourseType(params._id, item => {
                if (item) {
                    // Custom loop fuction to reduce repeat code when fetching data into initialValue of each FormItem
                    Object.entries(item).forEach(([key, value]) => {
                        const formItemRef = this[`item${key[0].toUpperCase()}${key.slice(1)}`];
                        switch (key) {
                            case 'image': formItemRef.setData('course-type:' + (item._id || 'new'), (value || '/img/avatar.png')); break;
                            case 'detailDescription': formItemRef.html(value); break;
                            default: formItemRef && formItemRef.value(value);
                        }
                    });
                    this.itemTitle.focus();
                    this.setState(item);
                } else {
                    this.props.history.push('/user/course-type/list');
                }
            });
        });
    }

    remove = (e, index) => {
        T.confirm('Xoá môn học ', 'Bạn có chắc muốn xoá môn học khỏi loại khóa học này?', true, isConfirm => {
            if (isConfirm) {
                let subjects = this.props.courseType.item.subjects.map(item => item._id) || [];
                subjects.splice(index, 1);
                if (subjects.length == 0) subjects = 'empty';
                this.props.updateCourseType(this.state._id, { subjects }, () => {
                    T.alert('Xoá môn học khỏi loại khóa học thành công!', 'error', false, 800);
                });
            }
        })
        e.preventDefault();
    }

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            shortDescription: this.itemShortDescription.value().trim(),
            detailDescription: this.itemDetailDescription.html(),
            price: this.itemPrice.value(),
            isPriceDisplayed: this.itemIsPriceDisplayed.value()
        };
        this.props.updateCourseType(this.state._id, changes, () => T.notify('Cập nhật loại khóa học thành công!', 'success'))
    }

    render() {
        const permission = this.getUserPermission('course-type'), readOnly = !permission.write;
        const item = this.props.courseType && this.props.courseType.item ? this.props.courseType.item : { title: '', subjects: [] };
        let table = 'Không có môn học!';
        if (item.subjects && item.subjects.length)
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '100%' }}>Tên môn học</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {item.subjects.sort((a, b) => a.title.localeCompare(b.title)).map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    {permission.write ?
                                        <Link to={'/user/dao-tao/mon-hoc/' + item._id}>
                                            {item.title}
                                        </Link> : item.title}</td>
                                <td>
                                    {permission.delete ?
                                        <a className='btn btn-danger' href='#' onClick={e => this.remove(e, index)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a> : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

        const componentInfo = <>
            <div className='row'>
                <div className='form-group col-md-3 order-md-12'>
                    <label>Hình đại diện</label>
                    <ImageBox ref={e => this.itemImage = e} postUrl='/user/upload' uploadType='CourseTypeImage' readOnly={readOnly} />
                </div>
                <div className='col-md-9 order-md-1'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tên loại khóa học' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                    <div className='row'>
                        <FormTextBox className='col-md-8' ref={e => this.itemPrice = e} label='Giá loại khóa học' readOnly={readOnly} />
                        <FormCheckbox className='col-md-4' ref={e => this.itemIsPriceDisplayed = e} label='Hiển thị giá' readOnly={readOnly} />
                    </div>
                </div>
            </div>

            <FormRichTextBox ref={e => this.itemShortDescription = e} label='Mô tả ngắn gọn' readOnly={readOnly} />
            <FormEditor ref={e => this.itemDetailDescription = e} label='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
            <div style={{ textAlign: 'right' }}>
                <button className='btn btn-primary' type='button' onClick={this.save}>
                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                </button>
            </div>
        </>;
        const componentSubject = <>
            {table}
            {readOnly ? null :
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={() => this.modal.show()}>
                        <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                    </button>
                </div>}
            <CourseTypeModal ref={e => this.modal = e} updateCourseType={this.props.updateCourseType} history={this.props.history} item={item} />
        </>;

        const tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Môn học', component: componentSubject }];
        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Loại khóa học: ' + this.state.title,
            breadcrumb: [<Link to='/user/course-type/list'>Loại khóa học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { updateCourseType, getCourseType };
export default connect(mapStateToProps, mapActionsToProps)(CourseTypeEditPage);