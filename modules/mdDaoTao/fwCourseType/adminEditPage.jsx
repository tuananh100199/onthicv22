import React from 'react';
import { connect } from 'react-redux';
import { updateCourseType, getCourseType, addCourseTypeSubject, deleteCourseTypeSubject, deleteCourseTypeMonThi } from './redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { Link } from 'react-router-dom';
import { getSubjectAll } from 'modules/mdDaoTao/fwSubject/redux';
import { AdminPage, CirclePageButton, AdminModal, FormTextBox, FormRichTextBox, FormEditor, FormImageBox, TableCell, renderTable, FormCheckbox, FormTabs, FormSelect } from 'view/component/AdminPage';
import {ajaxSelectProfileType} from 'modules/_default/fwProfileType/redux';
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
        _subjectId ?
            this.props.add(this.props.item._id, _subjectId, this.hide) :
            T.notify('Tên môn học không được trống!', 'danger');
    }

    render = () => this.renderModal({
        title: 'Môn học',
        body: <FormSelect ref={e => this.subjectSelect = e} label='Môn học' data={this.state.subjects} readOnly={this.props.readOnly} />,
    });
}

class MonThiTotNghiepModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { title, score, totalScore, diemLiet, _id } = item || { title: '', score: '', totalScore: '', diemLiet: false };
        this.itemTitle.value(title);
        this.itemScore.value(score);
        this.itemTotalScore.value(totalScore);
        this.itemDiemLiet.value(diemLiet);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            score: this.itemScore.value(),
            totalScore: this.itemTotalScore.value(),
            diemLiet: this.itemDiemLiet.value()
        };
        let monThiTotNghiep = this.props.item.monThiTotNghiep;
        if (!this.state._id) {
            monThiTotNghiep.push(data);
        } else {
            let index = monThiTotNghiep.findIndex(monThi => monThi._id == this.state._id);
            data._id = this.state._id;
            if (index != -1) {
                monThiTotNghiep && monThiTotNghiep[index] ? monThiTotNghiep[index] = data : null;
            }
        }
        if (data.title == '') {
            T.notify('Tên môn thi bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.totalScore == '') {
            T.notify('Tổng số câu bị trống!', 'danger');
            this.itemTotalScore.focus();
        } else if (data.score == '') {
            T.notify('Số câu đậu bị trống!', 'danger');
            this.itemScore.focus();
        } else {
            this.props.updateCourseType(this.props.item._id, { monThiTotNghiep }, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Môn thi tốt nghiệp',
        body: (
            <div>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên môn thi tốt nghiệp' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemTotalScore = e} label='Tổng số câu' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemScore = e} label='Số câu đậu' readOnly={this.props.readOnly} />
                <FormCheckbox ref={e => this.itemDiemLiet = e} isSwitch={true} label='Câu điểm liệt' readOnly={this.props.readOnly} />
            </div>),
    });
}

const backRoute = '/user/course-type';
class CourseTypeEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getCategoryAll('drive-question', null, (items) =>
            this.setState({ types: (items || []).map(item => ({ _id: item._id, text: item.title, count: item.count })) }));
        T.ready(backRoute, () => {
            const route = T.routeMatcher(backRoute + '/:_id'), params = route.parse(window.location.pathname);
            this.props.getCourseType(params._id, item => {
                if (item) {
                    this.setState(item, () => {
                        this.itemTitle.value(item.title || '');
                        this.totalTime.value(item.totalTime || '');
                        this.itemShortDescription.value(item.shortDescription);
                        this.itemDetailDescription.html(item.detailDescription);
                        this.itemProfileType.value(item.profileType?{id:item.profileType._id,text:item.profileType.title}:'');
                        // this.itemPrice.value(item.price);
                        // this.itemIsPriceDisplayed.value(item.isPriceDisplayed);
                        this.itemPracticeNumOfMonths.value(item.practiceNumOfMonths);
                        this.itemPracticeNumOfHours.value(item.practiceNumOfHours);
                        this.itemPracticeNumOfReviewHours.value(item.practiceNumOfReviewHours);
                        this.itemSoLuongCauHoiThi.value(item.soLuongCauHoiThi);
                        this.itemSoLuongCauDat.value(item.soLuongCauDat);
                        // this.itemContentSyntax.value(item.contentSyntax);
                        this.itemImage.setData('course-type:' + item._id);

                        this.itemTitle.focus();
                        item.questionTypes && item.questionTypes.forEach(type => type.amount ?
                            this[type.category] && this[type.category].value(type.amount) : this[type.category] && this[type.category].value(0));
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
            totalTime: this.totalTime.value(),
            shortDescription: this.itemShortDescription.value().trim(),
            detailDescription: this.itemDetailDescription.html(),
            // price: this.itemPrice.value(),
            // isPriceDisplayed: this.itemIsPriceDisplayed.value(),
            profileType:this.itemProfileType.value(),
            practiceNumOfMonths: this.itemPracticeNumOfMonths.value(),
            practiceNumOfHours: this.itemPracticeNumOfHours.value(),
            practiceNumOfReviewHours: this.itemPracticeNumOfReviewHours.value(),
            soLuongCauHoiThi: this.itemSoLuongCauHoiThi.value(),
            soLuongCauDat: this.itemSoLuongCauDat.value(),
            // contentSyntax: this.itemContentSyntax.value().trim().toUpperCase(),
            questionTypes: this.state.types.map(type => ({
                category: type._id,
                amount: this[type._id].value(),
            })),
        };
        if (changes.title == '') {
            T.notify('Tên loại khóa học không được trống!', 'danger');
            this.itemTitle.focus();
        } else if (changes.totalTime == '') {
            T.notify('Thời gian làm bài khóa học không được trống!', 'danger');
            this.totalTime.focus();
        } else {
            this.props.updateCourseType(this.state._id, changes);
        }
    }

    swapMonThiTotNghiep = (e, item, isMoveUp) => {
        e.preventDefault();
        const { _id, monThiTotNghiep = [] } = this.props.courseType.item;
        const index = monThiTotNghiep.findIndex(_item => _item._id == item._id);
        if (isMoveUp) {
            if (index > 0) {
                const preItem = monThiTotNghiep[index - 1];
                monThiTotNghiep[index - 1] = item;
                monThiTotNghiep[index] = preItem;
            } else return;
        } else {
            if (index < monThiTotNghiep.length - 1) {
                const postItem = monThiTotNghiep[index + 1];
                monThiTotNghiep[index + 1] = item;
                monThiTotNghiep[index] = postItem;
            } else return;
        }
        this.props.updateCourseType(_id, { monThiTotNghiep });
    }

    changeDiemLiet = (item, diemLiet) => {
        item.diemLiet = diemLiet;
        this.props.updateCourseType(this.state._id, { monThiTotNghiep: item });
    };

    deleteMonThiTotNghiep = (e, item) => e.preventDefault() || T.confirm('Xoá môn thi tốt nghiệp ', `Bạn có chắc muốn môn thi '${item.title}' khỏi loại khóa học này?`, true, isConfirm =>
        isConfirm && this.props.deleteCourseTypeMonThi(this.state._id, item._id));

    swap = (e, item, isMoveUp) => {
        e.preventDefault();
        const { _id, subjects = [] } = this.props.courseType.item;
        const index = subjects.findIndex(_item => _item._id == item._id);
        if (isMoveUp) {
            if (index > 0) {
                const preItem = subjects[index - 1];
                subjects[index - 1] = item;
                subjects[index] = preItem;
            } else return;
        } else {
            if (index < subjects.length - 1) {
                const postItem = subjects[index + 1];
                subjects[index + 1] = item;
                subjects[index] = postItem;
            } else return;
        }
        this.props.updateCourseType(_id, { subjects });
    }

    render() {
        const types = this.state.types ? this.state.types : [];
        const permissionSubject = this.getUserPermission('subject'),
            permissionCourseType = this.getUserPermission('course-type'),
            readOnly = !permissionCourseType.write,
            courseType = this.props.courseType && this.props.courseType.item ? this.props.courseType.item : { title: '', subjects: [] };

        const tableSubject = renderTable({
            getDataSource: () => courseType.subjects && courseType.subjects,
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
                    {readOnly ? null : <TableCell type='buttons' content={item} permission={permissionCourseType} onSwap={this.swap} onDelete={this.remove} />}
                </tr>),
        });

        const tableMonThiTotNghiep = renderTable({
            getDataSource: () => courseType.monThiTotNghiep,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên môn thi</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Tổng số câu</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số câu đậu</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Câu điểm liệt</th>
                    {readOnly ? null : <th style={{ width: 'auto' }} nowrap='true'>Chỉnh sửa</th>}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.title} />
                    <TableCell type='text' content={item.totalScore} />
                    <TableCell type='text' content={item.score} />
                    <TableCell type='checkbox' content={item.diemLiet} permission={permissionCourseType} onChanged={diemLiet => this.changeDiemLiet(item, diemLiet)} />
                    {readOnly ? null : <TableCell type='buttons' content={item} permission={permissionCourseType} onSwap={this.swapMonThiTotNghiep} onEdit={(e, item,) => e.preventDefault() || this.monThiTotNghiepModal.show(item)} onDelete={this.deleteMonThiTotNghiep} />}
                </tr>),
        });

        const componentInfo = (
            <>
                <div className='row'>
                    <FormImageBox ref={e => this.itemImage = e} label='Hình đại diện' uploadType='CourseTypeImage' image={this.state.image} readOnly={readOnly} className='col-md-3 order-md-12' />
                    <div className='col-md-9 order-md-1'>
                        <div className='row'>
                            <FormTextBox className='col-md-8' ref={e => this.itemTitle = e} label='Tên loại khóa học' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                            <FormTextBox className='col-md-4' ref={e => this.totalTime = e} label='Thời gian làm bài thi' type='number' default='60' readOnly={readOnly} />
                            {/* <FormTextBox className='col-md-8' ref={e => this.itemPrice = e} label='Giá loại khóa học' type='number' readOnly={readOnly} />
                            <FormCheckbox className='col-md-4' ref={e => this.itemIsPriceDisplayed = e} label='Hiển thị giá' readOnly={readOnly} /> */}
                            <FormSelect className='col-md-12' ref = {e=>this.itemProfileType=e} label = 'Hồ sơ đăng ký' data = {ajaxSelectProfileType} readOnly={readOnly}/>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.itemPracticeNumOfMonths = e} label='Số tháng dạy thực hành' type='number' readOnly={readOnly} />
                    <FormTextBox className='col-md-3' ref={e => this.itemPracticeNumOfHours = e} label='Số giờ dạy thực hành' type='number' readOnly={readOnly} />
                    <FormTextBox className='col-md-3' ref={e => this.itemPracticeNumOfReviewHours = e} label='Số giờ ôn tập thực hành' type='number' readOnly={readOnly} />
                    {/* <FormTextBox className='col-md-3' ref={e => this.itemContentSyntax = e} label='Cú pháp' type='text' readOnly={readOnly} /> */}
                    <FormTextBox className='col-md-6' ref={e => this.itemSoLuongCauHoiThi = e} label='Số lượng câu hỏi trong một đề thi' type='number' readOnly={readOnly} />
                    <FormTextBox className='col-md-6' ref={e => this.itemSoLuongCauDat = e} label='Số lượng câu tối thiểu để đậu trong đề thi' type='number' readOnly={readOnly} />

                </div>

                <FormRichTextBox ref={e => this.itemShortDescription = e} label='Mô tả ngắn gọn' readOnly={readOnly} />
                <FormEditor ref={e => this.itemDetailDescription = e} label='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
                {readOnly ? null : <CirclePageButton type='save' onClick={this.save} />}
            </>);
        const componentSubject = <>
            {tableSubject}
            {readOnly ? null : <CirclePageButton type='create' onClick={() => this.modal.show()} />}
            <CourseTypeModal ref={e => this.modal = e} readOnly={!permissionCourseType.write} add={this.props.addCourseTypeSubject} item={courseType} />
        </>;

        const componentMonThiTotNghiep = <>
            {tableMonThiTotNghiep}
            {readOnly ? null : <CirclePageButton type='create' onClick={() => this.monThiTotNghiepModal.show()} />}
            <MonThiTotNghiepModal ref={e => this.monThiTotNghiepModal = e} readOnly={!permissionCourseType.write} updateCourseType={this.props.updateCourseType} item={courseType} />
        </>;

        const componentSetRandomDriveTest = (
            <div className='row'>
                {types.map((item, index) =>
                    <FormTextBox className='col-xl-4 col-md-6' key={index} type='number' ref={e => this[item._id] = e} label={`${item.text} (Tổng: ${item.count})` } readOnly={this.props.readOnly} />)}
                {readOnly ? null : <CirclePageButton type='save' onClick={this.save} />}
            </div>);

        const tabs = [
            { title: 'Thông tin chung', component: componentInfo },
            { title: 'Môn học', component: componentSubject },
            { title: 'Thiết lập môn thi tốt nghiệp', component: componentMonThiTotNghiep },
            { title: 'Thiết lập bộ đề ngẫu nhiên', component: componentSetRandomDriveTest },
        ];

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Loại khóa học: ' + this.state.title,
            breadcrumb: [<Link key={0} to={backRoute}>Loại khóa học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.trainning.courseType });
const mapActionsToProps = { updateCourseType, getCourseType, addCourseTypeSubject, deleteCourseTypeSubject, getCategoryAll, deleteCourseTypeMonThi };
export default connect(mapStateToProps, mapActionsToProps)(CourseTypeEditPage);