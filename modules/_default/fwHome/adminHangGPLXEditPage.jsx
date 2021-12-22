import React from 'react';
import { connect } from 'react-redux';
import { getHangGPLX, updateHangGPLX } from './redux/reduxHangGPLX';
import { AdminPage, FormRichTextBox, FormTextBox, FormCheckbox, FormImageBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class HangGPLXEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/hang-gplx/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getHangGPLX(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const { _id, title, titleVisible = true, abstract, image1 = '/img/avatar.jpg', image2 = '/img/avatar.jpg', image3 = '/img/avatar.jpg' } = data.item;
                    this.itemTitle.focus();
                    this.itemTitle.value(title);
                    this.itemAbstract.value(abstract);
                    this.itemTitleVisible.value(titleVisible);
                    this.imageBox1.setData('hang1:' + _id, image1);
                    this.imageBox2.setData('hang2:' + _id, image2);
                    this.imageBox3.setData('hang3:' + _id, image3);
                    this.setState({ _id, title, image1, image2, image3 });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    save = () => this.props.updateHangGPLX(this.state._id, {
        title: this.itemTitle.value().trim(),
        titleVisible: this.itemTitleVisible.value() ? 1 : 0,
        abstract: this.itemAbstract.value(),
    });

    render() {
        const permission = this.getUserPermission('component');
        console.log(this.state.title);
        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Hạng giấy phép lái xe: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to='/user/component'>Thành phần giao diện</Link>, 'Hạng giấy phép lái xe'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-8'>
                            <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                            <FormCheckbox ref={e => this.itemTitleVisible = e} label='Hiển thị tiêu đề' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.itemAbstract = e} label='Mô tả ngắn' readOnly={!permission.write} />
                        </div>
                        <div className='col-md-4'>
                            <FormImageBox ref={e => this.imageBox1 = e} label='Hình 1' uploadType='HangGPLXImage1' image={this.state.image1} readOnly={!permission.write} />
                            <FormImageBox ref={e => this.imageBox2 = e} label='Hình 2' uploadType='HangGPLXImage2' image={this.state.image2} readOnly={!permission.write} />
                            <FormImageBox ref={e => this.imageBox3 = e} label='Hình 3' uploadType='HangGPLXImage3' image={this.state.image3} readOnly={!permission.write} />
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
const mapActionsToProps = { getHangGPLX, updateHangGPLX };
export default connect(mapStateToProps, mapActionsToProps)(HangGPLXEditPage);