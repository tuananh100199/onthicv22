// Export to Excel ----------------------------------------------------------------------------------------------------
module.exports = (app) => {
app.get('/api/facility/info/export/:filterKey/:type', app.permission.check('facility:export'), (req, res) => {
    let { filterKey, type } = req.params,
        condition = {};
    const sessionUser = req.session.user,
        division = sessionUser.division;
    if(type && type != '0') condition.type = type;
    if(filterKey && filterKey != '0') condition.status = filterKey;
    if (sessionUser && sessionUser.isCourseAdmin && division && division.isOutside) {
        res.send({ error: 'Bạn không có quyền xuất file excel này!' });
    } else {
        app.model.facility.getPage(undefined, undefined, condition, (error, page) => {
            if (error || !page.list) {
                res.send({ error: 'Hệ thống bị lỗi!' });
            } else {
                const workbook = app.excel.create(), worksheet = workbook.addWorksheet('Danh sách cơ sở vật chất');
                const cells = [
                    { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B1', value: 'Tên', bold: true, border: '1234' },
                    { cell: 'C1', value: 'Loại cơ sở', bold: true, border: '1234' },
                    { cell: 'D1', value: 'Số lượng học viên tối đa', bold: true, border: '1234' },
                    { cell: 'E1', value: 'Tình trạng', bold: true, border: '1234' },
                ];
                worksheet.columns = [
                    { header: 'STT', key: '_id', width: 15 },
                    { header: 'Tên', key: 'name', width: 15 },
                    { header: 'Loại cơ sở', key: 'type', width: 15 },
                    { header: 'Số lượng', key: 'maxStudent', width: 30 },
                    { header: 'Tình trạng', key: 'status', width: 15 },
                ];
                page.list.forEach((facility, index) => {
                    worksheet.addRow({
                        _id: index + 1,
                        name: facility.name,
                        type: facility.type && facility.type.title,
                        maxStudent: facility.maxStudent,
                        status: '',
                    });
                });
                app.excel.write(worksheet, cells);
                app.excel.attachment(workbook, res, 'Danh sách cơ sở vật chất.xlsx');
            }
        });
    }
});

};
