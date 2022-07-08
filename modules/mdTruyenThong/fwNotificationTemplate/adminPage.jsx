import React from 'react';
import { connect } from 'react-redux';
import { createNotificationTemplate, getNotificationTemplateAll, updateNotificationTemplate, deleteNotificationTemplate } from './redux';
import { AdminPage, FormTextBox, FormTabs, FormEditor, CirclePageButton, FormRichTextBox } from 'view/component/AdminPage';

const listParams = ['{ho_ten}', '{cmnd}', '{khoa}', '{ngay_thi_tot_nghiep}', '{ngay_thi_sat_hach}', '{fee}', '{hocPhiConLai}', '{ngayOnTap}', '{lyDoHuyOnTap}', '{ngayDangKy}'],
    defaultTitleTotNghiep = 'Thông báo thời gian thi tốt nghiệp',
    defaultAbstractTotNghiep = 'Thông báo thời gian thi tốt nghiệp khóa {khoa}',
    defaultContentTotNghiep = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Thời gian thi tốt nghiệp khóa {khoa} của bạn là: {ngay_thi_tot_nghiep}</p>',
    defaultTitleSatHach = 'Thông báo thời gian thi sát hạch',
    defaultAbstractSatHach = 'Thông báo thời gian thi sát hạch khóa {khoa}',
    defaultContentSatHach = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Thời gian thi sát hạch khóa {khoa} của bạn là: {ngay_thi_sat_hach}</p>',
    defaultTitleThanhToan = 'Thông báo thanh toán học phí thành công!',
    defaultAbstractThanhToan = 'Bạn đã thanh toán thành công gói {khoa}',
    defaultContentThanhToan = '<p>Bạn đã thanh toán thành công gói {khoa}<p>\n <p>Số tiền thanh toán: {fee} đồng<p> \n <p>Số tiền còn lại phải đóng: {hocPhiConLai} đồng<p>',
    defaultTitleHoanTien = 'Thông báo về việc hoàn trả tiền học phí cho học viên!',
    defaultAbstractHoanTien = 'Thông báo về việc hoàn trả tiền học phí cho học viên khóa {khoa}',
    defaultContentHoanTien = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Bạn được hoàn lại số tiền {fee} đã đóng cho khóa {khoa}, bạn vui lòng đến trung tâm đào tạo lái xe Hiệp Phát để nhận lại. Khi đi vui lòng mang theo giấy tờ tuỳ thân để xác minh</p>',
    defaultTitleHuyOnTap = 'Thông báo về việc huỷ lớp ôn tập!',
    defaultAbstractHuyOnTap = 'Thông báo về việc huỷ lớp ôn tập ngày {ngayOnTap}',
    defaultContentHuyOnTap = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo huỷ buổi ôn tập ngày {ngayOnTap} với lý do: {lyDoHuyOnTap}, chúng tôi sẽ thông báo tới bạn các buổi học khác trong thời gian sớm nhất!</p>',
    defaultTitleOnTap = 'Thông báo về việc mở lớp ôn tập!',
    defaultAbstractOnTap = 'Thông báo về việc mở lớp ôn tập ngày {ngayOnTap}',
    defaultContentOnTap = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo buổi ôn tập bạn đã đăng ký ngày {ngayOnTap} đã được xác nhận, bạn vui lòng có mặt trước 15p để chúng tôi sắp xếp vị trí ngồi học!</p>',
    defaultTitleDiscountCode = 'Thông báo khuyến mãi dành cho bạn!',
    defaultAbstractDiscountCode = 'Thông báo khuyến mãi học phí dành cho bạn!',
    defaultContentDiscountCode = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát dành tặng cho bạn mã code {code} có giá trị {fee}, hạn dùng đến {endDate} vui lòng sử dụng trước thời hạn để nhận được các ưu đãi của chúng tôi!</p>',
    defaultTitleHuyDangKyThoiKhoaBieu = 'Thông báo về việc huỷ đăng ký thời khoá biểu!',
    defaultAbstractHuyDangKyThoiKhoaBieu = 'Thông báo về việc huỷ đăng ký thời khoá biểu ngày {ngayDangKy}',
    defaultContentHuyDangKyThoiKhoaBieu = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo huỷ thời khoá biểu học thực hành bạn đã đăng ký ngày {ngayDangKy} với lý do: {lyDoHuyThoiKhoaBieu}, chúng tôi sẽ thông báo tới bạn các buổi học khác trong thời gian sớm nhất!</p>',
    defaultTitleDangKyThoiKhoaBieu = 'Thông báo về việc đăng ký thời khoá biểu thành công!',
    defaultAbstractDangKyThoiKhoaBieu = 'Thông báo về việc đăng ký thời khoá biểu ngày: {ngayDangKy} thành công',
    defaultContentDangKyThoiKhoaBieu = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo thời khoá biểu ngày {ngayDangKy} đã được xác nhận, bạn vui lòng có mặt trước 15p chuẩn bị tham gia buổi học!</p>';
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
                    const indexThanhToan = data.findIndex(template => template.state == 'thanhToan');
                    if (indexThanhToan != -1) {
                        this.itemTitleThanhToan.value(data[indexThanhToan].title);
                        this.itemAbstractThanhToan.value(data[indexThanhToan].abstract);
                        this.editorThanhToan.html(data[indexThanhToan].content);
                        this.setState({ idThanhToan: data[indexThanhToan]._id });
                    } else {
                        this.itemTitleThanhToan.value(defaultTitleThanhToan);
                        this.itemAbstractThanhToan.value(defaultAbstractThanhToan);
                        this.editorThanhToan.html(defaultContentThanhToan);
                    }
                    const indexHoanTien = data.findIndex(template => template.state == 'hoanTien');
                    if (indexHoanTien != -1 ) {
                        this.itemTitleHoanTien.value(data[indexHoanTien].title);
                        this.itemAbstractHoanTien.value(data[indexHoanTien].abstract);
                        this.editorHoanTien.html(data[indexHoanTien].content);
                        this.setState({ idHoanTien: data[indexHoanTien]._id });
                    } else {
                        this.itemTitleHoanTien.value(defaultTitleHoanTien);
                        this.itemAbstractHoanTien.value(defaultAbstractHoanTien);
                        this.editorHoanTien.html(defaultContentHoanTien);
                    }
                    const indexHuyOnTap = data.findIndex(template => template.state == 'huyOnTap');
                    if (indexHuyOnTap != -1 ) {
                        this.itemTitleHuyOnTap.value(data[indexHuyOnTap].title);
                        this.itemAbstractHuyOnTap.value(data[indexHuyOnTap].abstract);
                        this.editorHuyOnTap.html(data[indexHuyOnTap].content);
                        this.setState({ idHuyOnTap: data[indexHuyOnTap]._id });
                    } else {
                        this.itemTitleHuyOnTap.value(defaultTitleHuyOnTap);
                        this.itemAbstractHuyOnTap.value(defaultAbstractHuyOnTap);
                        this.editorHuyOnTap.html(defaultContentHuyOnTap);
                    }
                    const indexOnTap = data.findIndex(template => template.state == 'onTap');
                    if (indexOnTap != -1 ) {
                        this.itemTitleOnTap.value(data[indexOnTap].title);
                        this.itemAbstractOnTap.value(data[indexOnTap].abstract);
                        this.editorOnTap.html(data[indexOnTap].content);
                        this.setState({ idOnTap: data[indexOnTap]._id });
                    } else {
                        this.itemTitleOnTap.value(defaultTitleOnTap);
                        this.itemAbstractOnTap.value(defaultAbstractOnTap);
                        this.editorOnTap.html(defaultContentOnTap);
                    }
                    const indexGiamGia = data.findIndex(template => template.state == 'giamGia');
                    if (indexGiamGia != -1) {
                        this.itemTitleGiamGia.value(data[indexGiamGia].title);
                        this.itemAbstractGiamGia.value(data[indexGiamGia].abstract);
                        this.editorGiamGia.html(data[indexGiamGia].content);
                        this.setState({ idGiamGia: data[indexGiamGia]._id });
                    } else {
                        this.itemTitleGiamGia.value(defaultTitleDiscountCode);
                        this.itemAbstractGiamGia.value(defaultAbstractDiscountCode);
                        this.editorGiamGia.html(defaultContentDiscountCode);
                    }
                    const indexThoiKhoaBieu = data.findIndex(template => template.state == 'thoiKhoaBieu');
                    if (indexThoiKhoaBieu != -1) {
                        this.itemTitleThoiKhoaBieu.value(data[indexThoiKhoaBieu].title);
                        this.itemAbstractThoiKhoaBieu.value(data[indexThoiKhoaBieu].abstract);
                        this.editorThoiKhoaBieu.html(data[indexThoiKhoaBieu].content);
                        this.setState({ idThoiKhoaBieu: data[indexThoiKhoaBieu]._id });
                    } else {
                        this.itemTitleThoiKhoaBieu.value(defaultTitleDangKyThoiKhoaBieu);
                        this.itemAbstractThoiKhoaBieu.value(defaultAbstractDangKyThoiKhoaBieu);
                        this.editorThoiKhoaBieu.html(defaultContentDangKyThoiKhoaBieu);
                    }
                    const indexHuyThoiKhoaBieu = data.findIndex(template => template.state == 'huyThoiKhoaBieu');
                    if (indexHuyThoiKhoaBieu != -1) {
                        this.itemTitleHuyThoiKhoaBieu.value(data[indexHuyThoiKhoaBieu].title);
                        this.itemAbstractHuyThoiKhoaBieu.value(data[indexHuyThoiKhoaBieu].abstract);
                        this.editorHuyThoiKhoaBieu.html(data[indexHuyThoiKhoaBieu].content);
                        this.setState({ idHuyThoiKhoaBieu: data[indexHuyThoiKhoaBieu]._id });
                    } else {
                        this.itemTitleHuyThoiKhoaBieu.value(defaultTitleHuyDangKyThoiKhoaBieu);
                        this.itemAbstractHuyThoiKhoaBieu.value(defaultAbstractHuyDangKyThoiKhoaBieu);
                        this.editorHuyThoiKhoaBieu.html(defaultContentHuyDangKyThoiKhoaBieu);
                    }
                } else {
                    this.itemTitleTotNghiep.value(defaultTitleTotNghiep);
                    this.itemAbstractTotNghiep.value(defaultAbstractTotNghiep);
                    this.editorTotNghiep.html(defaultContentTotNghiep);
                    this.itemTitleSatHach.value(defaultTitleSatHach);
                    this.itemAbstractSatHach.value(defaultAbstractSatHach);
                    this.editorSatHach.html(defaultContentSatHach);
                    this.itemTitleHoanTien.value(defaultTitleHoanTien);
                    this.itemAbstractHoanTien.value(defaultAbstractHoanTien);
                    this.editorHoanTien.html(defaultContentHoanTien);
                    this.itemTitleThanhToan.value(defaultTitleThanhToan);
                    this.itemAbstractThanhToan.value(defaultAbstractThanhToan);
                    this.editorThanhToan.html(defaultContentThanhToan);
                    this.itemTitleHuyOnTap.value(defaultTitleHuyOnTap);
                    this.itemAbstractHuyOnTap.value(defaultAbstractHuyOnTap);
                    this.editorHuyOnTap.html(defaultContentHuyOnTap);
                    this.itemTitleOnTap.value(defaultTitleOnTap);
                    this.itemAbstractOnTap.value(defaultAbstractOnTap);
                    this.editorOnTap.html(defaultContentOnTap);
                    this.itemTitleGiamGia.value(defaultTitleDiscountCode);
                    this.itemAbstractGiamGia.value(defaultAbstractDiscountCode);
                    this.editorGiamGia.html(defaultContentDiscountCode);
                    this.itemTitleThoiKhoaBieu.value(defaultTitleDangKyThoiKhoaBieu);
                    this.itemAbstractThoiKhoaBieu.value(defaultAbstractDangKyThoiKhoaBieu);
                    this.editorThoiKhoaBieu.html(defaultContentDangKyThoiKhoaBieu);
                    this.itemTitleHuyThoiKhoaBieu.value(defaultTitleHuyDangKyThoiKhoaBieu);
                    this.itemAbstractHuyThoiKhoaBieu.value(defaultAbstractHuyDangKyThoiKhoaBieu);
                    this.editorHuyThoiKhoaBieu.html(defaultContentHuyDangKyThoiKhoaBieu);
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
        } else if(index == 1) {
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
        } else if(index == 3) {
            const changes = {
                title: this.itemTitleThanhToan.value().trim(),
                abstract: this.itemAbstractThanhToan.value().trim(),
                content: this.editorThanhToan.html(),
                type: '0',
                state:'thanhToan'
            };
            if (this.state.idThanhToan) {
                this.props.updateNotificationTemplate(this.state.idThanhToan, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idThanhToan: data.item._id
                    });
                });
            }
        } else if(index == 4) {
            const changes = {
                title: this.itemTitleHuyOnTap.value().trim(),
                abstract: this.itemAbstractHuyOnTap.value().trim(),
                content: this.editorHuyOnTap.html(),
                type: '0',
                state:'huyOnTap'
            };
            if (this.state.idHuyOnTap) {
                this.props.updateNotificationTemplate(this.state.idHuyOnTap, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idHuyOnTap: data.item._id
                    });
                });
            }
        } else if(index == 5) {
            const changes = {
                title: this.itemTitleOnTap.value().trim(),
                abstract: this.itemAbstractOnTap.value().trim(),
                content: this.editorOnTap.html(),
                type: '0',
                state:'onTap'
            };
            if (this.state.idOnTap) {
                this.props.updateNotificationTemplate(this.state.idOnTap, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idOnTap: data.item._id
                    });
                });
            }
        } else if(index == 2){
            const changes = {
                title: this.itemTitleHoanTien.value().trim(),
                abstract: this.itemAbstractHoanTien.value().trim(),
                content: this.editorHoanTien.html(),
                type: '0',
                state:'hoanTien'
            };
            if (this.state.idHoanTien) {
                this.props.updateNotificationTemplate(this.state.idHoanTien, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idHoanTien: data.item._id
                    });
                });
            }
        } else if(index == 6){
            const changes = {
                title: this.itemTitleThoiKhoaBieu.value().trim(),
                abstract: this.itemAbstractThoiKhoaBieu.value().trim(),
                content: this.editorThoiKhoaBieu.html(),
                type: '0',
                state:'thoiKhoaBieu'
            };
            if (this.state.idThoiKhoaBieu) {
                this.props.updateNotificationTemplate(this.state.idThoiKhoaBieu, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idThoiKhoaBieu: data.item._id
                    });
                });
            }
        } else if(index == 7){
            const changes = {
                title: this.itemTitleHuyThoiKhoaBieu.value().trim(),
                abstract: this.itemAbstractHuyThoiKhoaBieu.value().trim(),
                content: this.editorHuyThoiKhoaBieu.html(),
                type: '0',
                state:'huyThoiKhoaBieu'
            };
            if (this.state.idHuyThoiKhoaBieu) {
                this.props.updateNotificationTemplate(this.state.idHuyThoiKhoaBieu, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idHuyThoiKhoaBieu: data.item._id
                    });
                });
            }
        }else {
            const changes = {
                title: this.itemTitleGiamGia.value().trim(),
                abstract: this.itemAbstractGiamGia.value().trim(),
                content: this.editorGiamGia.html(),
                type: '0',
                state:'giamGia'
            };
            if (this.state.idGiamGia) {
                this.props.updateNotificationTemplate(this.state.idGiamGia, changes);
            } else {
                this.props.createNotificationTemplate(changes, data => {
                    data && data.item && this.setState({
                        idGiamGia: data.item._id
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

        const hoanTienTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleHoanTien = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractHoanTien = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorHoanTien = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} readOnly={this.props.readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.save} /> : null}
            </div>
        );

        const thanhToanTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleThanhToan = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractThanhToan = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorThanhToan = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} readOnly={this.props.readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.save} /> : null}
            </div>
        );

        const huyOnTapTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleHuyOnTap = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractHuyOnTap = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorHuyOnTap = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} readOnly={this.props.readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.save} /> : null}
            </div>
        );

        const onTapTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleOnTap = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractOnTap = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorOnTap = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} readOnly={this.props.readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.save} /> : null}
            </div>
        );

        const thoiKhoaBieuTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleThoiKhoaBieu = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractThoiKhoaBieu = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorThoiKhoaBieu = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} readOnly={this.props.readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.save} /> : null}
            </div>
        );

        const huyThoiKhoaBieuTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleHuyThoiKhoaBieu = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractHuyThoiKhoaBieu = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorHuyThoiKhoaBieu = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} readOnly={this.props.readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.save} /> : null}
            </div>
        );

        const giamGiaTabs = (
            <div className='tile-body' id={this.props.id}>
                <FormTextBox ref={e => this.itemTitleGiamGia = e} label='Chủ đề' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAbstractGiamGia = e} listParams={listParams} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
                <FormEditor ref={e => this.editorGiamGia = e} height='600px' label='Nội dung' uploadUrl='/user/upload?category=notification' listParams={listParams} readOnly={this.props.readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.save} /> : null}
            </div>
        );

        const tabs = [
            { title: 'Thông báo thi tốt nghiệp', component: thiTotNghiepTabs },
            { title: 'Thông báo thi sát hạch', component: thiSatHachTabs },
            { title: 'Thông báo hoàn tiền', component: hoanTienTabs },
            { title: 'Thông báo thanh toán', component: thanhToanTabs },
            { title: 'Thông báo huỷ ôn tập', component: huyOnTapTabs },
            { title: 'Thông báo ôn tập', component: onTapTabs },
            { title: 'Thông báo thời khoá biểu', component: thoiKhoaBieuTabs },
            { title: 'Thông báo huỷ thời khoá biểu', component: huyThoiKhoaBieuTabs },
            { title: 'Thông báo mã code giảm giá', component: giamGiaTabs }
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