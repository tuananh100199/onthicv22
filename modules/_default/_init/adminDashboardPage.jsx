import React from 'react';
import { connect } from 'react-redux';
import { getStatistic } from './reduxSystem';
import CountUp from 'view/js/countUp';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';


class DashboardIcon extends React.Component {
    valueElement = React.createRef();

    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement.current, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    render() {
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>{this.props.title}</h4>
                    <p style={{ fontWeight: 'bold' }} ref={this.valueElement} />
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class DashboardPage extends  AdminPage{
    componentDidMount() {
        this.props.getStatistic();
        T.ready();
    }

    render() {
        const permission = this.getUserPermission('system', ['settings']);
        const { numberOfUser, numberOfNews, numberOfCourse, todayViews, allViews } = this.props.system ?
            this.props.system : { numberOfUser: 0, numberOfNews: 0, numberOfCourse: 0, todayViews: 0, allViews: 0 };
        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Dashboard: ',
            breadcrumb: ['Dashboard'],
            content: (
                <div className='row'>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-users' title='Nguời dùng' value={numberOfUser} link='/user/member' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='info' icon='fa-file' title='Tin tức' value={numberOfNews} link='/user/news/list' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-book' title='Khóa học' value={numberOfCourse} link='/user/course/list' readOnly={permission.settings} />
                    </div>
                </div>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getStatistic };
export default connect(mapStateToProps, mapActionsToProps)(DashboardPage);
