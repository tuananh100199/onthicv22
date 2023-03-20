import React from 'react';
import { connect } from 'react-redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { getDriveQuestionPage, createDriveQuestion, updateDriveQuestion, swapDriveQuestion, deleteDriveQuestion, deleteDriveQuestionImage, changeDriveQuestion, getDriveQuestionItem } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormCheckbox, FormRichTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class QuestionModal extends AdminModal {
    state = { answers: '' };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, active, image, answers, trueAnswer, importance, categories } = item || { title: '', active: true, answers: '', trueAnswer: 0, importance: false, categories: [] };
        this.itemTitle.value(title);
        // this.itemImage.setData(`driveQuestion:${_id || 'new'}`);
        this.itemAnswers.value(answers);
        this.itemCategories.value(categories.some(item => item._id) ? categories.map(({_id})=> _id) : categories);
        this.itemIsImportance.value(importance);
        this.itemIsActive.value(active);
        this.setState({ _id, image, answers, trueAnswer });
    }

    onSubmit = () => {
        const answers = this.state.answers.split('\n'),
            data = {
                title: this.itemTitle.value(),
                answers: this.state.answers,
                trueAnswer: this.state.trueAnswer < answers.length ? this.state.trueAnswer : 0,
                categories: this.itemCategories.value(), 
                // categories: '606ab9b7c3722d33582125fd', // Toát yếu
                // categories: '63216cc5b17dfe1c4ce5712c', // Cựu ước
                //  categories: '63217987319bab3208c88f44', // Tân ước
                // categories: '634cb46410d3f73b74f96650',  // Lịch sử GHVN
                // categories: '63f601b2620ae8251001de87',  // Phụng vụ + bí tích3
                // categories: '606a7fa9aeeed4180cbe5fa9', // Công đồng + văn kiện giáo hội
                // categories: '632abe1015158804a86ba6be', // Xã hội + triết học
                // categories: '606146bab43e9811489116de', // Các thánh + nhân vật nổi tiếng
                //  categories: '640a7a322152ad0cbc2afa16', // 1001 Câu giáo lý phổ thông
                //  categories: '64107a1b285caa0708575773', // 1800 Câu cựu ước
                //  categories: '6415ce693a79913038aba012', // TOÁT YẾU TỰ SOẠN

                active: this.itemIsActive.value(),
                importance: this.itemIsImportance.value(),
                image: this.state.image,
            };
        if (data.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.answers == '') {
            T.notify('Câu trả lời bị trống!', 'danger');
            this.itemAnswers.focus();
        } else if (data.trueAnswer == null) {
            T.notify('Đáp án bị trống!', 'danger');
        } else {
            this.state._id ? this.props.update(this.state._id, data) : this.props.create(data);
            this.hide();
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change(item);
        }
    }

    setTrueAnswer = (e, trueAnswer) => e.preventDefault() || this.setState({ trueAnswer });

    deleteImage = () => T.confirm('Xoá hình minh họa', 'Bạn có chắc bạn muốn xoá hình minh họa này?', true, isConfirm =>
        isConfirm && this.props.deleteImage(this.state._id, () => this.setState({ image: null })));

    render = () => {
        const readOnly = this.props.readOnly,
            answers = this.state.answers.split('\n'),
            trueAnswer = this.state.trueAnswer < answers.length ? this.state.trueAnswer : 0,
            defaultStyle = { width: '40px', height: '40px', lineHeight: '40px', borderRadius: '50%', textAlign: 'center', marginLeft: '8px', cursor: 'pointer' },
            listAnswers = [],
            listTrueAnswers = answers.map((item, index) => {
                listAnswers.push(<p key={index}>{index + 1}. {item}</p>);
                const trueAnswerStyle = trueAnswer == index ? { color: 'white', backgroundColor: '#28a745' } : {};
                return <label key={index} style={{ ...defaultStyle, ...trueAnswerStyle }} onClick={e => !readOnly && this.setTrueAnswer(e, index)}>{index + 1}</label>;
            });
        return this.renderModal({
            title: 'Câu hỏi mới',
            size: 'large',
            body: <div className='row'style={{ fontFamily:  this.itemCategories && this.itemCategories.value() == '606ab9b7c3722d33582125fd' ? 'VNI-Aptima' : 'Times New Roman' }}>
                {/* <FormRichTextBox ref={e => this.itemTitle = e} className='col-md-8' style={{ fontFamily: 'VNI-Aptima' }} label='Câu hỏi' rows='6' readOnly={readOnly} /> Toát yếu dùng aptima */}
                <FormRichTextBox ref={e => this.itemTitle = e} className='col-md-8'  label='Câu hỏi' rows='6' readOnly={readOnly} />

                {/* <FormImageBox ref={e => this.itemImage = e} className='col-md-4' label='Hình minh họa' uploadType='DriveQuestionImage' image={this.state.image}
                    onDelete={this.deleteImage} onSuccess={this.onUploadSuccess} readOnly={readOnly} /> */}

                {/* <FormRichTextBox ref={e => this.itemAnswers = e} className='col-md-12' label='Danh sách câu trả lời' rows='5' onChange={e => this.setState({ answers: e.target.value })} readOnly={readOnly} style={{ display: readOnly ? 'none' : 'block', fontFamily: 'VNI-Aptima' }} /> Toát yếu dùng aptima */}
                <FormRichTextBox ref={e => this.itemAnswers = e} className='col-md-12' label='Danh sách câu trả lời' rows='5' onChange={e => this.setState({ answers: e.target.value })} readOnly={readOnly} style={{ display: readOnly ? 'none' : 'block' }} />

                <div className='col-md-12' style={{ display: readOnly ? 'block' : 'none' }}>
                    <label>Danh sách câu trả lời</label>
                    <b>{listAnswers}</b>
                </div>
                <label className='col-md-12'>Đáp án:{listTrueAnswers}</label>

                <FormSelect ref={e => this.itemCategories = e} className='col-md-12' data={this.props.questionTypes} multiple={true} label='Loại câu hỏi' readOnly={readOnly} />

                <FormCheckbox ref={e => this.itemIsImportance = e} className='col-md-6' style={{ color: 'red' }} label='Câu điểm liệt' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemIsActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class AdminQuestionPage extends AdminPage {
    state = { questionTypes: [] };
    componentDidMount() {
        T.ready('/user/drive-question', () => T.showSearchBox());
        this.props.getCategoryAll('drive-question', null, (items) =>
            this.setState({ questionTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
        this.props.getDriveQuestionPage(1);
        T.onSearch = (searchText) => this.props.getDriveQuestionPage(1, 50, searchText);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('modal')) {
            const _id = urlParams.get('modal');
            if(_id && typeof _id == 'string'){
                this.props.getDriveQuestionItem(_id, ({item}) => item && this.modal.show(item));
            }
        }
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    swap = (e, questionId, isMoveUp) => e.preventDefault() || this.props.swapDriveQuestion(questionId, isMoveUp);
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa câu hỏi thi', 'Bạn có chắc bạn muốn xóa câu hỏi thi này?', true, isConfirm =>
        isConfirm && this.props.deleteDriveQuestion(item._id));

    render() {
        const permission = this.getUserPermission('driveQuestion');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.driveQuestion && this.props.driveQuestion.page ?
            this.props.driveQuestion.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Câu hỏi</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Loại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Câu điểm liệt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ fontFamily:  item.categories && item.categories[0] && item.categories[0]._id == '606ab9b7c3722d33582125fd' ? 'VNI-Aptima' : 'Times New Roman' }} content={item.title} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.categories && item.categories[0] ? item.categories[0].title : ''} />
                    <TableCell type='checkbox' content={item.importance} permission={permission} onChanged={importance => this.props.updateDriveQuestion(item._id, { importance })} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateDriveQuestion(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swap} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Câu hỏi thi',
            breadcrumb: ['Câu hỏi thi'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageDriveQuestion' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDriveQuestionPage} />
                <QuestionModal ref={e => this.modal = e} questionTypes={this.state.questionTypes} readOnly={!permission.write}
                    create={this.props.createDriveQuestion} update={this.props.updateDriveQuestion} change={this.props.changeDriveQuestion} deleteImage={this.props.deleteDriveQuestionImage} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveQuestion: state.trainning.driveQuestion, category: state.framework.category });
const mapActionsToProps = { getCategoryAll, getDriveQuestionPage, createDriveQuestion, updateDriveQuestion, swapDriveQuestion, deleteDriveQuestion, deleteDriveQuestionImage, changeDriveQuestion, getDriveQuestionItem };
export default connect(mapStateToProps, mapActionsToProps)(AdminQuestionPage);