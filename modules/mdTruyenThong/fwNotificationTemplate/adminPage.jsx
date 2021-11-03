import React from 'react';
import { connect } from 'react-redux';
import { createNotificationTemplate, getNotificationTemplateAll, updateNotificationTemplate, deleteNotificationTemplate } from './redux';
import { AdminPage, FormTextBox, FormTabs, FormEditor, CirclePageButton, FormRichTextBox } from 'view/component/AdminPage';

const listParams = ['{ho_ten}', '{cmnd}', '{khoa}', '{ngay_thi_tot_nghiep}', '{ngay_thi_sat_hach}'],
    defaultTitleTotNghiep = 'Thông báo thời gian thi tốt nghiệp',
    defaultAbstractTotNghiep = 'Thông báo thời gian thi tốt nghiệp khóa {khoa}',
    defaultContentTotNghiep = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Thời gian thi tốt nghiệp khóa {khoa} của bạn là: {ngay_thi_tot_nghiep}</p>',
    defaultTitleSatHach = 'Thông báo thời gian thi sát hạch',
    defaultAbstractSatHach = 'Thông báo thời gian thi sát hạch khóa {khoa}',
    defaultContentSatHach = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Thời gian thi sát hạch khóa {khoa} của bạn là: {ngay_thi_sat_hach}</p>';
class NotificationTemplatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/notification/template', () => {
            this.props.getNotificationTemplateAll({}, data => {
                if (data && data.length) {
                    const indexThiTotNghiep = data.findIndex(template => template.type == '2');
                    if (indexThiTotNghiep != -1) {
                        this.itemTitleTotNghiep.value(data[indexThiTotNghiep].title);
                        this.itemAbstractTotNghiep.value(data[indexThiTotNghiep].abstract);
                        this.editorTotNghiep.html(data[indexThiTotNghiep].content);
                        this.setState({ idThiTotNghiep: data[indexThiTotNghiep]._id });
                    } else {
                        this.itemTitleTotNghiep.value(defaultTitleTotNghiep);
                        this.itemAbstractTotNghiep.value(defaultAbstractTotNghiep);
                        this.editorTotNghiep.html(defaultContentTotNghiep);
                    }
                    const indexThiSatHach = data.findIndex(template => template.type == '3');
                    if (indexThiSatHach != -1) {
                        this.itemTitleSatHach.value(data[indexThiSatHach].title);
                        this.itemAbstractSatHach.value(data[indexThiSatHach].abstract);
                        this.editorSatHach.html(data[indexThiSatHach].content);
                        this.setState({ idThiSatHach: data[indexThiSatHach]._id });
                    } else {
                        this.itemTitleSatHach.value(defaultTitleSatHach);
                        this.itemAbstractSatHach.value(defaultAbstractSatHach);
                        this.editorSatHach.html(defaultContentSatHach);
                    }
                } else {
                    this.itemTitleTotNghiep.value(defaultTitleTotNghiep);
                    this.itemAbstractTotNghiep.value(defaultAbstractTotNghiep);
                    this.editorTotNghiep.html(defaultContentTotNghiep);
                    this.itemTitleSatHach.value(defaultTitleSatHach);
                    this.itemAbstractSatHach.value(defaultAbstractSatHach);
                    this.editorSatHach.html(defaultContentSatHach);
                }
            });
        });
    }

    save = () => {
        const index = this.tabs.selectedTabIndex();
        if (index == 0) {
            const changes = {
                title: this.itemTitleTotNghiep.value().trim(),
                abstract: this.itemAbstractTotNghiep.value().trim(),
                content: this.editorTotNghiep.html(),
                type: '2',
            };
            if (this.state.idThiTotNghiep) {
                this.props.updateNotificationTemplate(this.state.idThiTotNghiep, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idThiTotNghiep: data.item._id
                    });
                });
            }
        } else {
            const changes = {
                title: this.itemTitleSatHach.value().trim(),
                abstract: this.itemAbstractSatHach.value().trim(),
                content: this.editorSatHach.html(),
                type: '3',
            };
            if (this.state.idThiSatHach) {
                this.props.updateNotificationTemplate(this.state.idThiSatHach, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idThiSatHach: data.item._id
                    });
                });
            }
        }
    }

    render() {
        const permission = this.getUserPermission('notificationTemplate');
        const thiTotNghiepTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleTotNghiep = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractTotNghiep = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorTotNghiep = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} />
                <CirclePageButton type='save' onClick={this.save} />
            </div>
        );

        const thiSatHachTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleSatHach = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractSatHach = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorSatHach = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} readOnly={this.props.readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.save} /> : null}
            </div>
        );

        const tabs = [
            { title: 'Thông báo thi tốt nghiệp', component: thiTotNghiepTabs },
            { title: 'Thông báo thi sát hạch', component: thiSatHachTabs }
        ];

        return this.renderPage({
            icon: 'fa fa-bell-o',
            title: 'Cấu hình thông báo',
            breadcrumb: ['Cấu hình thông báo'],
            content: <FormTabs ref={e => this.tabs = e} id='notificationPageTab' contentClassName='tile' tabs={tabs} />,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, notificationTemplate: state.communication.notificationTemplate });
const mapActionsToProps = { createNotificationTemplate, getNotificationTemplateAll, updateNotificationTemplate, deleteNotificationTemplate };
export default connect(mapStateToProps, mapActionsToProps)(NotificationTemplatePage);