import React from 'react';
import { connect } from 'react-redux';
import { updateCourseType, getCourseType, addCourseTypeSubject, deleteCourseTypeSubject } from './redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { Link } from 'react-router-dom';
import { getSubjectAll } from 'modules/mdDaoTao/fwSubject/redux';
import { AdminPage, CirclePageButton, AdminModal, FormTextBox, FormRichTextBox, FormEditor, FormImageBox, TableCell, renderTable, FormCheckbox, FormTabs, FormSelect } from 'view/component/AdminPage';

class CourseTypeModal extends AdminModal {
    state = { subjects: [] };
    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item) {   // chỉ lấy các môn chưa đưa vào
            const _subjectIds = this.props.item.subjects.map(item => item._id);
            getSubjectAll({ _id: { $nin: _subjectIds } }, list => this.setState({ subjects: list.map(item => ({ id: item._id, text: item.title })) }));
        }
    }
    onShow = () => this.subjectSelect.value(null);

    onSubmit = () => {
        const _subjectId = this.subjectSelect.value();
        if (!_subjectId) {
            T.notify('Tên môn học không được trống!', 'danger');
        } else {
            this.props.add(this.props.item._id, _subjectId, this.hide);
        }
    }

    render = () => {

        return this.renderModal({
            title: 'Môn học',
            body: <FormSelect ref={e => this.subjectSelect = e} label='Môn học' data={this.state.subjects} readOnly={this.props.readOnly} />
        });
    };
}

const backRoute = '/user/course-type';
class CourseTypeEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getCategoryAll('drive-question', null, (items) =>
                this.setState({ types: (items || []).map(item => ({ _id: item._id, text: item.title })) }));
        T.ready(backRoute, () => {
            const route = T.routeMatcher(backRoute + '/:_id'), params = route.parse(window.location.pathname);
            this.props.getCourseType(params._id, item => {
                if (item) {
                    this.setState(item, ()=> {
                        this.itemTitle.value(item.title);
                        this.itemShortDescription.value(item.shortDescription);
                        this.itemDetailDescription.html(item.detailDescription);
                        this.itemPrice.value(item.price);
                        this.itemIsPriceDisplayed.value(item.isPriceDisplayed);
                        this.itemImage.setData('course-type:' + item._id);
    
                        this.itemTitle.focus();
                        item.questionTypes && item.questionTypes.forEach(type => {
                            type.amount ? 
                            this[type.category] && this[type.category].value(type.amount)
                            : this[type.category] && this[type.category].value(0);
                        })
                    });
                  
                } else {
                    this.props.history.push(backRoute);
                }
            });
            
        });
        }

    remove = (e, subject) => e.preventDefault() || T.confirm('Xoá môn học ', `Bạn có chắc muốn xoá môn học '${subject.title}' khỏi loại khóa học này?`, true, isConfirm =>
        isConfirm && this.props.deleteCourseTypeSubject(this.state._id, subject._id));

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            shortDescription: this.itemShortDescription.value().trim(),
            detailDescription: this.itemDetailDescription.html(),
            price: this.itemPrice.value(),
            isPriceDisplayed: this.itemIsPriceDisplayed.value(),
            questionTypes: this.state.types.map(type => ({
                category: type._id,
                amount: this[type._id].value(),
            }))
        };
        if (changes.title == '') {
            T.notify('Tên loại khóa học không được trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.updateCourseType(this.state._id, changes);
        }
    }

    render() {
        const types = this.state.types ? this.state.types : [];
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
                        {readOnly ? null : <TableCell type='buttons' content={item} permission={permissionCourseType} onDelete={this.remove} />}
                    </tr>),
            }),
            driveQuestionTypes = types.map((item, index) => {
                return (
                    <FormTextBox className='col-md-6' key={index} type='number' ref={e => this[item._id] = e } label={item.text} readOnly={this.props.readOnly} />
                )
            })
            ,
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
                <CourseTypeModal ref={e => this.modal = e} readOnly={!permissionCourseType.write} add={this.props.addCourseTypeSubject} item={item} />
            </>,
             componentSetRandomDriveTest = <>
                <div className='row'>
                        {driveQuestionTypes}
                </div>
                {readOnly ? null : <CirclePageButton type='save' onClick={this.save} />}
             </>,
            tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Môn học', component: componentSubject }, { title: 'Thiết lập bộ đề ngẫu nhiên', component: componentSetRandomDriveTest }];

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Loại khóa học: ' + this.state.title,
            breadcrumb: [<Link key={0} to={backRoute}>Loại khóa học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { updateCourseType, getCourseType, addCourseTypeSubject, deleteCourseTypeSubject, getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(CourseTypeEditPage);