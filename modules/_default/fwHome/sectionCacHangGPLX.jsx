import React from 'react';
import { connect } from 'react-redux';
import { getHangGPLX } from './redux/reduxHangGPLX';
import './style.css';

class SectionCacHangGPLX extends React.Component {
    componentDidMount() {
        if (this.props.viewId) {
            this.props.getHangGPLX(this.props.viewId, data => {
                data && data.item && this.setState(data.item);
            }); 
        }
    }

    render() {
        const item = this.state;
        return (
            <div className='section_hang_GPLX'>
                <div className='intro_hang_GPLX col-md-12'>
                    <div className='intro_col'>
                        {item ? 
                        <div className='wrap_GPLX'>
                            <div className='title_GPLX'>Các hạng giấy phép lái xe</div>
                            <div className='row wrap_item_GPLX'>
                                <div className='col-md-3 img_item'>
                                    <h3 className='title_img'>{item.title1}</h3>
                                    <div className='wrap_img'>
                                        <img alt='hạng 1' src={item.image1}/>
                                    </div>
                                </div>

                                <div className='col-md-9 content_item'>
                                    { item.abstract1 && (item.abstract1.split('\n') || []).map((subItem, index) => (
                                        <p key={index}>{subItem}</p>
                                    ))}
                                </div>
                            </div> 
                            <div className='row wrap_item_GPLX'>
                                <div className='col-md-3 img_item'>
                                    <h3 className='title_img'>{item.title2}</h3>
                                    <div className='wrap_img'>
                                        <img alt='hạng 2' src={item.image2}/>
                                    </div>
                                </div>
                                <div className='col-md-9 content_item'>
                                    { item.abstract2 && (item.abstract2.split('\n') || []).map((subItem, index) => (
                                        <p key={index}>{subItem}</p>
                                    ))}
                                </div>
                            </div>
                            <div className='row wrap_item_GPLX'>
                                <div className='col-md-3 img_item'>
                                    <h3 className='title_img'>{item.title3}</h3>
                                    <div className='wrap_img'>
                                        <img alt='hạng 3' src={item.image3}/>
                                    </div>
                                </div>
                                <div className='col-md-9 content_item'>
                                    { item.abstract3 && (item.abstract3.split('\n') || []).map((subItem, index) => (
                                        <p key={index}>{subItem}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        : null}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getHangGPLX };
export default connect(mapStateToProps, mapActionsToProps)(SectionCacHangGPLX);
