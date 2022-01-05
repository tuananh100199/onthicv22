import React from 'react';
import { connect } from 'react-redux';
import { homeGetStaffGroup } from './redux/reduxStaffGroup';
// import { Link } from 'react-router-dom';
import './style.css';

class SectionStaffGroup extends React.Component {
    state = {};
    componentDidMount() {
        this.props.viewId && this.props.homeGetStaffGroup(this.props.viewId, data => this.setState(data));
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    render() {
        return <>
        <div id='carouselLastNews' className='carousel slide ftco-animate' data-ride='carousel' data-interval='5000' style={{ height: 'auto' }}>
            <div className='carousel-inner'>
                { this.state.items && this.state.items.map((staff, index) => (
                    <div className={'container_staff team_col carousel-item' + (index == 0 ? ' active' : '')}
                        key={index}>
                        <div className='pc'>
                            <div className='wrapper_staff'>
                                <div className='staff_info'>
                                    <div className='staff_group_title'>
                                        <h3>{this.state.title}</h3>
                                    </div>
                                    <div className='strike1'/>
                                    <div className='staff_name' style={{ whiteSpace: 'nowrap' }}><h5>{staff.user.lastname + ' ' + staff.user.firstname}</h5></div>
                                    <div className='staff_title' style={{ whiteSpace: 'nowrap' }}><h6>{staff.title}</h6></div>
                                    <div className='strike2'/>
                                    <div className='text'>
                                        <blockquote>
                                            <p>&ldquo;{staff.description}&rdquo;</p>
                                        </blockquote>
                                    </div> 
                                </div>
                                <div className='staff_img'>
                                    <img src={staff.image} alt='Image' className='img-fluid' />
                                </div>
                            </div>
                        </div>
                        <div className='mobile'>
                            <div className='wrapper_staff'>
                                <div className='row'>
                                    <div className='col-12'>
                                        <div className='staff_info'>
                                            <div className='staff_group_title'>
                                                <h3>{this.state.title}</h3>
                                            </div>
                                            <div className='strike1'/>
                                            <div className='staff_name' style={{ whiteSpace: 'nowrap' }}><h5>{staff.user.lastname + ' ' + staff.user.firstname}</h5></div>
                                            <div className='staff_title' style={{ whiteSpace: 'nowrap' }}><h6>{staff.title}</h6></div>
                                            <div className='strike2'/>
                                            <div className='text'>
                                                <blockquote>
                                                    <p>&ldquo;{staff.description}&rdquo;</p>
                                                </blockquote>
                                            </div> 
                                        </div>
                                    </div>
                               <div className='col-12' style={{ padding: 'inherit'}}>
                                <div className='staff_img'>
                                        <img src={staff.image} alt='Image' className='img-fluid' />
                                    </div>
                               </div>
                            </div>
                                
                            </div>
                        </div>
                </div>))}
            </div>
            <a className='carousel-control-prev' href='#carouselLastNews' role='button' data-slide='prev' style={{ opacity: 1 }}>
                <span className='carousel-control-prev-icon' />
                <span className='sr-only'>Previous</span>
            </a>
            <a className='carousel-control-next' href='#carouselLastNews' role='button' data-slide='next' style={{ opacity: 1 }}>
                <span className='carousel-control-next-icon' />
                <span className='sr-only'>Next</span>
            </a>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { homeGetStaffGroup };
export default connect(mapStateToProps, mapActionsToProps)(SectionStaffGroup);