using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace Backend.Api.Infrastructure.Email;

public class EmailSender(IOptions<SmtpSettings> options)
{
    private readonly SmtpSettings settings = options.Value;

    public async Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken)
    {
        using var client = new SmtpClient(settings.Host, settings.Port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(settings.Username, settings.Password)
        };

        using var message = new MailMessage
        {
            From = new MailAddress(settings.FromEmail, settings.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };
        message.To.Add(toEmail);

        await client.SendMailAsync(message, cancellationToken);
    }
}
