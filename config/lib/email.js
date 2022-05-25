module.exports = app => {
    const nodemailer = require('nodemailer');
    app.email.sendEmail = (mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments, successCallback, errorCallback) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: { user: mailFrom, pass: mailFromPassword },
            debug: true
        });
        transporter.on('log', console.log);

        const mailOptions = {
            from: mailFrom,
            cc: mailCc?mailCc.toString():null,
            to: mailTo,
            subject: mailSubject,
            text: mailText,
            html: mailHtml,
            attachments: mailAttachments
        };
        transporter.sendMail(mailOptions, error => {
            if (error) {
                console.error(error);
                if (errorCallback) errorCallback(error);
            } else {
                console.log('Send mail to ' + mailTo + ' successful.');
                if (successCallback) successCallback();
            }
        });
    };

    app.email.validateEmail = email => {
        const atPos = email.indexOf('@'), dotPos = email.lastIndexOf('.');
        return (atPos < 1 || dotPos < atPos + 2 || dotPos + 2 >= email.length);
    };
};