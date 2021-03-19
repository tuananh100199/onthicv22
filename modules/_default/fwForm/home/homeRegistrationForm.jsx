import './theme/icheck-material-custom.min.css';
import './theme/icheck-material.min.css';
import React from 'react';
import { connect } from 'react-redux';
import { addAnswerByUser } from '../reduxAnswer';
import { Link } from 'react-router-dom';

class RegisterElement extends React.Component {
    constructor(props) {
        super(props);
        this.getValue = this.getValue.bind(this);
        this.setFocus = this.setFocus.bind(this);
        this.onSelectType = this.onSelectType.bind(this);
        this.onSiteChanged = this.onSiteChanged.bind(this);

        this.value = React.createRef();
        this.dateInput = React.createRef();
        this.state = { selectedValue: null };
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.dateInput.current).datepicker(T.birthdayFormat);
        });
    }

    onSelectType(selectedItem) {
        this.setState({ selectedValue: selectedItem.value });
    }

    onSiteChanged(e) {
        this.setState({ selectedValue: e.target.value });
    }

    getValue() {
        const element = this.props.element ? this.props.element : null;
        let defaultChoiceValue;
        if (element.typeName === 'choice' || element.typeName === 'multiChoice') {
            let index = parseInt(element.defaultAnswer), valueLength = element.typeValue.length;
            if (!index || 1 > index || index > valueLength) {
                defaultChoiceValue = element.typeValue[0];
            } else defaultChoiceValue = element.typeValue[index - 1];
        }
        if (element && element.active === false) {
            if (element.typeName === 'choice' || element.typeName === 'multiChoice') {
                return defaultChoiceValue;
            } else if (element.typeName === 'date') {
                return T.dateToText(new Date());
            } else {
                return this.props.element.defaultAnswer;
            }
        } else if (element && element.typeName === 'choice') {
            return this.state.selectedValue ? this.state.selectedValue : defaultChoiceValue;
        } else if (element && element.typeName === 'multiChoice') {
            let value = '';
            $('input[id*=checkbox' + element._id + ']:checked').each((index, val) => value += ';' + val.value);
            return value ? value.substring(1) : '';
        } else if (element && element.typeName === 'date') {
            return $(this.dateInput.current).val();
        } else {
            return $(this.value.current).val();
        }
    }

    setFocus(e) {
        $(this.value.current).focus();
        e.preventDefault();
    }

    render() {
        const item = this.props.element ? this.props.element : {
            _id: '',
            content: '',
            active: false,
            typeName: '',
            typeValue: []
        },
            questionContent = <div className='row'>
                <div className='col-auto'>
                    <p><strong>{this.props.index != null ? (this.props.index + 1) + '. ' : ' '}</strong></p>
                </div>
                <div className='col' style={{ marginLeft: '-15px' }}>
                    <p className='content-style' dangerouslySetInnerHTML={{ __html: item.content }} />
                </div>
            </div>;
        if (item.active) {
            if (item.typeName == 'choice') {
                return <div className='form-group'>
                    {questionContent}
                    {item.typeValue.map((value, index) => (
                        <div key={index} className='icheck-material-red'>
                            <input
                                className='hidden' type='radio' id={'radio' + item._id + index.toString()}
                                value={value} checked={this.state.selectedValue === value} onChange={this.onSiteChanged} />
                            <label className='entry' htmlFor={'radio' + item._id + index.toString()}>
                                <div className='circle' />
                                <div className='entry-label'>{value}</div>
                            </label>
                        </div>
                    ))}
                </div>;
            } else if (item.typeName === 'multiChoice') {
                return (
                    <div className='form-group'>
                        {questionContent}
                        {item.typeValue.map((value, index) => (
                            <div key={index} className='icheck-material-red'>
                                <input type='checkbox' id={'checkbox' + item._id + index} value={value} />
                                <label htmlFor={'checkbox' + item._id + index}>{value}</label>
                            </div>
                        ))}
                    </div>
                )
            } else if (item.typeName === 'date') {
                return (
                    <div className='form-group'>
                        {questionContent}
                        <input type='text' className='form-control' autoComplete='off' id={(this.props.index).toString()} ref={this.dateInput} />
                    </div>
                );
            } else if (item.typeName === 'textArea') {
                return (
                    <div className='form-group'>
                        {questionContent}
                        <textarea rows={4} className='form-control' autoComplete='off' id={(this.props.index).toString()}
                            ref={this.value} />
                    </div>
                );
            } else {
                return (
                    <div className='form-group'>
                        {questionContent}
                        <input type='text' className='form-control' autoComplete='off' id={(this.props.index).toString()}
                            ref={this.value} />
                    </div>
                );
            }
        } else return null;
    }
}

class HomeRegistrationForm extends React.Component {
    constructor(props) {
        super(props);
        this.valueList = [];
        for (let i = 0; i < 300; i++) {
            this.valueList[i] = React.createRef();
        }

        this.state = { total: 0 };
    }

    submit = (e) => {
        const { formId, questions, system } = this.props;
        const userId = system.user ? system.user._id : null;
        if (userId == null) {
            T.notify('Bạn chưa đăng nhập!', 'danger');
            e.preventDefault();
            return;
        }
        let record = [];
        let i = 0;
        for (i; i < questions.length; i++) {
            const value = this.valueList[i].current.getValue();
            if (!value || value == '') {
                T.notify('Xin vui lòng nhập đầy đủ thông tin', 'danger');
                this.valueList[i].current.setFocus(e);
                break;
            } else {
                record.push({
                    questionId: questions[i]._id,
                    answer: value,
                });
            }
        }
        if (i == questions.length) {
            const newData = { user: userId, formId, record, };
            this.props.addAnswerByUser(newData);
        }
        e.preventDefault();
    };

    render() {
        const { className, formId, formInfo, questions, system } = this.props;
        const createForm = () => {
            if (system && system.user && system.user._id && formId) {
                const { startRegister, stopRegister, maxRegisterUsers, numOfRegisterUsers } = formInfo ? formInfo : {
                    startRegister: null,
                    stopRegister: null,
                    maxRegisterUsers: -1,
                    numOfRegisterUsers: 0
                };
                const currentTime = new Date();
                if (startRegister && currentTime < new Date(startRegister)) {
                    return <p>Chưa đến ngày mở đăng ký</p>;
                }
                if (stopRegister && currentTime > new Date(stopRegister)) {
                    return <p>Đã quá hạn đăng ký tham gia</p>;
                }
                if (maxRegisterUsers >= 0 && numOfRegisterUsers >= maxRegisterUsers) {
                    return <p>Đã đủ số lượng đăng ký tham gia</p>;
                }
                if (!questions || questions.length == 0) {
                    return <p>Không có form đăng ký từ sự kiện này</p>;
                }

                let form = [];
                for (let i = 0; i < questions.length; i++) {
                    form.push(<RegisterElement key={i} element={questions[i]} index={i} ref={this.valueList[i]} />);
                }
                form.push(<button key='button' className='btn btn-primary'
                    onClick={this.submit}>Gửi form</button>);
                return form;
            } else {
                return <p>Bạn chưa đăng nhập! | <Link to={'/request-login?formId=' + formId} className='text-primary'><small>Đăng nhập?</small></Link></p>;
            }
        };

        return (
            <div className={'col-12 col-md-8 ' + className}>
                {createForm()}
            </div>
        );
    }
}

const mapStateToProps = state => ({ answer: state.answer, system: state.system });
const mapActionsToProps = { addAnswerByUser };
export default connect(mapStateToProps, mapActionsToProps)(HomeRegistrationForm);
