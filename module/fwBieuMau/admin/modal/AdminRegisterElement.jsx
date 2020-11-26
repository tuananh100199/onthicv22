import React from 'react';

export default class AdminRegisterElement extends React.Component {
    constructor(props) {
        super(props);
        this.getValue = this.getValue.bind(this);
        this.onSiteChanged = this.onSiteChanged.bind(this);
        this.setData = this.setData.bind(this);

        this.value = React.createRef();
        this.dateInput = React.createRef();
        this.state = { selectedValue: null, answer: null };
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.dateInput.current).datepicker(T.birthdayFormat);
        });
    }

    componentDidUpdate() {
        $(document).ready(() => {
            setTimeout(() => {
                $(this.value.current).val(this.props.answer);
                $(this.dateInput.current).val(this.props.answer);
            }, 100);
        });
    }

    componentWillUnmount() {
        this.setState({ selectedValue: null, answer: null });
    }

    onSiteChanged(e) {
        this.setState({ selectedValue: e.target.value });
    }

    setData(type, value) {
        switch (type) {
            case 'textArea': {
                $(this.value.current).val(value);
                break;
            }

            case 'choice': {
                this.setState({ selectedValue: value });
                break;
            }

            case 'multiChoice' : {
                const element = this.props.element ? this.props.element : null;
                $('input[name=checkbox' + this.props.index + element._id + ']').each((index, val) => {
                    $(val).prop('checked', false);
                    if (val.value == value) {
                        $(val).prop('checked', true);
                    }
                });
                break;
            }

            case 'date': {
                $(this.dateInput.current).val(T.dateToText(new Date(), T.birthdayFormat.format));
                break;
            }

            default: {
                $(this.value.current).val(value);
                break;
            }

        }
    }

    getValue() {
        const element = this.props.element ? this.props.element : { _id: '' };
        let defaultChoiceValue = this.props.answer ? this.props.answer : '';
        if (!this.props.answer && (element.typeName == 'choice' || element.typeName == 'multiChoice')) {
            let index = parseInt(element.defaultAnswer), valueLength = element.typeValue.length;
            if (!index || 1 > index || index > valueLength) {
                defaultChoiceValue = element.typeValue[0];
            } else {
                defaultChoiceValue = element.typeValue[index - 1];
            }
        }
        if (element) {
            if (!element.active) {
                switch (element.typeName) {
                    case 'choice':
                        return defaultChoiceValue;

                    case 'multiChoice':
                        return defaultChoiceValue;

                    case 'date':
                        return T.dateToText(new Date());

                    default:
                        return element.defaultAnswer;
                }
            } else {
                switch (element.typeName) {
                    case 'choice':
                        return this.state.selectedValue ? this.state.selectedValue : defaultChoiceValue;

                    case 'multiChoice': {
                        let value = '';
                        $('input[name=checkbox' + this.props.index + element._id + ']:checked').each((index, val) => value += ';' + val.value);
                        return value ? value.substring(1) : '';
                    }

                    case 'date':
                        return $(this.dateInput.current).val();

                    default:
                        return $(this.value.current).val();
                }
            }
        } else {
            return null;
        }

    }

    render() {
        const item = this.props.element ? this.props.element : {
                _id: '', content: '', typeName: '', active: false, typeValue: []
            }, answer = this.props.answer ? this.props.answer : null,
            questionContent = (
                <div className='container'>
                    <div className='row'>
                        <div className='col align-self-start'>
                            <span>{this.props.index + 1}</span>
                        </div>
                        <div className='col-auto align-self-end'>
                            <p key='label' dangerouslySetInnerHTML={{ __html: item.content }}/>
                        </div>
                    </div>
                </div>
            );
        if (item.active) {
            switch (item.typeName) {
                case 'choice': {
                    return <div className='form-group'>
                        <label style={{ marginLeft: '-15px' }}>{questionContent}</label>
                        {item.typeValue.map((value, index) => (
                            <div key={index} className='animated-radio-button'>
                                <label>
                                    <input type='radio' id={'radio' + item._id + index.toString()}
                                           value={value}
                                           checked={(this.state.selectedValue ? this.state.selectedValue : (answer ? answer : '')) === value}
                                           onChange={this.onSiteChanged}/><span className='label-text'>{value}</span>
                                </label>
                            </div>
                        ))}
                    </div>;
                }

                case 'multiChoice': {
                    const answers = answer ? answer.split(';') : [];
                    let mappingAnswer = {};
                    answers.forEach(answer => mappingAnswer[answer] = true);
                    const list = item.typeValue.map((value, index) => {
                        return (
                            <div key={index} className='animated-checkbox'>
                                <label>
                                    <input type='checkbox' value={value} name={'checkbox' + this.props.index + item._id}
                                           defaultChecked={mappingAnswer[value] != null}/><span
                                    className='label-text'>{value}</span>
                                </label>
                            </div>
                        );
                    });
                    return (
                        <div className='form-group'>
                            <label style={{ marginLeft: '-15px' }}>{questionContent}</label>
                            {list}
                        </div>
                    );
                }

                case 'date': {
                    return (
                        <div className='form-group'>
                            <label htmlFor={(this.props.index).toString()}
                                   style={{ marginLeft: '-15px' }}>{questionContent}</label>
                            <div className='input-group'>
                                <div className='input-group-prepend'>
                                    <span className='input-group-text'><i className='fa fa-calendar'/></span>
                                </div>
                                <input className='form-control' id={(this.props.index).toString()}
                                       type='text' ref={this.dateInput} defaultValue={answer ? answer : ''} />
                            </div>
                        </div>
                    );
                }

                case 'textArea': {
                    return (
                        <div className='form-group'>
                            <label htmlFor={(this.props.index).toString()}
                                   style={{ marginLeft: '-15px' }}>{questionContent}</label>
                            <textarea className='form-control' id={(this.props.index).toString()} rows={5}
                                      defaultValue={answer ? answer : ''} ref={this.value}/>
                        </div>
                    );
                }

                default: {
                    return (
                        <div className='form-group'>
                            <label htmlFor={(this.props.index).toString()}
                                   style={{ marginLeft: '-15px' }}>{questionContent}</label>
                            <input type='text' className='form-control' id={(this.props.index).toString()}
                                   defaultValue={answer ? answer : ''} ref={this.value}/>
                        </div>
                    );
                }
            }
        } else {
            return null;
        }
    }
}
