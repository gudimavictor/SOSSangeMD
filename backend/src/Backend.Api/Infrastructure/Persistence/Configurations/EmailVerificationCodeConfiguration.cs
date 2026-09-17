using Backend.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Infrastructure.Persistence.Configurations;

public class EmailVerificationCodeConfiguration : IEntityTypeConfiguration<EmailVerificationCode>
{
    public void Configure(EntityTypeBuilder<EmailVerificationCode> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Email).HasMaxLength(320).IsRequired();
        builder.Property(c => c.Code).HasMaxLength(6).IsRequired();

        builder.HasIndex(c => c.Email);

        builder.Ignore(c => c.IsActive);
    }
}
