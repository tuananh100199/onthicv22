import React from 'react';
import { connect } from 'react-redux';
import { createDangKyTuVan } from './redux.jsx';
class SectionDangKyTuVan extends React.Component {
    constructor(props) {
        super(props);
        this.background = React.createRef();
        this.name = React.createRef();
        this.email = React.createRef();
        this.subject = React.createRef();
        this.message = React.createRef();
        this.phone = React.createRef();
    }
    componentDidMount() {
        // // this.props.getAllAddressByUser(() => {
        //     T.ftcoAnimate();
        //     $(this.background.current).parallax()
        // // });
    }

    componentWillUnmount() {
        $('.parallax-mirror').length != 0 && $(this.background.current).parallax('destroy')
    }

    sendMessage = (e) => {
        e.preventDefault();
        if (this.name.current.value == '') {
            T.notify('Tên bị trống!', 'danger');
            (this.name.current).focus();
        } else if (this.email.current.value == '') {
            T.notify('Email bị trống!', 'danger');
            (this.email.current).focus();
        } else if (!T.validateEmail(this.email.current.value)) {
            T.notify('Email không hợp lệ!', 'danger');
            (this.email.current).focus();
        } else if (this.subject.current.value == '') {
            T.notify('Chủ đề bị trống!', 'danger');
            (this.subject.current).focus();
        } else if (this.message.current.value == '') {
            T.notify('Nội dung bị trống!', 'danger');
            (this.message.current).focus();
        } else if (this.phone.current.value == '') {
            T.notify('Số điện thoại bị trống!', 'danger');
            (this.phone.current).focus();
        } else {
            this.props.createDangKyTuVan({
                name: this.name.current.value,
                email: this.email.current.value,
                subject: this.subject.current.value,
                message: this.message.current.value,
                phone: this.phone.current.value
            }, () => {
                this.name.current.value = this.email.current.value = this.subject.current.value = this.message.current.value = this.phone.current.value = '';
                T.notify('Tin nhắn của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        console.log(this.props.system.user);
        return [
            <div  key={1} className="intro">
                <div className="container">
                    <div className="row">
                    <div className="col-lg-6 intro_col">
                    {this.props.DangKyTuVan && this.props.DangKyTuVan.list && this.props.DangKyTuVan.list.length > 0 ?
                     this.props.DangKyTuVan.list.map((item, index) => (
                    <div className="intro_content"  key={index}>
                        <div className="section_title_container">
                            <div className="section_title"><h2>{item.title}:&nbsp;</h2></div>
                        </div>
                        <div className="intro_text">
                            <p>{item.description}</p>
                        </div>
                        <div className="milestones">
                            <div className="row milestones_row">

                                <div className="col-md-4 milestone_col">
                                    <div className="milestone">
                                        <div className="milestone_counter" data-end-value={5000} data-sign-before="+">0</div>
                                        <div className="milestone_text">Satisfied Patients</div>
                                    </div>
                                </div>
                                <div className="col-md-4 milestone_col">
                                    <div className="milestone">
                                        <div className="milestone_counter" data-end-value={352}>0</div>
                                        <div className="milestone_text">Face Liftings</div>
                                    </div>
                                </div>
                                <div className="col-md-4 milestone_col">
                                    <div className="milestone">
                                        <div className="milestone_counter" data-end-value={718}>0</div>
                                        <div className="milestone_text">Injectibles</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>)): <p>Chưa cập nhật địa chỉ</p>}
                    </div>
                    <div className="col-lg-6 intro_col">
                        <div className="intro_form_container">
                            <div className="intro_form_title">Đăng ký tư vấn</div>
                            <form action="#" className="intro_form" id="intro_form" onSubmit={this.sendMessage}>
                                <div className="d-flex flex-row align-items-start justify-content-between flex-wrap">
                                    <input type="text" className="intro_input" placeholder="Tên"  ref={this.name} required="required" />
                                    <input type="tel" className="intro_input" placeholder="Số điện thoại"  ref={this.phone} required="required" />
                                    <input type='text' className='contact_input w-100' ref={this.email} placeholder='Email' required="required" />
                                    <input type='text' className='contact_input w-100' ref={this.subject} placeholder='Chủ đề' />
                                    <textarea name='message' className='contact_input w-100' ref={this.message} cols='30' rows='10' placeholder='Nội dung' />
                                </div>
                                <button className="button button_1 intro_button trans_200">gửi tin nhắn</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, dangkytuvan: state.dangkytuvan, address: state.address });
const mapActionsToProps = { createDangKyTuVan};
export default connect(mapStateToProps, mapActionsToProps)(SectionDangKyTuVan);
