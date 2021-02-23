import React from 'react';
import { connect } from 'react-redux';
import { createContact } from './redux.jsx';
import { getAllAddressByUser } from '../../module/fwAddress/redux.jsx'

class SectionContact extends React.Component {
    constructor(props) {
        super(props);
        this.name = React.createRef();
        this.email = React.createRef();
        this.subject = React.createRef();
        this.message = React.createRef();
    }
    componentDidMount() {
        this.props.getAllAddressByUser(() => {
            T.ftcoAnimate();
        });
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
        } else {
            this.props.createContact({
                name: this.name.current.value,
                email: this.email.current.value,
                subject: this.subject.current.value,
                message: this.message.current.value
            }, () => {
                this.name.current.value = this.email.current.value = this.subject.current.value = this.message.current.value = '';
                T.notify('Tin nhắn của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        let { addressList, mobile, email, map, latitude, longitude } = this.props.system ? this.props.system : { addressList: JSON.stringify([]), map: '', latitude: 0, longitude: 0 };
        const mapUrl = 'https://www.google.com/maps/@' + latitude + ',' + longitude + ',16z';

        const styles = {
            border: {
                borderBottom: 'solid 1px lightgray',
            },
            noBorder: {
                borderBottom: 'none',
            }
        };
        try {
            addressList = JSON.parse(addressList);
        } catch (e) {
            console.error(e)
        }

        return [
            <div key={0} className='justify-content-center pb-3'>
                <div className='col-md-12 heading-sections text-center'>
                    <h2 className='mb-4'>Liên hệ</h2>
                </div>
            </div>,
            <a key={1} href={mapUrl} target='_blank'>
                <div key={0} className='map-area' style={{ height: '300px', background: 'url(' + map + ') no-repeat center center' }} />
            </a>,
            <section key={2} className='contact-area mt-30'>
                <div className='container'>
                    <div className='row d-flex mb-5 contact-info'>

                        <div className="col-md-12 mb-4">
                            <h2 className="h4">Thông tin liên lạc</h2>
                        </div>
                        <div className="w-100"></div>
                        {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                            this.props.address.list.map((item, index) => (
                                [
                                    <div className="col-md-3" >
                                        <p><strong>{item.title}</strong>:&nbsp;{item.address}</p>
                                    </div>,
                                    <div className="col-md-3" >
                                        <p><span>Điện thoại:</span> <a href={'tel:' + item.phoneNumber}>{item.phoneNumber}</a></p>
                                    </div>,
                                    <div className="col-md-3" >
                                        <p><span>Di động:</span> <a href={'tel:' + item.mobile}>{item.mobile}</a></p>
                                    </div>,
                                    <div className="col-md-3">
                                        <p><span>Email:</span> <a href={'mailto:' + item.email}>{item.email}</a></p>
                                    </div>
                                ]
                            )) : <p>Chưa cập nhật địa chỉ</p>}


                        <div className='col-12 col-lg-6 mb-30'>
                            <div className='contact-form'>
                                <h4>Liên lạc</h4>
                                <form onSubmit={this.sendMessage} className='row'>
                                    <div className='col-12'>
                                        <input type='text' className='form-control' ref={this.name} placeholder='Tên' />
                                    </div>
                                    <div className='col-12'>
                                        <input type='email' className='form-control' ref={this.email} placeholder='Email' />
                                    </div>
                                    <div className='col-12'>
                                        <input type='text' className='form-control' ref={this.subject} placeholder='Chủ đề' />
                                    </div>

                                    <div className='col-12'>
                                        <textarea name='message' className='form-control' ref={this.message} cols='30' rows='10' placeholder='Nội dung' />
                                    </div>
                                    <div className='col-12'>
                                        <button className='btn clever-btn btn-primary w-100'>Gửi tin nhắn</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className='col-12 col-lg-6 mb-30'>
                            {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                <div id='carouselFooter' className='carousel ftco-animate' data-ride='carousel' data-interval='5000' style={{ height: 'auto' }}>
                                    <div className='carousel-inner'>
                                        {
                                            this.props.address.list.map((item, index) => (
                                                <div className={'carousel-item' + (index == 0 ? ' active' : '')}
                                                    key={index}
                                                    style={{
                                                        height: '400px',
                                                        backgroundImage: `url('${T.url(item.image)}')`,
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center center',
                                                        border: '1px solid gray',
                                                        backgroundSize: 'cover',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => window.open(item.mapURL, '_blank')}>

                                                    <span className='text-primary' style={{ position: 'fixed', bottom: '10px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>{item.title}</span>
                                                </div>))}
                                    </div>
                                    <a className='carousel-control-prev' href='#carouselFooter' role='button' data-slide='prev' style={{ opacity: 1 }}>
                                        <span className='carousel-control-prev-icon' style={{ backgroundColor: '#4ca758', backgroundSize: '70% 70%' }} />
                                        <span className='sr-only'>Previous</span>
                                    </a>
                                    <a className='carousel-control-next' href='#carouselFooter' role='button' data-slide='next' style={{ opacity: 1 }}>
                                        <span className='carousel-control-next-icon' style={{ backgroundColor: '#4ca758', backgroundSize: '70% 70%' }} />
                                        <span className='sr-only'>Next</span>
                                    </a>
                                </div> : <p>Chưa cập nhật địa chỉ</p>
                            }

                        </div>
                    </div>
                </div>
            </section >
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, address: state.address });
const mapActionsToProps = { createContact, getAllAddressByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionContact);