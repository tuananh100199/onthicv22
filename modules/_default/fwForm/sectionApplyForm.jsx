import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { ajaxGetFormInPage, ajaxGetForm, updateForm } from './redux';
import { Link } from 'react-router-dom';

class SectionApplyForm extends React.Component {
    state = {
        selectedForm: { value: '', label: '', currentSearchValue: '' },
        options: []
    };

    componentDidMount() {
        $(document).ready(() => {
            const handleGetData = (timeOut, done) => {
                if (this.props.formId) {
                    ajaxGetForm(this.props.formId, {}, ({ error, item }) => {
                        if (item) {
                            this.setState({ selectedForm: { value: item._id, label: item.title.viText(), lock: item.lock, active: item.active } });
                        }
                    })
                    done && done();
                } else if (timeOut >= 2000) {
                    done && done();
                } else {
                    setTimeout(() => handleGetData(timeOut + 200, done), 100);
                }
            };
            handleGetData(0, () => {
                ajaxGetFormInPage(1, 30, this.props.pageCondition || {}, data => {
                    if (data.error) {
                        T.notify('Lấy danh sách form bị lỗi!', 'danger');
                    } else {
                        const options = data.page.list.map(item => ({ value: item._id, label: item.title.viText(), lock: item.lock, active: item.active }));
                        this.setState({ options });
                    }
                })
            })
        });
    }

    handleChange = (value) => {
        if (value != this.state.currentSearchValue) {
            this.setState({ currentSearchValue: value });
            const handleTimeOut = (value) => {
                setTimeout(() => {
                    if (value == this.state.currentSearchValue) {
                        const search = { $regex: `.*${value}.*`, $options: 'i' };
                        const pageCondition = this.props.pageCondition ? this.props.pageCondition : {
                            '$or': [
                                { title: search }
                            ]
                        };
                        ajaxGetFormInPage(1, 30, pageCondition, data => {
                            if (data.error) {
                                T.notify('Lấy danh sách form bị lỗi!', 'danger');
                            } else {
                                const options = data.page.list.map(item => ({ value: item._id, label: item.title.viText(), lock: item.lock, active: item.active }));
                                this.setState({ options });
                            }
                        })
                    }
                }, 1000);
            };

            handleTimeOut(value);
        }
    };

    getValue = () => {
        return this.state.selectedForm ? this.state.selectedForm.value : null;
    };

    updateActive = (e, selectedForm) => {
        e.preventDefault();
        this.props.updateForm(selectedForm.value, { active: true }, () => {
            selectedForm.active = true;
            let options = this.state.options;
            let i = 0;
            for (i; i < options.length; i++) {
                if (options[i].value == selectedForm.value) break;
            }
            options.splice(i, 1, selectedForm);
            this.setState({ selectedForm, options });
        });
    };

    updateLock = (e, selectedForm) => {
        e.preventDefault();
        this.props.updateForm(selectedForm.value, { lock: false }, () => {
            selectedForm.lock = false;
            let options = this.state.options;
            let i = 0;
            for (i; i < options.length; i++) {
                if (options[i].value == selectedForm.value) break;
            }
            options.splice(i, 1, selectedForm);
            this.setState({ selectedForm, options });
        });
    };

    setItems = (condition) => {
        ajaxGetFormInPage(1, 30, condition || {}, data => {
            if (data.error) {
                T.notify('Lấy danh sách form bị lỗi!', 'danger');
            } else {
                const options = data.page.list.map(item => ({ value: item._id, label: item.title.viText(), lock: item.lock, active: item.active }));
                this.setState({ options });
            }
        })
    }

    render() {
        const canUpdate = this.props.currentPermission && this.props.currentPermission.contains('form:write');
        return (
            <div className='tile'>
                <h3 className='tile-title'>{this.props.title}</h3>
                <div className='tile-body'>
                    <div className='form-group'>
                        <label>Lựa chọn form</label>
                        <Select placeholder='Lựa chọn form' isSearchable={true}
                            isClearable={true}
                            onInputChange={this.handleChange}
                            onChange={selectedForm => this.setState({ selectedForm })}
                            value={this.state.selectedForm}
                            options={this.state.options}
                        />
                    </div>
                    {this.state.selectedForm && this.state.selectedForm.value ? (
                        <div>
                            <div className='row'>
                                <div className='col-lg-4 col-md-6 col-12'>
                                    <label>Trạng thái kích hoạt</label>
                                </div>
                                <div className='col-lg-8 col-md-6 col-12'>
                                    {this.state.selectedForm.active ?
                                        <p className='text-success'><i>Đã kích hoạt</i></p> :
                                        <p>
                                            <span className='text-danger'>Chưa kích hoạt</span> {canUpdate ? <span>| <span className='text-muted'><small style={{ cursor: 'pointer' }} onClick={e => this.updateActive(e, this.state.selectedForm)}>Kích hoạt?</small></span></span> : ''}
                                        </p>
                                    }
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-lg-4 col-md-6 col-12'>
                                    <label>Trạng thái khóa</label>
                                </div>
                                <div className='col-lg-8 col-md-6 col-12'>
                                    {!this.state.selectedForm.lock ?
                                        <p className='text-success'><i>Đang mở</i></p> :
                                        <p>
                                            <span className='text-danger'>Đã khóa</span> {canUpdate ? <span>| <span className='text-muted'><small style={{ cursor: 'pointer' }} onClick={e => this.updateLock(e, this.state.selectedForm)}>Mở khóa?</small></span></span> : ''}
                                        </p>
                                    }
                                </div>
                                <div className='col-12 text-right'>
                                    <Link to={'/user/form/edit/' + this.state.selectedForm.value} className='text-primary'><i>Chỉnh sửa form</i></Link>
                                </div>
                            </div>
                        </div>
                    ) : ''}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({});
const mapActionToProps = { updateForm };
export default connect(mapStateToProps, mapActionToProps, null, { forwardRef: true })(SectionApplyForm);
