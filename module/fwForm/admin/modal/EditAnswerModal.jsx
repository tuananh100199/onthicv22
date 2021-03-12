import React from 'react';
import { connect } from 'react-redux';
import { updateAnswer } from '../../reduxAnswer';
import AdminRegisterElement from './AdminRegisterElement';

class EditAnswerModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();

        this.valueList = [];
        for (let i = 0; i < 300; i++) {
            this.valueList[i] = React.createRef();
        }

        this.state = { item: null }
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('hidden.bs.modal', () => {
                this.setState({ item: null });
            });
        });
    }

    show = (item) => {
        this.setState({ item });
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).modal('show'), 250);
        });
    };

    hide = () => {
        $(this.modal.current).modal('hide');
    };

    save = (e, item) => {
        const questionList = this.props.questions ? this.props.questions : [];
        let record = [];
        let i = 0;
        for (i; i < questionList.length; i++) {
            record.push(
                {
                    questionId: questionList[i]._id,
                    answer: this.valueList[i].current.getValue()
                }
            );
        }

        if (i == questionList.length) {
            const changes = { record };
            this.props.updateAnswer(item._id, changes, () => {
                T.notify('Thay đổi câu trả lời thành công!', 'success');
                this.hide();
            });
        } else {
            T.notify('Chỉnh sửa đăng ký tham gia bị lỗi!', 'danger');
        }
        e.preventDefault();
    };

    render() {
        if (this.state.item) {
            const item = this.state.item;
            const questionList = this.props.questions ? this.props.questions : [];
            const readOnly = this.props.readOnly;
            const createForm = (record) => {
                let answers = {};
                record.map(item => answers[item.questionId] = item.answer);
                if (!questionList || questionList.length == 0) {
                    return <p>Null</p>;
                }
                let form = [];
                for (let i = 0; i < questionList.length; i++) {
                    form.push(<AdminRegisterElement key={item._id + i} ref={this.valueList[i]} element={questionList[i]} index={i} answer={answers[questionList[i]._id]} />);
                }

                return form;
            };

            return (
                <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                    <form className='modal-dialog modal-lg' role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Chỉnh sửa câu trả lời</h5>
                                <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                            </div>
                            <div className='modal-body'>
                                <div className=''>
                                    {createForm(item && item.record ? item.record : [])}
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                                {!readOnly ? <button type='button' className='btn btn-primary' onClick={e => this.save(e, item)}>Lưu</button> : ''}
                            </div>
                        </div>
                    </form>
                </div>
            );
        } else {
            return null;
        }

    }
}

const mapStateToProps = state => ({});
const mapActionsToProps = { updateAnswer };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(EditAnswerModal);
