import React from 'react';
import { connect } from 'react-redux';
import { login } from 'modules/_default/_init/redux';
import './style.css';

class SectionDenVoiHiepPhat extends React.Component {
    render() {
        return (
            <div className='section_den_voi_hp' style={{ backgroundColor: 'aliceblue' }}>
                <div className='container' style={{ paddingTop: '20px' }}>
                    <div className='intro_form_container'>
                        <div className='form_title'>
                            <div>ĐẾN VỚI HIỆP PHÁT</div> 
                            <div className='strike1'/>
                        </div>
                        <div className='wrap_den_voi_HP'>
                            <div className='row'>
                                <div className='col-lg-4 col-md-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-calendar' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Giờ học linh hoạt</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Giờ học linh hoạt</h4>
                                            <p className='description'>Bạn có thể tham gia chương trình học lý thuyết các môn cơ sở và hướng dẫn thực hành vào mọi nơi,
                                                bất kể khi nào có thời gian rảnh.
                                            </p>
                                            <p  className='description'>Thời gian học thực hành linh hoạt phù hợp với cả những người bận rộn nhất.
                                            </p>
                                       </div>
                                    </div>
                                </div>
                                <div className='col-lg-4 col-md-6 col-xs-12'>
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
                                <div className='col-lg-4 col-md-6 col-xs-12'>
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
                                <div className='col-lg-4 col-md-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-money' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Học phí trọn gói rõ ràng</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Học phí trọn gói rõ ràng</h4>
                                            <p className='description'>Học phí được tư vấn rõ ràng khi bạn đến với Hiệp Phát, Hiệp Phát cam kết
                                            không phát sinh bất cứ chi phí nào đến khi bạn hoàn thành khóa học.
                                            </p>
                                            <p  className='description'>Thời gian học thực hành linh hoạt phù hợp với cả những người bận rộn nhất.
                                            </p>
                                       </div>
                                    </div>
                                </div>
                                <div className='col-lg-4 col-md-6 col-xs-12'>
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
                                <div className='col-lg-4 col-md-6 col-xs-12'>
                                    <div className='wrap_item'>
                                        <div className='item'>
                                            <div className='icon_item_den_voi_HP'>
                                                <i className='fa fa-car' aria-hidden='true' />
                                            </div>
                                            <p className='title_item_den_voi_HP'>Xe đời mới</p>
                                        </div>
                                       <div className='detail'>
                                            <h4 className='hover_title_item'>Xe đời mới</h4>
                                            <p className='description'>Đến với Hiệp Phát bạn sẽ được học với những dòng xe hiện đại nhất,
                                            có khả năng tiếp xúc đến những công nghệ hàng đầu của thế giới.
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
