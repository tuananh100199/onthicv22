import React from 'react';
import { connect } from 'react-redux';
import { createDangKyTuVanListItem,  } from './redux/reduxDangKyTuVanList.jsx';
import { getDangKyTuVanByUser, getAllDangKyTuVan } from './redux/reduxDangKyTuVan.jsx';
import { getAllCourseType } from '../fwCourseType/redux.jsx';
import Dropdown from '../../view/component/Dropdown.jsx';

class SectionDangKyTuVan extends React.Component {
    state = { item: {} };
    constructor(props) {
        super(props);
        this.firstname = React.createRef();
        this.lastname = React.createRef();
        this.email = React.createRef();
        this.phone = React.createRef();
    }
    componentDidMount() {
        $(document).ready(() => {
            if (this.props.dangKyTuVanId) {
                this.props.getDangKyTuVanByUser(this.props.dangKyTuVanId, data => {
                    if (data) {
                        this.setState({ item: data });
	                    var ctrl = new ScrollMagic.Controller();

                        "use strict";
	                    initMilestones();
                        
                        function initMilestones()
                        {
                            if($('.milestone_counter').length)
                            {
                                var milestoneItems = $('.milestone_counter');

                                milestoneItems.each(function(i)
                                        
                                {   
                                    var ele = $(this);
                                    var endValue = ele.data('end-value');
                                    var eleValue = ele.text();

                                    /* Use data-sign-before and data-sign-after to add signs
                                    infront or behind the counter number */
                                    var signBefore = "";
                                    var signAfter = "";

                                    if(ele.attr('data-sign-before'))
                                    {
                                        signBefore = ele.attr('data-sign-before');
                                    }

                                    if(ele.attr('data-sign-after'))
                                    {
                                        signAfter = ele.attr('data-sign-after');

                                    }

                                    var milestoneScene = new ScrollMagic.Scene({
                                        triggerElement: this,
                                        triggerHook: 'onEnter',
                                        reverse:false
                                    })
                                    .on('start', function()
                                    {
                                        var counter = {value:eleValue};
                                        var counterTween = TweenMax.to(counter, 4,
                                        {
                                            value: endValue,
                                            roundProps:"value", 
                                            ease: Circ.easeOut, 
                                            onUpdate:function()
                                            {
                                                document.getElementsByClassName('milestone_counter')[i].innerHTML = signBefore + counter.value + signAfter;
                                            }
                                        });
                                    })
                                    .addTo(ctrl);
                                });
                            }
                        }
                        let { _id, title, formTitle, description, statistic, courseType} = data;
                        $('#title').val(title).focus();
                        $('#formTitle').val(formTitle);
                        $('#description').val(description);
                    } else {
                        // this.props.history.push('/user/component');
                    }
                    this.props.getAllCourseType( datacType => {
                        if(datacType){
                            this.props.getAllDangKyTuVan(dataDKTV => {
                                let courseType = dataDKTV ? dataDKTV.map(item => ({id: item._id, text: item.title})) : null;
                                $('#courseType').select2({ data: courseType}).val(courseType.title).trigger('change');
                            }); 
                        }
                    });
                });
            }
            $('#courseType').select2();  
        })
    }
    sendMessage = (e) => {
        e.preventDefault();
        const courseType = $('#courseType').val();
        if (this.firstname.current.value == '') {
            T.notify('Họ bị trống!', 'danger');
            (this.firstname.current).focus();
        } else if (this.lastname.current.value == '') {
            T.notify('Tên bị trống!', 'danger');
            (this.lastname.current).focus();
        }else if (this.email.current.value == '') {
            T.notify('Email bị trống!', 'danger');
            (this.email.current).focus();
        } else if (!T.validateEmail(this.email.current.value)) {
            T.notify('Email không hợp lệ!', 'danger');
            (this.email.current).focus();
        } else if (this.phone.current.value == '') {
            T.notify('Số điện thoại bị trống!', 'danger');
            (this.phone.current).focus();
        } else if(courseType === null) {
            T.notify('Vui lòng chọn loại khóa học!', 'danger');
            $('#courseType').focus();
        }else {
            this.props.createDangKyTuVanListItem(
                {
                parentId: courseType,
                firstname: this.firstname.current.value,
                lastname: this.lastname.current.value,
                email: this.email.current.value,
                phone: this.phone.current.value
            }, () => {
                this.firstname.current.value = this.lastname.current.value = this.email.current.value = this.phone.current.value = '';
                T.notify('Tin nhắn của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        const item = this.state.item ? this.state.item : {
            title :'', formTitle:'',description:''
        };
        return (
            <div  key={1} className="intro">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 intro_col">
                            <div className="intro_content" >
                            <div className="section_title_container">
                                <div className="section_title" id='title'><h2>{item.title}&nbsp;</h2></div>
                            </div>
                            <div className="intro_text" id='description'>
                                <p dangerouslySetInnerHTML={{ __html: item.description }} />
                            </div>
                            <div className="milestones">
                                <div className="row milestones_row">
                               {item.statistic ? this.state.item.statistic.map((i, index) => (
                                    <div className="col-md-4 milestone_col" key={index}>
                                        <div className="milestone">
                                        <div className="milestone_counter" data-end-value={i.number} data-sign-before="+">0</div>
                                        <div className="milestone_text">{i.title}</div>
                                        </div>
                                    </div>
                                    )) : null};
                                </div>
                            </div>
                        </div>
                            </div>
                        <div className="col-lg-6 intro_col">
                            <div className="intro_form_container">
                                <div className="intro_form_title" id="formTitle">{item.formTitle}</div>
                                <form action="#" className="intro_form" id="intro_form" onSubmit={this.sendMessage}>
                                    <div className="d-flex flex-row align-items-start justify-content-between flex-wrap">
                                        
                                        <input type="text" className="intro_input" placeholder="Họ"  ref={this.lastname} required="required" />
                                        <input type="text" className="intro_input" placeholder="Tên"  ref={this.firstname} required="required" />
                                        <select className='form-control col-6 contact_input' id='courseType' defaultValue={null} multiple={false} >
                                            {/* <optgroup className='form-control' label='Lựa chọn loại khóa học' /> */}
                                        </select>
                                        <input type="tel" className="contact_input" placeholder="Số điện thoại"  ref={this.phone} required="required" />
                                        <input type='text' className='contact_input w-100' ref={this.email} placeholder='Email' required="required" />
                                    </div>
                                    <button className="button button_1 intro_button trans_200">gửi tin nhắn</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, address: state.address });
const mapActionsToProps = {getAllDangKyTuVan, createDangKyTuVanListItem, getDangKyTuVanByUser, getAllCourseType};
export default connect(mapStateToProps, mapActionsToProps)(SectionDangKyTuVan);
