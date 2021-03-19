import React from 'react';
import { connect } from 'react-redux';
import { getStaffGroupItemByUser } from './redux/reduxStaffGroup';

class SectionStaffGroup extends React.Component {
    componentDidMount() {
        if (this.props.staffGroupId) {
            this.props.getStaffGroupItemByUser(this.props.staffGroupId, data => this.setState(data.item));
        }
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    renderStaff = (staff) => {
        const fbLink = staff.info.facebook ? <a href={staff.info.facebook} target='_blank' style={{ fontSize: '20px' }}><span className='icon-facebook'></span></a> : '',
            websiteLink = staff.info.website ? <a href={staff.info.website} target='_blank' className='' style={{ fontSize: '20px' }}>W</a> : '',
            emailLink = staff.info.email ? <a href={'mailto:' + staff.info.email} className='' style={{ fontSize: '20px' }}><span className='icon-mail_outline'></span></a> : '';

        return (
            <div className='block-2'>
                <div className='flipper'>
                    <div className='front' style={{ backgroundImage: 'url(' + staff.info.image + ')' }}>
                        <div className='box'>
                            <h2>{staff.info.firstname + ' ' + staff.info.lastname}</h2>
                            <p>{staff.info.academicTitle}</p>
                            <p>{staff.info.academicDistinction}</p>
                        </div>
                    </div>
                    <div className='back'>
                        <blockquote>
                            <p className='innerHTML' dangerouslySetInnerHTML={{ __html: staff.content }}></p>
                        </blockquote>
                        <div className='author d-flex'>
                            <div className='image mr-3 align-self-center'>
                                <div className='img' style={{ backgroundImage: 'url(' + staff.info.image + ')' }}></div>
                            </div>
                            <div className='name align-self-center'>
                                {staff.info.firstname + ' ' + staff.info.lastname}<br />
                                <span className=''>{fbLink}  {websiteLink}  {emailLink}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        let staffs = [],
            numOfStaff = this.state.staff ? this.state.staff.length : 0;
        if (numOfStaff == 0) {
            staffs = [];
        } else {
            const times = Math.floor(numOfStaff / 4), remainder = numOfStaff % 4;
            for (let i = 0; i < times * 4; i++) {
                staffs.push(
                    <div className='col-md-6 col-lg-3 ftco-animate'>
                        {this.renderStaff(this.state.staff[i])}
                    </div>
                );
            }
            if (remainder == 1) {
                staffs.push(
                    <div className='col-md-6 col-lg-3 ftco-animate offset-lg-4dot5'>
                        {this.renderStaff(this.state.staff[times * 4])}
                    </div>
                );
            }
            else if (remainder == 2) {
                staffs.push(
                    <div className='col-md-6 col-lg-3 ftco-animate offset-lg-3'>
                        {this.renderStaff(this.state.staff[times * 4])}
                    </div>
                );
                staffs.push(
                    <div className='col-md-6 col-lg-3 ftco-animate'>
                        {this.renderStaff(this.state.staff[times * 4 + 1])}
                    </div>
                );
            }
            else if (remainder == 3) {
                staffs.push(
                    <div className='col-md-6 col-lg-3 ftco-animate offset-lg-1dot5'>
                        {this.renderStaff(this.state.staff[times * 4])}
                    </div>
                );
                staffs.push(
                    <div className='col-md-6 col-lg-3 ftco-animate'>
                        {this.renderStaff(this.state.staff[times * 4 + 1])}
                    </div>
                );
                staffs.push(
                    <div className='col-md-6 col-lg-3 ftco-animate'>
                        {this.renderStaff(this.state.staff[times * 4 + 2])}
                    </div>
                );
            }
        }

        return (
            <section className='ftco-section bg-light'>
                <div className='container'>
                    <div className='row justify-content-center'>
                        <div className='col-md-7 heading-section ftco-animate text-center'>
                            <h2 className='mb-4'>{this.state.title}</h2>
                        </div>
                    </div>
                    <div className='row'>{staffs}</div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ staffGroup: state.staffGroup });
const mapActionsToProps = { getStaffGroupItemByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionStaffGroup);