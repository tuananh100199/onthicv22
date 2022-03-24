import React from 'react';
import { connect } from 'react-redux';
import { getHangGPLX } from './redux/reduxHangGPLX';
import './style.css';
import GplxModal from './sectionCacHangGplxModal';
class SectionCacHangGPLX extends React.Component {
    componentDidMount() {
        function GPLX() {
            let GPLX = document.querySelectorAll('.section_hang_GPLX');
            for (let i = 0; i < GPLX.length; i++) {
                let windowHeight = window.innerHeight;
                let elementTop = GPLX[i].getBoundingClientRect().top;
                let elementVisible = 150;

                if (elementTop < windowHeight - elementVisible) {
                    GPLX[i].classList.add('active_gplx');
                } else {
                    GPLX[i].classList.remove('active_gplx');
                }
            }
        }

        window.addEventListener('scroll', GPLX);
        if (this.props.viewId) {
            this.props.getHangGPLX(this.props.viewId, data => {
                data && data.item && this.setState(data.item);
                $('#gplxCarousel').owlCarousel({
                    items:1,
                    loop:true,
                    margin:10,
                    dots:true,
                    nav:true,
                    navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>','<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
                    autoplay: true,
                    autoplayTimeout:3000,
                    smartSpeed:600,
                    autoplayHoverPause: true,
                    slideTransition:'0.5s linear'
                    
                });
            });
        }
    }

    renderCarouselItem = (item={})=>(
            <div className="h-100 d-flex gplx-wrap-item flex-column justify-content-end align-items-center">
                <img alt='hạng 1' className='gplx-img' src={item.image} onClick={e=>e.preventDefault()||this.gplxModal.show(item)}/>
                {/* <i className="fa fa-arrow-up gplx-arrow" aria-hidden="true" style={{fontSize:30}}/> */}
                <div className="gplx-arrow">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <h3 className='title_img text-main'>{item.title}</h3>
            </div>
        )

    render() {
        const item = this.state;
        return (
            <>
            <div className='section_hang_GPLX'>
                <div className='intro_hang_GPLX'>
                    <div className='intro_col'>
                        {item ?
                            <div className='wrap_GPLX'>
                                <h4 className='title_GPLX'>Các hạng giấy phép lái xe</h4>
                                {/* <div className='row wrap_item_GPLX'>
                                    <div className='col-md-3 img_item'>
                                        <h3 className='title_img'>{item.title1}</h3>
                                        <div className='wrap_img'>
                                            <img alt='hạng 1' src={item.image1} />
                                        </div>
                                    </div>

                                    <div className='col-md-9 content_item'>
                                        {item.abstract1 && (item.abstract1.split('\n') || []).map((subItem, index) => (
                                            <p key={index}>{subItem}</p>
                                        ))}
                                    </div>
                                </div>
                                <div className='row wrap_item_GPLX'>
                                    <div className='col-md-3 img_item'>
                                        <h3 className='title_img'>{item.title2}</h3>
                                        <div className='wrap_img'>
                                            <img alt='hạng 2' src={item.image2} />
                                        </div>
                                    </div>
                                    <div className='col-md-9 content_item'>
                                        {item.abstract2 && (item.abstract2.split('\n') || []).map((subItem, index) => (
                                            <p key={index}>{subItem}</p>
                                        ))}
                                    </div>
                                </div>
                                <div className='row wrap_item_GPLX'>
                                    <div className='col-md-3 img_item'>
                                        <h3 className='title_img'>{item.title3}</h3>
                                        <div className='wrap_img'>
                                            <img alt='hạng 3' src={item.image3} />
                                        </div>
                                    </div>
                                    <div className='col-md-9 content_item'>
                                        {item.abstract3 && (item.abstract3.split('\n') || []).map((subItem, index) => (
                                            <p key={index}>{subItem}</p>
                                        ))}
                                    </div>
                                </div> */}

                                <div className="owl-carousel news_carousel carousel_equal_height carousel_nav carousel_dots text-main" id='gplxCarousel'>
                                    {/* <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                        <img alt='hạng 1' className='gplx-img' src={item.image1}/>
                                        <h3 className='title_img text-main'>{item.title1}</h3>
                                    </div>

                                    <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                        <img alt='hạng 1' className='gplx-img' src={item.image2}/>
                                        <h3 className='title_img text-main'>{item.title2}</h3>
                                    </div>

                                    <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                        <img alt='hạng 1' className='gplx-img' src={item.image3}/>
                                        <h3 className='title_img text-main'>{item.title3}</h3>
                                    </div> */}
                                    {this.renderCarouselItem({image:item.image1,title:item.title1,content:item.abstract1})}
                                    {this.renderCarouselItem({image:item.image2,title:item.title2,content:item.abstract2})}
                                    {this.renderCarouselItem({image:item.image3,title:item.title3,content:item.abstract3})}
                                </div>
                            </div>
                            : null}
                    </div>
                </div>
            </div>
            <GplxModal ref={e => this.gplxModal = e} />
            </>
            
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getHangGPLX };
export default connect(mapStateToProps, mapActionsToProps)(SectionCacHangGPLX);
