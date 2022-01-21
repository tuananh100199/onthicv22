import React from 'react';
import { connect } from 'react-redux';
import { getGioiThieu } from './redux/reduxGioiThieuHiepPhat';
import './style.css';

class SectionGioiThieuHiepPhat extends React.Component {
    state = {};
    componentDidMount() {
        $(document).ready(() => {
            function introText() {
                let introText = document.querySelectorAll('.text-gioi-thieu');
                for (let i = 0; i < introText.length; i++) {
                    let windowHeight = window.innerHeight;
                    let elementTop = introText[i].getBoundingClientRect().top;
                    let elementVisible = 150;

                    if (elementTop < windowHeight - elementVisible) {
                        introText[i].classList.add('active_intro_text');
                    } else {
                        introText[i].classList.remove('active_intro_text');
                    }
                }
            }

            window.addEventListener('scroll', introText);

            function introImg() {
                let introImg = document.querySelectorAll('.img-gioi-thieu');

                for (let i = 0; i < introImg.length; i++) {
                    let windowHeight = window.innerHeight;
                    let elementTop = introImg[i].getBoundingClientRect().top;
                    let elementVisible = 150;

                    if (elementTop < windowHeight - elementVisible) {
                        introImg[i].classList.add('active_intro_img');
                    } else {
                        introImg[i].classList.remove('active_intro_img');
                    }
                }
            }

            window.addEventListener('scroll', introImg);
            if (this.props.viewId) {
                this.props.getGioiThieu(this.props.viewId, data => {
                    data && data.item && this.setState(data.item);
                });
            }
        });
    }
    render() {
        const { image1, image2, image3, abstract, abstract2, abstract3, title } = this.state;
        return (
            <div className='section-intro-hp' style={{}}>
                <div className='container'>
                    <div className='warp_gioi_thieu_HP'>
                        <div className='row'>
                            <div className='col-lg-5 col-md-12 text-gioi-thieu'>
                                <div className='title_gioi_thieu'>
                                    Giới thiệu
                                    <span>{title}</span>
                                </div>
                                <div>
                                    <div className='description active_intro_desciption' ref={e => this.abstract1 = e}>
                                        {abstract}<a href='/ve-chung-toi'> Xem thêm &gt;&gt;</a>
                                    </div>
                                    <div style={{ position: 'absolute', top: 0, left: 0 }} className='description' ref={e => this.abstract2 = e}>
                                        {abstract2}<a href='/ve-chung-toi'> Xem thêm &gt;&gt;</a>
                                    </div>
                                    <div style={{ position: 'absolute', top: 0, left: 0 }} className='description' ref={e => this.abstract3 = e}>
                                        {abstract3}<a href='/ve-chung-toi'> Xem thêm &gt;&gt;</a>
                                    </div>
                                </div>

                                {/* <div className='social_gioi_thieu'>
                                    <ul className='social-menu'>
                                        <li><a href='https://facebook.com/'><i className='fa fa-facebook' /></a></li>
                                        <li><a href='https://instagram.com/'><i className='fa fa-instagram' /> </a></li>
                                        <li><a href='https://twitter.com/'><i className='fa fa-twitter' /></a></li>
                                        <li><a href='https://youtube.com/'><i className='fa fa-youtube' /> </a></li>
                                    </ul>
                                </div> */}
                            </div>
                            <div className='col-lg-7 col-md-12 img-gioi-thieu'>
                                <div>
                                    <img src={image1} ref={e => this.img1 = e} className='img-intro1' alt='image 1' onMouseEnter={() => {
                                        this.img1.classList.add('img-intro-zindex');
                                        this.abstract1.classList.add('active_intro_desciption');
                                    }} onMouseLeave={() => this.img1.classList.remove('img-intro-zindex')}
                                    ></img>
                                </div>
                                <div>
                                    <img src={image2} ref={e => this.img2 = e} className='img-intro2' alt='image 2' onMouseLeave={() => {
                                        this.abstract1.classList.add('active_intro_desciption');
                                        this.abstract2.classList.remove('active_intro_desciption');
                                        this.img2.classList.remove('img-intro-zindex');
                                    }} onMouseEnter={() => {
                                        this.abstract2.classList.add('active_intro_desciption');
                                        this.img2.classList.add('img-intro-zindex');
                                        this.abstract1.classList.remove('active_intro_desciption');
                                    }}></img>
                                </div>
                                <div>
                                    <img src={image3} ref={e => this.img3 = e} className='img-intro3' alt='image 3' onMouseLeave={() => {
                                        this.abstract1.classList.add('active_intro_desciption');
                                        this.abstract3.classList.remove('active_intro_desciption');
                                        this.img3.classList.remove('img-intro-zindex');
                                    }} onMouseEnter={() => {
                                        this.abstract3.classList.add('active_intro_desciption');
                                        this.img3.classList.add('img-intro-zindex');
                                        this.abstract1.classList.remove('active_intro_desciption');
                                    }}></img>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getGioiThieu };
export default connect(mapStateToProps, mapActionsToProps)(SectionGioiThieuHiepPhat);
