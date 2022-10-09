import React from 'react';
import { connect } from 'react-redux';
import { getGioiThieu, updateGioiThieu } from './redux/reduxGioiThieuHiepPhat';
import { AdminPage, FormRichTextBox, FormTextBox, FormCheckbox, FormImageBox, FormSelect } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import {ajaxSelectContent} from './redux/reduxContent';
class ContentEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/gioi-thieu/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getGioiThieu(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const { _id, title, titleVisible = true, abstract, abstract2, abstract3, image1 = '/img/avatar.jpg', image2 = '/img/avatar.jpg', image3 = '/img/avatar.jpg',content1=null,content2=null,content3=null } = data.item;
                    this.itemTitle.focus();
                    this.itemTitle.value(title);
                    this.itemAbstract.value(abstract);
                    this.itemAbstract2.value(abstract2 ? abstract2 : abstract);
                    this.itemAbstract3.value(abstract3 ? abstract3 : abstract);
                    this.itemTitleVisible.value(titleVisible);
                    this.imageBox1.setData('gioi-thieu1:' + _id, image1);
                    this.imageBox2.setData('gioi-thieu2:' + _id, image2);
                    this.imageBox3.setData('gioi-thieu3:' + _id, image3);
                    this.itemContent1.value(content1?{id:content1._id,text:content1.title}:null);
                    this.itemContent2.value(content2?{id:content2._id,text:content2.title}:null);
                    this.itemContent3.value(content3?{id:content3._id,text:content3.title}:null);

                    this.setState({ _id, title, image1, image2, image3 });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    save = () =>{
        let changes = {
            title: this.itemTitle.value().trim(),
            titleVisible: this.itemTitleVisible.value() ? 1 : 0,
            abstract: this.itemAbstract.value(),
            abstract2: this.itemAbstract2.value(),
            abstract3: this.itemAbstract3.value(),
        };

        this.itemContent1.value() && this.itemContent1.value()!='' && Object.assign(changes,{content1:this.itemContent1.value()});
        this.itemContent2.value() && this.itemContent2.value()!='' && Object.assign(changes,{content2:this.itemContent2.value()});
        this.itemContent3.value() && this.itemContent3.value()!='' && Object.assign(changes,{content3:this.itemContent3.value()});

        this.props.updateGioiThieu(this.state._id,changes );
    } 


    render() {
        const permission = this.getUserPermission('component');
        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Giới thiệu Hiệp Phát: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to='/user/component'>Thành phần giao diện</Link>, 'Giới thiệu Hiệp Phát'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-8'>
                            <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                            <FormCheckbox ref={e => this.itemTitleVisible = e} label='Hiển thị tiêu đề' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.itemAbstract = e} label='Mô tả ngắn hình 1' readOnly={!permission.write} />
                            <FormSelect ref={e => this.itemContent1 = e} data={ajaxSelectContent} label='Bài viết hình 1' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.itemAbstract2 = e} label='Mô tả ngắn hình 2' readOnly={!permission.write} />
                            <FormSelect ref={e => this.itemContent2 = e} data={ajaxSelectContent} label='Bài viết hình 1' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.itemAbstract3 = e} label='Mô tả ngắn hình 3' readOnly={!permission.write} />
                            <FormSelect ref={e => this.itemContent3 = e} data={ajaxSelectContent} label='Bài viết hình 1' readOnly={!permission.write} />
                        </div>
                        <div className='col-md-4'>
                            <FormImageBox ref={e => this.imageBox1 = e} label='Hình 1' uploadType='GioiThieuImage1' image={this.state.image1} readOnly={!permission.write} />
                            <FormImageBox ref={e => this.imageBox2 = e} label='Hình 2' uploadType='GioiThieuImage2' image={this.state.image2} readOnly={!permission.write} />
                            <FormImageBox ref={e => this.imageBox3 = e} label='Hình 3' uploadType='GioiThieuImage3' image={this.state.image3} readOnly={!permission.write} />
                        </div>

                        {/* <FormEditor className='col-md-12' ref={e => this.editor = e} height='400px' label='Nội dung' uploadUrl='/user/upload?category=content' readOnly={!permission.write} /> */}
                    </div>
                </div>),
            backRoute: '/user/component',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getGioiThieu, updateGioiThieu };
export default connect(mapStateToProps, mapActionsToProps)(ContentEditPage);