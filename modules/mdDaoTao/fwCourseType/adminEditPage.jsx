import React from 'react';
import { connect } from 'react-redux';
import { updateCourseType, getCourseType } from './redux';
import { Link } from 'react-router-dom';
import { ajaxSelectSubject } from 'modules/mdDaoTao/fwSubject/redux';
import { AdminPage, CirclePageButton, AdminModal, FormTextBox, FormRichTextBox, FormEditor, FormImageBox, TableCell, renderTable, FormCheckbox, FormTabs, FormSelect } from 'view/component/AdminPage';

class CourseTypeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => { }));
    }

    onShow = () => this.subjectSelect.value('');

    onSubmit = () => {
        const _subjectId = this.subjectSelect.value();
        if (!_subjectId) T.notify('Tên cơ sở bị trống!', 'danger');
        else {
            const subjects = this.props.item.subjects.map(item => item._id);
            subjects.push(_subjectId);
            this.props.update(this.props.item._id, { subjects }, () => {
                T.notify('Thêm môn học thành công', 'success');
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Môn học',
        body:
            <FormSelect ref={e => this.subjectSelect = e} label='Môn học' data={{
                ...ajaxSelectSubject, processResults: response =>
                    ({ results: response && response.page && response.page.list ? response.page.list.filter(item => !this.props.item.subjects.map(item => item._id).includes(item._id)).map(item => ({ id: item._id, text: item.title })) : [] })
            }} readOnly={this.props.readOnly} />
    });
}

const backRoute = '/user/course-type'
class CourseTypeEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(backRoute, () => {
            const route = T.routeMatcher(backRoute + '/:_id'), params = route.parse(window.location.pathname);
            this.props.getCourseType(params._id, item => {
                if (item) {
                    this.itemTitle.value(item.title);
                    this.itemShortDescription.value(item.shortDescription);
                    this.itemDetailDescription.html(item.detailDescription);
                    this.itemPrice.value(item.price);
                    this.itemIsPriceDisplayed.value(item.isPriceDisplayed);
                    this.itemImage.setData('course-type:' + item._id);

                    this.itemTitle.focus();
                    this.setState(item);
                } else {
                    this.props.history.push(backRoute);
                }
            });
        });
    }

    remove = (e, index) => e.preventDefault() || T.confirm('Xoá môn học ', 'Bạn có chắc muốn xoá môn học khỏi loại khóa học này?', true, isConfirm => {
        if (isConfirm) {
            let subjects = this.props.courseType.item.subjects.map(item => item._id);
            subjects.splice(index, 1);
            this.props.updateCourseType(this.state._id, { subjects: subjects.length ? subjects : 'empty' }, () => T.alert('Xoá môn học khỏi loại khóa học thành công!', 'error', false, 800));
        }
    })

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
        const permissionSubject = this.getUserPermission('subject'),
            permissionCourseType = this.getUserPermission('course-type'),
            readOnly = !permissionCourseType.write,
            item = this.props.courseType && this.props.courseType.item ? this.props.courseType.item : { title: '', subjects: [] },
            table = renderTable({
                getDataSource: () => item.subjects && item.subjects.sort((a, b) => a.title.localeCompare(b.title)),
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên môn học</th>
                        {readOnly ? null : <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>}
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type={permissionSubject.read ? 'link' : 'text'} content={item.title} url={`/user/dao-tao/mon-hoc/${item._id}`} />
                        {readOnly ? null : <TableCell type='buttons' content={index} permission={permissionCourseType} onDelete={this.remove} />}
                    </tr>),
            }),
            componentInfo = <>
                <div className='row'>
                    <FormImageBox ref={e => this.itemImage = e} label='Hình đại diện' uploadType='CourseTypeImage' image={this.state.image} readOnly={readOnly} className='col-md-3 order-md-12' />
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
                {readOnly ? null : <CirclePageButton type='save' onClick={this.save} />}
            </>,
            componentSubject = <>
                {table}
                {readOnly ? null : <CirclePageButton type='create' onClick={() => this.modal.show()} />}
                <CourseTypeModal ref={e => this.modal = e} readOnly={!permissionCourseType.write} update={this.props.updateCourseType} item={item} />
            </>,
            tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Môn học', component: componentSubject }];

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Loại khóa học: ' + this.state.title,
            breadcrumb: [<Link to={backRoute}>Loại khóa học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { updateCourseType, getCourseType };
export default connect(mapStateToProps, mapActionsToProps)(CourseTypeEditPage);