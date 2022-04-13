import React from 'react';
import { connect } from 'react-redux';
import { createCourse, createDefaultCourse,exportSatHachs } from './redux';
import { getCourseTypeAll, ajaxSelectCourseType } from '../fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, FormTabs, CirclePageButton, renderTable,TableCell } from 'view/component/AdminPage';
import AdminCourseFilterView from './adminCourseFilterView';
import FileSaver from 'file-saver';
class CourseModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = () => {
        this.itemName.value('');
        this.itemCourseType.value(null);
    }

    onSubmit = () => {
        const data = {
            name: this.itemName.value(),
            courseType: this.itemCourseType.value(),
        };
        if (data.name == '') {
            T.notify('Tên khóa học bị trống!', 'danger');
            this.itemName.focus();
        } else if (data.courseType == '') {
            T.notify('Loại khóa học bị trống!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.create(data, data => {
                this.hide();
                data.item && this.props.history.push('/user/course/' + data.item._id);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Khóa học mới',
        body: <>
            <FormTextBox ref={e => this.itemName = e} label='Tên khóa học' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemCourseType = e} label='Loại khóa học' data={ajaxSelectCourseType} readOnly={this.props.readOnly} />
        </>,
    });
}

class ExportModal extends AdminModal {
    state = { satHachs:[] };
    componentDidMount() {
        T.ready(() => this.onShown(() => {}));
    }

    onShow = () => {
        this.setState({satHachs:this.props.satHachs});
    }

    delete = (e,item) => {
        e.preventDefault();
        let satHachs = this.state.satHachs.filter(student=>student._id!=item._id);
        this.setState({satHachs});
        this.props.updateState({satHachs});
    }


    render = () => {
        const satHachs = this.state.satHachs;
        const tableUser = renderTable({
            getDataSource: () => satHachs,
            stickyHead:true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Khóa học</th>
                    <th style={{ width: '100%' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khai giảng</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Bế giảng</th> */}
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày đk sát hạch</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='text' content={item.courseType.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.numberOfStudent || 0} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thoiGianKhaiGiang} />
                    {/* <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thoiGianBeGiang||null} /> */}
                    {/* <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thoiGianDangKySatHach||null} /> */}
                    <TableCell type='buttons' content={{ item, index }} permission={{ delete: true }} onDelete={e=>this.delete(e,item)} />
                </tr>),
        });
        return this.renderModal({
        title: 'In biên bản sát hạch lái xe',
        dataBackdrop: 'static',
        size: 'large',
        body: (<div>
                <div className='tile-body'>{tableUser}</div>
            </div>),
        buttons:
        satHachs && satHachs.length ?<>
            <button className='btn btn-success' style={{ textAlign: 'right' }}
            onClick={(e)=>this.props.exportFinal(e,'dangKy',this.hide)}>Đăng ký sát hạch lái xe</button>
            <button className='btn btn-primary' style={{ textAlign: 'right' }}
            onClick={(e)=>this.props.exportFinal(e,'deNghi',this.hide)}>Đề nghị sát hạch lái xe</button>
        </>  : null
    });
    }
}

class CoursePage extends AdminPage {
    state = {satHachs:[]};
    componentDidMount() {
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ courseTypes });
        });
        T.ready();
    }

    exportFinal = (e,type,done)=>{
        e.preventDefault();
        const listCourseId = this.state.satHachs.map(item=>item._id);
        this.props.exportSatHachs(listCourseId,type, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Báo cáo đăng ký sát hạch lái xe.docx');
            this.setState({listCourseId:[]});
            done && done();
        });
    }

    updateSatHachs = (course,value)=>{
        if(value) this.setState(prevState=>({satHachs:[...prevState.satHachs,course]}));
        else this.setState(prevState=>({satHachs:prevState.satHachs.filter(item=>item._id!=course._id)}));
    }

    updateState = (newItem)=>{
        this.setState({...newItem});
    }

    create = e => e.preventDefault() || this.modal.show();

    render() {
        const permission = this.getUserPermission('course'),
            readOnly = (!permission.write || this.props.system.user.isLecturer) && (this.props.system.user && !this.props.system.user.isCourseAdmin);
        const courseTypes = this.state.courseTypes ? this.state.courseTypes : [];
        const tabs = courseTypes.length ? courseTypes.map(courseType => ({ title: courseType.text, component: <AdminCourseFilterView courseFilter={courseType.course} satHachs={this.state.satHachs} onSelectSatHach={this.updateSatHachs} courseType={courseType.id} readOnly={readOnly} /> })) : [];
        tabs.push({ title: 'Khóa cơ bản', component: <AdminCourseFilterView courseType={'defaultCourse'} readOnly={true} /> });
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học',
            breadcrumb: ['Khóa học'],
            content: <>
                <FormTabs id='coursePageTab' contentClassName='tile' tabs={tabs} />
                {this.state.satHachs && this.state.satHachs.length ?<CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-print' style={{ right: '140px' }} onClick={(e)=>e.preventDefault()||this.exportModal.show()} />:null}
                
                <CourseModal create={this.props.createCourse} ref={e => this.modal = e} history={this.props.history} readOnly={!permission.write} />
                {!readOnly && <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-refresh' style={{ right: '75px' }} onClick={() => this.props.createDefaultCourse()} />}
                <ExportModal ref={e => this.exportModal = e} exportFinal={this.exportFinal}  updateState={this.updateState} satHachs={this.state.satHachs} />
            
            </>,
            onCreate: !readOnly ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { createCourse, getCourseTypeAll, createDefaultCourse, exportSatHachs };
export default connect(mapStateToProps, mapActionsToProps)(CoursePage);
