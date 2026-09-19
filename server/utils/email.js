// Resend-ის HTTP API გამოიყენება nodemailer/SMTP-ის ნაცვლად, რადგან Render-ის უფასო
// tier-ზე გამავალი SMTP პორტები (587/465) ბლოკილია და კავშირი უბრალოდ იკიდება/timeout-დება.
// Resend HTTPS-ზე მუშაობს, ამიტომ ეს შეზღუდვა არ ეხება.
const sendEmail = async options => {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'ShopSpace <onboarding@resend.dev>',
            to: [options.email],
            subject: options.subject,
            text: options.message,
            html: options.html,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend API error (${response.status}): ${body}`);
    }
};

module.exports = sendEmail;
