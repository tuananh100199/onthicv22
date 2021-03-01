import React from 'react';
import { connect } from 'react-redux';
import { getStatistic } from './reduxSystem.jsx';
import { Link } from 'react-router-dom';

class ProfileIcon extends React.Component {
    valueElement = React.createRef();
    render() {
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>{this.props.title}</h4>
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class DashboardPage extends React.Component {
    componentDidMount() {
        this.props.getStatistic();
        T.ready();
    }

    render() {
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-user' /> Trang cá nhân</h1>
                        <p>Trung tâm đào tạo lái xe Hiệp Phát</p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <li className='breadcrumb-item'>
                            <i className='fa fa-home fa-lg' />
                        </li>
                        <li className='breadcrumb-item'>Trang cá nhân</li>
                    </ul>
                </div>

                <div className='row'>
                    <div className='col-md-6 col-lg-6'>
                        <ProfileIcon type='primary' icon='fa-id-card' title='Hồ sơ cá nhân' link='/user/profile' />
                    </div>
                    <div className='col-md-6 col-lg-6'>
                        <ProfileIcon type='info' icon='fa-id-card-o' title='Đơn đề nghị học, sát hạch' link='/user/bieu-mau/don-de-nghi-hoc' />
                    </div>
                    {/* <div className='col-md-6 col-lg-6'>
                        <ProfileIcon type='primary' icon='fa-book' title='Khóa học' link='/user/course/list' />
                    </div> */}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getStatistic };
export default connect(mapStateToProps, mapActionsToProps)(DashboardPage);
