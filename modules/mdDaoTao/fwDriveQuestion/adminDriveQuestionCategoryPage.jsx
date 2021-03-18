import React from 'react';
import { connect } from 'react-redux';
import { } from './reduxDriveQuestionCategory';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox } from 'view/component/AdminPage';

class CategoryModal extends AdminModal {
    // TODO: Tuấn Anh
}

class AdminPage extends AdminPage {
    // TODO: Tuấn Anh
}

const mapStateToProps = state => ({ system: state.system, driveQuestionCategory: state.driveQuestionCategory });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);
