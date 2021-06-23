import React from 'react';
import { connect } from 'react-redux';
import { getDivisionAll, createDivision, deleteDivision, updateDivision } from './redux';
import { AdminPage } from 'view/component/AdminPage';


const previousRoute = '/user';
class TabPersonalChat extends AdminPage {
    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {


            });
        } else {
            this.props.history.push(previousRoute);
        }
    }



    render() {
        // const permission = this.getUserPermission('chat');

        return (<div>
            a
        </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { getDivisionAll, createDivision, deleteDivision, updateDivision };
export default connect(mapStateToProps, mapActionsToProps)(TabPersonalChat);