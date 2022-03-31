import React from 'react';
import { connect } from 'react-redux';
import { getGioiThieu } from './redux/reduxGioiThieuHiepPhat';
import './style.css';
import { Link } from 'react-router-dom';
class SectionGioiThieuHiepPhat extends React.Component {
    state = {focusImage:null,default:'image1'};
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
            if(this.props.system && this.props.system.user){
                // Có User => trang giới thiệu HP sẽ là trang đầu
                // => auto kích hoạt 
                let introText = document.querySelector('.text-gioi-thieu');
                let introImg = document.querySelector('.img-gioi-thieu');
                introText.classList.add('active_intro_text');
                introImg.classList.add('active_intro_img');
            }else{
                window.addEventListener('scroll', introText);
                window.addEventListener('scroll', introImg);
            }

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


            if (this.props.viewId) {
                this.props.getGioiThieu(this.props.viewId, data => {
                    data && data.item && this.setState(data.item);
                    $('#introCarousel').owlCarousel({
                        items:1,
                        loop:true,
                        margin:10,
                        autoplay: true,
                        autoplayTimeout:3000,
                        smartSpeed:600,
                        autoplayHoverPause: true,
                        dots:true,
                        nav:true,
                        navText:['<i class="fa fa-angle-left" aria-hidden="true"></i>','<i class="fa fa-angle-right" aria-hidden="true"></i>']
                        
                    });
                });
            }
        });
    }

    renderItem = ({text,image,imageAlt='Image',content=null})=>{
        return (
            <div className="d-flex flex-column" style={{height:'100%'}}>
                <div className="container-fluid" style={{flexGrow:1}}>
                    <div className='intro_carousel_content d-flex flex-column justify-content-between'>
                        <p>{text}</p>
                        <div className="mt-2">
                            <Link className='link_watch_more text-logo font-weight-italic' to={`/content/${content?content._id:''}`}> Xem thêm</Link>
                        </div>
                    </div>
                </div>
                
                <div className='intro_carousel_img'>
                    <img src={image} alt={imageAlt}/>
                </div>
            </div>
        );
    }
    render() {
        const { image1, image2, image3, abstract, abstract2, abstract3, title,content1,content2,content3 } = this.state;
        return (
            <div className='section-intro-hp' style={{}}>
                <div className="pc">
                    <div className='container'>
                        <div className='warp_gioi_thieu_HP'>
                            <div className='row'>
                                <div className='col-lg-5 col-md-12 text-gioi-thieu'>
                                    <div className='title_gioi_thieu'>
                                        Giới thiệu
                                    </div>
                                    <div>
                                    
                                        <div style={{ position: 'absolute', top: 0, left: 0 }} className={`description ${!this.state.focusImage || this.state.focusImage=='image1'?'active_intro_desciption':'' }`} ref={e => this.abstract1 = e}>
                                        <h4>{content1?content1.title:''}</h4>
                                            {abstract}                                                
                                                <br />
                                                <Link className='link_watch_more text-logo font-weight-italic' to={`/content/${content1?content1._id:''}`}> Xem thêm</Link>
                                        </div>
                                        <div style={{ position: 'absolute', top: 0, left: 0 }} className={`description ${ this.state.focusImage=='image2'?'active_intro_desciption':'' }`} ref={e => this.abstract2 = e}>
                                        <h4>{content2?content2.title:''}</h4>
                                            {abstract2}
                                            <br />
                                            <Link className='link_watch_more text-logo font-weight-italic' to={`/content/${content2?content2._id:''}`}> Xem thêm</Link>
                                        </div>
                                        <div style={{ position: 'absolute', top: 0, left: 0 }} className={`description ${ this.state.focusImage=='image3'?'active_intro_desciption':'' }`} ref={e => this.abstract3 = e}>
                                        <h4>{content3?content3.title:''}</h4>
                                            {abstract3}
                                            <br />
                                            <Link className='link_watch_more text-logo font-weight-italic' to={`/content/${content3?content3._id:''}`}> Xem thêm</Link>
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

                                    <img src={image1} ref={e => this.img1 = e} className={`img-intro1 ${this.state.focusImage=='image1'?'img-intro-zindex':''}`} alt='image 1' onMouseEnter={() => {
                                        if(!this.state.focusImage){
                                            this.img1.classList.add('img-intro-zindex');
                                            this.abstract1.classList.add('active_intro_desciption');
                                        }
                                    }} onMouseLeave={() =>{
                                        if(!this.state.focusImage){
                                            this.img1.classList.remove('img-intro-zindex');
                                        }
                                    } } onClick={()=>this.setState({focusImage:'image1'})}
                                    ></img>
                                    <img src={image2} ref={e => this.img2 = e} className={`img-intro2 ${this.state.focusImage=='image2'?'img-intro-zindex':''}`} alt='image 2' onMouseLeave={() => {
                                        if(!this.state.focusImage){
                                            this.abstract1.classList.add('active_intro_desciption');
                                            this.abstract2.classList.remove('active_intro_desciption');
                                            this.img2.classList.remove('img-intro-zindex');
                                        }
                                        
                                    }} onMouseEnter={() => {
                                        if(!this.state.focusImage){
                                            this.abstract2.classList.add('active_intro_desciption');
                                            this.img2.classList.add('img-intro-zindex');
                                            this.abstract1.classList.remove('active_intro_desciption');
                                        }
                                    }} onClick={()=>this.setState({focusImage:'image2'})}></img>
                                    <img src={image3} ref={e => this.img3 = e} alt='image 3' className={`img-intro3 ${this.state.focusImage=='image3'?'img-intro-zindex':''}`} onMouseLeave={() => {
                                        if(!this.state.focusImage){
                                            this.abstract1.classList.add('active_intro_desciption');
                                            this.abstract3.classList.remove('active_intro_desciption');
                                            this.img3.classList.remove('img-intro-zindex');
                                        }
                                    }} onMouseEnter={() => {
                                        if(!this.state.focusImage){
                                            this.abstract3.classList.add('active_intro_desciption');
                                            this.img3.classList.add('img-intro-zindex');
                                            this.abstract1.classList.remove('active_intro_desciption');
                                        }
                                    }} onClick={()=>this.setState({focusImage:'image3'})}></img>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                

                <div className="mobile">
                    <div className="container-fluid">
                        <div className='pt-4 pb-4'>
                            <div className='title_gioi_thieu'>
                                Giới thiệu
                                <h4>{title}</h4>
                            </div>
                        </div>
                    </div>                        
                <div className='owl-carousel intro_carousel carousel_equal_height carousel_nav carousel_dots' id='introCarousel'>
                        {this.renderItem({text:abstract,image:image1,content:content1})}
                        {this.renderItem({text:abstract2,image:image2,content:content2})}
                        {this.renderItem({text:abstract3,image:image3,content:content3})}
                    </div>                                
                </div>
            </div>
                    // </div>
                
            // </div>

        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getGioiThieu };
export default connect(mapStateToProps, mapActionsToProps)(SectionGioiThieuHiepPhat);
