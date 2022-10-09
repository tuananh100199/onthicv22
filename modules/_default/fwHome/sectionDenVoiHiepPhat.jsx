import React from 'react';
import { connect } from 'react-redux';
import { login } from 'modules/_default/_init/redux';
import './style.css';
import T from 'view/js/common';

class SectionDenVoiHiepPhat extends React.Component {
    state={currentHeight:0};
    // componentDidMount() {
    //     $(document).ready(() => {
    //         function denVoiHP() {
    //             let denVoiHP = document.querySelectorAll('.detail');
    //             for (let i = 0; i < denVoiHP.length; i++) {
    //                 let windowHeight = window.innerHeight;
    //                 let elementTop = denVoiHP[i].getBoundingClientRect().top;
    //                 let elementVisible = 150;
                
    //                 if (elementTop < windowHeight - elementVisible) {
    //                     denVoiHP[i].classList.add('active_den_voi_HP');
    //                 } else {
    //                     denVoiHP[i].classList.remove('active_den_voi_HP');
    //                 }
    //             }
    //         }
            
    //         window.addEventListener('scroll', denVoiHP);
    //     });
    // }
    componentDidMount=()=>{
        const resizeObserver = new ResizeObserver(() =>{
            T.ftcoAnimate();
        });
          
          // start observing a DOM node
          resizeObserver.observe(document.body);
    }

    render() {
        return (
            <div className='section_den_voi_hp' style={{ backgroundColor: 'aliceblue' }}>
                <div className='container' style={{ paddingTop: '20px' }}>
                    <div className='form_den_voi_hp'>
                        <div className='form_title'>
                            <h3 className='text-title text-main'>ĐẾN VỚI HIỆP PHÁT</h3> 
                            {/* <div className='strike1'/> */}
                        </div>
                        <div className='wrap_den_voi_HP ftco-animate'>
                            <div className='row'>
                            <div className='col-lg-4 col-sm-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-handshake-o' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Đào tạo chất lượng</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Đào tạo chất lượng</h4>
                                            <p className='description'>Kiến thức đầy đủ, chương trình giảng dạy khoa học, 1 giáo viên dạy kèm 1 học viên.
                                            </p>
                                            <p  className='description'>Tỷ lệ thi đậu sát hạch Hiệp Phát luôn đảm bảo trên 90%.
                                            </p>
                                       </div>
                                    </div>
                                </div>

                                <div className='col-lg-4 col-sm-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-map' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Sân tập lái hiện đại</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Sân tập lái hiện đại</h4>
                                            <p className='description'>Hệ thống sân tập đạt chuẩn Singapore, được thiết kế hợp lý, giúp học viên
                                            đạt hiệu quả nhất khi học
                                            </p>
                                       </div>
                                    </div>
                                </div>

                                <div className='col-lg-4 col-sm-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-car' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Xe hiện đại</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Xe hiện đại</h4>
                                            <p className='description'>Đến với Hiệp Phát bạn sẽ được học với những dòng xe hiện đại nhất,
                                            có khả năng tiếp xúc đến những công nghệ hàng đầu của thế giới.
                                            </p>
                                       </div>
                                    </div>
                                </div>

                                <div className='col-lg-4 col-sm-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-calendar' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Giờ học mọi lúc mọi nơi</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Giờ học mọi lúc mọi nơi</h4>
                                            <p className='description'>Bạn có thể tham gia chương trình học lý thuyết các môn cơ sở và hướng dẫn thực hành vào mọi nơi,
                                                bất kể khi nào có thời gian rảnh.
                                            </p>
                                            <p  className='description'>Thời gian học thực hành linh hoạt phù hợp với cả những người bận rộn nhất.
                                            </p>
                                       </div>
                                    </div>
                                </div>
                                <div className='col-lg-4 col-sm-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-clock-o' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Thi sớm nhất</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Thi sớm nhất</h4>
                                            <p className='description'>Lịch thi sát hạch được tổ chức hàng tuần tại Trung tâm chỉ cần bạn hoàn
                                            thành chương trình học, sẽ được thi sớm nhất.
                                            </p>
                                       </div>
                                    </div>
                                </div>
                                
                                <div className='col-lg-4 col-sm-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-money' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Học phí trọn gói</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Học phí trọn gói</h4>
                                            <p className='description'>Học phí được tư vấn rõ ràng khi bạn đến với Hiệp Phát, Hiệp Phát cam kết
                                            không phát sinh bất cứ chi phí nào đến khi bạn hoàn thành khóa học.
                                            </p>
                                            <p  className='description'>Thời gian học thực hành linh hoạt phù hợp với cả những người bận rộn nhất.
                                            </p>
                                       </div>
                                    </div>
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
const mapActionsToProps = { login };
export default connect(mapStateToProps, mapActionsToProps)(SectionDenVoiHiepPhat);
