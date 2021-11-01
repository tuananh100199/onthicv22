module.exports = (app) => {

    app.put('/api/course/import-final-score', app.permission.check('course:write'), (req, res) => {
        const sessionUser = req.session.user, division = sessionUser.division;
        if (sessionUser && sessionUser.isCourseAdmin && division && !division.isOutside) {
            const { scores, course } = req.body;
            let err = null;
            if (scores && scores.length > 0) {
                const handleImportScore = (index = 0) => {
                    if (index == scores.length) {
                        res.send({ error: err });
                    } else {
                        const { identityCard, diemThiHetMon, diemTrungBinhThiHetMon } = scores[index];
                        app.model.student.get({ identityCard, course }, (error, item) => {
                            if (error || !item) {
                                err = error;
                                handleImportScore(index + 1);
                            } else {
                                item.diemThiHetMon = diemThiHetMon;
                                item.diemTrungBinhThiHetMon = diemTrungBinhThiHetMon;
                                item.modifiedDate = new Date();
                                item.save((error, student) => {
                                    if (error || !student) {
                                        err = error;
                                    }
                                    handleImportScore(index + 1);
                                });
                            }
                        });
                    }
                };
                handleImportScore();
            } else {
                res.send({ error: 'Danh sách điểm thi hết môn trống!' });
            }
        } else {
            res.send({ error: 'Bạn không có quyền import điểm thi hết môn!' });
        }

    });

    app.put('/api/course/import-score', app.permission.check('student:write'), (req, res) => {
        const { score, courseId } = req.body;
        let err = null;
        if (score && score.length) {
            const handleImportScore = (index = 0) => {
                if (index == score.length) {
                    res.send({ error: err });
                } else {
                    const student = score[index];
                    app.model.student.get({ identityCard: student.identityCard, course: courseId }, (error, item) => {
                        if (error || !item) {
                            err = error;
                            handleImportScore(index + 1);
                        } else {
                            item.diemThiTotNghiep = student.diemThiTotNghiep;
                            item.save();
                            handleImportScore(index + 1);
                        }
                    });
                }
            };
            handleImportScore();
        } else {
            res.send({ error: 'Danh sách điểm thi tốt nghiệp  trống!' });
        }
    });

    // Hook upload diem thi tot nghiep---------------------------------------------------------------------------------------
    app.uploadHooks.add('uploadExcelDiemThiTotNghiepFile', (req, fields, files, params, done) => {
        if (files.DiemThiTotNghiepFile && files.DiemThiTotNghiepFile.length > 0 && fields.userData && fields.userData.length > 0) {
            console.log('Hook: uploadExcelDiemThiTotNghiepFile => your excel score file upload');
            const srcPath = files.DiemThiTotNghiepFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                app.deleteFile(srcPath);
                if (workbook) {
                    const userData = fields.userData[0], userDatas = userData.split(':'), worksheet = workbook.getWorksheet(1), data = [],
                        get = (row, col) => worksheet.getCell(`${col}${row}`).value;
                    const handleUpload = (index = parseInt(userDatas[1])) => {
                        if (index > parseInt(userDatas[2])) {
                            done({ data });
                        } else {
                            const diemThiTotNghiep = [],
                                diemLiet = [];
                            userDatas.slice(4).forEach((col) => {
                                if (col.startsWith('Liet')) {
                                    const cols = col.split('|'),
                                        _id = cols[0].slice(4);
                                    get(index, cols[1]) && diemLiet.push(_id);
                                } else {
                                    diemThiTotNghiep.push({ col, point: get(index, col) });
                                }
                            });
                            data.push({
                                identityCard: get(index, userDatas[3]),
                                diemThiTotNghiep: diemThiTotNghiep,
                                diemLiet: diemLiet

                            });
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    done({ error: 'Error' });
                }
            });
        }
    });

    // Hook upload final score excel---------------------------------------------------------------------------------------
    app.uploadHooks.add('uploadExcelFinalScoreFile', (req, fields, files, params, done) => {
        if (files.FinalScoreFile && files.FinalScoreFile.length > 0 && fields.userData && fields.userData.length > 0 && fields.userData[0].startsWith('FinalScoreFile:')) {
            console.log('Hook: uploadExcelFinalScoreFile => your excel final score file upload');
            const srcPath = files.FinalScoreFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                app.deleteFile(srcPath);
                if (workbook) {
                    const userData = fields.userData[0], userDatas = userData.split(':'), worksheet = workbook.getWorksheet(1), data = [],
                        // toDateObject = str => {
                        //     const dateParts = str.split("/");
                        //     return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                        // },
                        get = (row, col) => worksheet.getCell(`${col}${row}`).value;
                    const handleUpload = (index = parseInt(userDatas[1])) => { //index =start
                        if (index > parseInt(userDatas[2])) { // index to stop loop
                            done({ data, notify: 'Tải lên file điểm thi hết môn thành công' });
                        } else {
                            data.push({
                                identityCard: get(index, userDatas[3]),
                                diemThiHetMon: userDatas.slice(4).map((col) => ({ col, point: get(index, col) })),
                            });
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    done({ error: 'Đọc file Excel bị lỗi!' });
                }
            });
        }
    });
};